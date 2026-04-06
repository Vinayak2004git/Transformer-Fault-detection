from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import random
import time

app = Flask(__name__)
CORS(app)

# ===============================
# 🔗 MongoDB Connection
# ===============================
client = MongoClient("mongodb+srv://admin:admin123@cluster0.wrvkipm.mongodb.net/?retryWrites=true&w=majority")
db = client["transformer_db"]

transformers_collection = db["transformers"]
fault_logs_collection = db["fault_logs"]
saved_states_collection = db["saved_states"]

# ===============================
# ⚙️ GLOBAL VARIABLES
# ===============================
last_fault_time = 0
current_fault_transformer = None

# ===============================
# 🔥 GENERATE DATA
# ===============================
def generate_transformer_data(tid):
    global last_fault_time, current_fault_transformer

    current_time = time.time()

    # 🔁 Change fault every 20 sec
    if current_time - last_fault_time > 20:
        current_fault_transformer = random.randint(1, 5)
        last_fault_time = current_time

    BASE_TEMP = 65
    BASE_LOAD = 50
    BASE_OIL = 85

    # 🔹 Get last value from DB
    prev = transformers_collection.find_one(
        {"id": tid},
        sort=[("time", -1)]
    )

    if prev:
        temperature = prev["temperature"]
        load = prev["load"]
        oil = prev["oil"]
    else:
        temperature = BASE_TEMP
        load = BASE_LOAD
        oil = BASE_OIL

    # 🔥 FAULT BEHAVIOR
    if tid == current_fault_transformer:
        temperature += 3
        load += 4
        oil -= 0.5
    else:
        # ✅ NORMAL BEHAVIOR
        temperature += (BASE_TEMP - temperature) * 0.15
        load += (BASE_LOAD - load) * 0.15
        oil += (BASE_OIL - oil) * 0.1

    # Clamp
    temperature = round(max(50, min(100, temperature)), 2)
    load = round(max(20, min(100, load)), 2)
    oil = round(max(40, min(100, oil)), 2)

    # 🎯 STATUS
    if temperature > 90 or load > 95:
        status = "Critical"
    elif temperature > 75 or load > 80:
        status = "Warning"
    else:
        status = "Healthy"

    health = int(100 - (temperature * 0.4 + load * 0.3 + (100 - oil) * 0.3))

    data = {
        "id": tid,
        "temperature": temperature,
        "load": load,
        "oil": oil,
        "health": health,
        "status": status,
        "time": int(current_time)
    }

    # 💾 STORE
    transformers_collection.insert_one(data)

    # 🚨 FAULT LOG
    if status == "Critical":
        fault_logs_collection.insert_one(data)

    return data

# ===============================
# 📊 MAIN DASHBOARD
# ===============================
@app.route("/api/transformers")
def get_transformers():

    data = []

    for i in range(1, 6):
        new_data = generate_transformer_data(i)

        # 🔥 (SAFE CHECK – usually not needed but kept)
        if "_id" in new_data:
            new_data["_id"] = str(new_data["_id"])

        data.append(new_data)

    return jsonify({"transformers": data})

# ===============================
# 📈 DETAILS PAGE
# ===============================
@app.route("/api/transformer/<int:tid>")
def get_transformer_details(tid):

    generate_transformer_data(tid)

    history = list(
        transformers_collection
        .find({"id": tid})
        .sort("time", -1)
        .limit(20)
    )

    for h in history:
        h["_id"] = str(h["_id"])

    return jsonify({
        "current": history[0] if history else None,
        "history": history[::-1]
    })

# ===============================
# 📜 FAULT LOGS
# ===============================
@app.route("/api/faultlogs")
def get_fault_logs():

    logs = list(
        fault_logs_collection
        .find()
        .sort("time", -1)
    )

    for log in logs:
        log["_id"] = str(log["_id"])

    return jsonify(logs)

# ===============================
# 💾 SAVE STATE
# ===============================
@app.route("/api/save_state", methods=["POST"])
def save_state():

    snapshot = []

    for i in range(1, 6):
        last = transformers_collection.find_one(
            {"id": i},
            sort=[("time", -1)]
        )

        if last:
            last["_id"] = str(last["_id"])
            snapshot.append(last)
        else:
            snapshot.append({
                "id": i,
                "temperature": 0,
                "load": 0,
                "oil": 0,
                "health": 0,
                "status": "No Data"
            })

    data = {
        "time": int(time.time()),
        "transformers": snapshot
    }

    saved_states_collection.insert_one(data)

    return jsonify({"message": "saved"})

# ===============================
# 📂 GET SAVED STATES
# ===============================
@app.route("/api/saved_states")
def get_saved_states():

    states = list(
        saved_states_collection
        .find()
        .sort("time", -1)
    )

    for s in states:
        s["_id"] = str(s["_id"])

    return jsonify(states)

# ===============================
# ❌ DELETE STATE
# ===============================
@app.route("/api/delete_state/<id>", methods=["DELETE"])
def delete_state(id):

    saved_states_collection.delete_one({"_id": ObjectId(id)})

    return jsonify({"message": "deleted"})

# ===============================
# ▶️ RUN SERVER
# ===============================
if __name__ == "__main__":
   app.run(host="0.0.0.0", port=5000, debug=True)