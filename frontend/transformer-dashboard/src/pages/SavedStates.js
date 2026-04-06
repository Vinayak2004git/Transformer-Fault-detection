
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function SavedStates() {

  const [states, setStates] = useState([]);

  const fetchStates = () => {
    axios.get(" 10.249.64.248:5000/api/saved_states")
      .then(res => {
        console.log(res.data); // 🔍 DEBUG
        setStates(res.data);   // ✅ correct
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchStates();
  }, []);

  return (
    <div style={{
      padding: "40px",
      background: "#0f172a",
      minHeight: "100vh",
      color: "white"
    }}>

      <Link to="/">← Back</Link>

      <h1 style={{ marginTop: "20px" }}>📂 Saved States</h1>

      {states.length === 0 ? (
        <p>No saved states yet.</p>
      ) : (
        states.map((state, index) => (

          <div key={index} style={{
            marginTop: "20px",
            padding: "20px",
            background: "#1e293b",
            borderRadius: "10px"
          }}>

            <h3>
              {new Date(state.time * 1000).toLocaleString()}
            </h3>

            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>

              {state.transformers.map(t => (

                <div key={t.id} style={{
                  padding: "10px",
                  background: "#020617",
                  borderRadius: "8px",
                  width: "180px",
                  borderLeft: `4px solid ${
                    t.status === "Critical"
                      ? "red"
                      : t.status === "Warning"
                      ? "yellow"
                      : "limegreen"
                  }`
                }}>

                  <strong>Transformer {t.id}</strong>
                  <p>Status: {t.status}</p>
                  <p>Temp: {t.temperature} °C</p>
                  <p>Load: {t.load} %</p>
                  <p>Health: {t.health}</p>

                </div>

              ))}

            </div>

          </div>

        ))
      )}

    </div>
  );
}

export default SavedStates;