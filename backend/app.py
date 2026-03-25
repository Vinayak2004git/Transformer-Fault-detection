
from flask import Flask, jsonify
from flask_cors import CORS
import random
import time

app = Flask(__name__)
CORS(app)

transformer_history = {i: [] for i in range(1, 6)}
fault_logs = []
saved_states = []

last_fault_time = 0
current_fault_transformer = None


def generate_transformer_data(tid):
    global last_fault_time, current_fault_transformer

    current_time = time.time()

    # 🔁 Change fault every 20 sec
    if current_time - last_fault_time > 20:
        current_fault_transformer = random.randint(1, 5)
        last_fault_time = current_time

    # 🎯 FIXED BASE OPERATING POINT
    BASE_TEMP = 65
    BASE_LOAD = 50
    BASE_OIL = 85

    # 🔹 Get previous or initialize
    if transformer_history[tid]:
        prev = transformer_history[tid][-1]
        temperature = prev["temperature"]
        load = prev["load"]
        oil = prev["oil"]
    else:
        temperature = BASE_TEMP
        load = BASE_LOAD
        oil = BASE_OIL

    # ===============================
    # 🔥 FAULT BEHAVIOR (CONTROLLED)
    # ===============================
    if tid == current_fault_transformer:
        # steady rise → like overload heating
        temperature += 3
        load += 4
        oil -= 0.5

    # ===============================
    # ✅ NORMAL BEHAVIOR (STABLE)
    # ===============================
    else:
        # return to base smoothly
        temperature += (BASE_TEMP - temperature) * 0.15
        load += (BASE_LOAD - load) * 0.15
        oil += (BASE_OIL - oil) * 0.1

    # Clamp values
    temperature = round(max(50, min(100, temperature)), 2)
    load = round(max(20, min(100, load)), 2)
    oil = round(max(40, min(100, oil)), 2)

    # ===============================
    # 🎯 FIXED THRESHOLD LOGIC
    # ===============================
    if temperature > 90 or load > 95:
        status = "Critical"
    elif temperature > 75 or load > 80:
        status = "Warning"
    else:
        status = "Healthy"

    # Health calculation
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

    transformer_history[tid].append(data)

    if len(transformer_history[tid]) > 20:
        transformer_history[tid].pop(0)

    # Log only real critical events
    if status == "Critical":
        fault_logs.append(data)

    return data
# 🔹 MAIN DASHBOARD
@app.route("/api/transformers")
def get_transformers():
    return jsonify({
        "transformers": [generate_transformer_data(i) for i in range(1, 6)]
    })


# 🔹 DETAILS PAGE
@app.route("/api/transformer/<int:tid>")
def get_transformer_details(tid):
    generate_transformer_data(tid)

    return jsonify({
        "current": transformer_history[tid][-1],
        "history": transformer_history[tid]
    })


# 🔹 LOGS
@app.route("/api/faultlogs")
def get_fault_logs():
    return jsonify(fault_logs)


# 🔹 SAVE STATE
@app.route("/api/save_state", methods=["POST"])
def save_state():

    snapshot = []

    for i in range(1, 6):
        if transformer_history[i]:
            snapshot.append(transformer_history[i][-1])
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

    saved_states.append(data)

    return jsonify({"message": "saved"})

# 🔹 GET SAVED
@app.route("/api/saved_states")
def get_saved_states():
    return jsonify(saved_states)


# 🔹 DELETE
@app.route("/api/delete_state/<int:index>", methods=["DELETE"])
def delete_state(index):
    if 0 <= index < len(saved_states):
        saved_states.pop(index)
        return jsonify({"message": "deleted"})
    return jsonify({"error": "invalid"})


if __name__ == "__main__":
    app.run(debug=True)