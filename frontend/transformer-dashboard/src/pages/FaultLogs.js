
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function FaultLogs() {

  const [logs, setLogs] = useState([]);

  useEffect(() => {

    const fetchLogs = () => {
      axios.get("http://127.0.0.1:5000/api/faultlogs")
        .then(res => setLogs(res.data))
        .catch(err => console.log(err));
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);

    return () => clearInterval(interval);

  }, []);

  return (
    <div style={{ padding: "40px", background: "#0f172a", minHeight: "100vh", color: "white" }}>

      <Link to="/" style={{ color: "#38bdf8" }}>← Back</Link>

      <h1 style={{ marginTop: "20px" }}>
        🚨 Auto Severity Log
      </h1>

      <div style={{
        marginTop: "30px",
        background: "#1e293b",
        borderRadius: "10px",
        padding: "20px"
      }}>

        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "center"
        }}>

          {/* HEADER */}
          <thead>
            <tr style={{ color: "#38bdf8" }}>
              <th style={{ padding: "10px" }}>Timestamp</th>
              <th style={{ padding: "10px" }}>Transformer</th>
              <th style={{ padding: "10px" }}>Temperature (°C)</th>
              <th style={{ padding: "10px" }}>Load (%)</th>
              <th style={{ padding: "10px" }}>Oil (%)</th>
              <th style={{ padding: "10px" }}>Health</th>
            </tr>
          </thead>

          {/* DATA */}
          <tbody>
            {logs.slice().reverse().map((log, i) => (

              <tr key={i} style={{ borderTop: "1px solid #334155" }}>

                {/* LEFTMOST TIMESTAMP */}
                <td style={{ padding: "10px", fontFamily: "monospace", color: "#22c55e" }}>
                  {new Date(log.time * 1000).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  })}
                </td>

                <td>{log.id}</td>
                <td>{log.temperature}</td>
                <td>{log.load}</td>
                <td>{log.oil}</td>
                <td>{log.health}</td>

              </tr>

            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}

export default FaultLogs;