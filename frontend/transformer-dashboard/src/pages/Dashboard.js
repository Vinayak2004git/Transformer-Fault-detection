import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Dashboard() {

  const [transformers, setTransformers] = useState([]);
  const [time, setTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const prevCriticalRef = useRef(false);
  const audioRef = useRef(null);

  // 🔊 Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/4_beep_alarm.mp3");
    audioRef.current.loop = true;
  }, []);

  // 🔓 Unlock audio
  useEffect(() => {
    const unlockAudio = () => {
      if (!audioRef.current) return;

      audioRef.current.play()
        .then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setAudioEnabled(true);
        })
        .catch(() => {});

      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
  }, []);

  // 🔄 FETCH DATA FROM BACKEND (FIXED)
  useEffect(() => {

    const fetchData = async () => {
      try {
        const res = await axios.get("http://10.249.64.248:5000/api/transformers");

        // ✅ FIX: always take correct format
        const data = res.data.transformers;

        if (!data || !Array.isArray(data)) return;

        const hasCritical = data.some(t => t.status === "Critical");

        // 🔊 PLAY SOUND
        if (hasCritical && !prevCriticalRef.current && audioEnabled && !isMuted) {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        }

        // 🔇 STOP SOUND
        if (!hasCritical && prevCriticalRef.current) {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }

        prevCriticalRef.current = hasCritical;

        // ✅ UPDATE STATE (IMPORTANT FIX)
        setTransformers([...data]);

      } catch (err) {
        console.error("API ERROR:", err);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 2000); // 🔥 faster real-time

    return () => clearInterval(interval);

  }, [audioEnabled, isMuted]);

  // ⏰ Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getBorderColor = (status) => {
    if (status === "Critical") return "red";
    if (status === "Warning") return "yellow";
    return "limegreen";
  };

  const getGlow = (status) => {
    if (status === "Critical") return "0 0 20px red";
    if (status === "Warning") return "0 0 10px yellow";
    return "none";
  };

  return (
    <div style={{ padding: "40px", background: "#0f172a", minHeight: "100vh", color: "white" }}>

      <h1>⚡ Transformer Monitoring Dashboard</h1>

      {/* TIME */}
      <div style={{ marginTop: "10px" }}>
        <p style={{
          fontSize: "22px",
          color: "#22c55e",
          fontFamily: "monospace",
          background: "#020617",
          padding: "8px 16px",
          display: "inline-block",
          borderRadius: "6px",
          border: "1px solid #22c55e"
        }}>
          SYSTEM TIME: {time.toLocaleTimeString()}
        </p>

        <p style={{
          marginTop: "8px",
          fontSize: "16px",
          color: "#38bdf8",
          fontFamily: "monospace"
        }}>
          DATE: {time.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          })}
        </p>
      </div>

      {/* ALERT */}
      {transformers.length > 0 && transformers.some(t => t.status === "Critical") && (
        <div style={{
          marginTop: "20px",
          padding: "15px",
          background: "rgba(255,0,0,0.8)",
          borderRadius: "10px",
          boxShadow: "0 0 20px red",
          textAlign: "center",
          fontWeight: "bold"
        }}>
          ⚠ ACTIVE FAULT: TRANSFORMER {
            transformers.find(t => t.status === "Critical")?.id
          }
        </div>
      )}

      {/* BUTTONS */}
      <div style={{ marginTop: "20px", marginBottom: "30px" }}>

        <Link to="/faultlogs">
          <button style={{ marginRight: "10px", background: "#ef4444", color: "white", padding: "10px", border: "none", borderRadius: "6px" }}>
            🚨 Auto Severity Log
          </button>
        </Link>

        

      </div>

      {/* CARDS */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {transformers.length === 0 ? (
          <p>Loading transformers...</p>
        ) : (
          transformers.map(t => (
            <div key={t.id} style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "10px",
              width: "220px",
              borderLeft: `6px solid ${getBorderColor(t.status)}`,
              boxShadow: getGlow(t.status)
            }}>
              <h2>Transformer {t.id}</h2>
              <p>Status: {t.status}</p>
              <p>Temp: {t.temperature} °C</p>
              <p>Load: {t.load} %</p>

              <Link to={`/transformer/${t.id}`}>
                <button style={{ marginTop: "10px" }}>View Details</button>
              </Link>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default Dashboard;