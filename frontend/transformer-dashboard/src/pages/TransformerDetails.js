import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

import HealthGauge from "../components/HealthGauge";
import TemperatureGraph from "../components/TemperatureGraph";
import HealthGraph from "../components/HealthGraph";

function TransformerDetails() {

  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {

    const fetchData = async () => {
      try {
        console.log("Fetching transformer ID:", id);

        const res = await axios.get(`http://10.249.64.248:5000/api/transformer/${id}`);

        console.log("API Response:", res.data);

        setData(res.data);
      } catch (err) {
        console.error("DETAIL FETCH ERROR:", err);
      }
    };

    // initial load
    fetchData();

    // 🔥 LIVE UPDATE every 2 sec
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);

  }, [id]);

  // ✅ SAFETY CHECK (no crash)
  if (!data || !data.current) {
    return (
      <p style={{
        color: "white",
        padding: "40px",
        fontSize: "18px"
      }}>
        ⏳ Loading details...
      </p>
    );
  }

  return (
    <div style={{
      padding: "40px",
      background: "#0f172a",
      minHeight: "100vh",
      color: "white"
    }}>

      {/* 🔙 BACK */}
      <Link to="/" style={{ color: "#38bdf8" }}>
        ← Back
      </Link>

      {/* 🔥 TITLE */}
      <h1 style={{ marginTop: "20px" }}>
        Transformer {id} Details
      </h1>

      {/* 🔹 CURRENT DATA */}
      <div style={{
        background: "#1e293b",
        padding: "20px",
        borderRadius: "10px",
        marginTop: "20px"
      }}>
        <p>Status: {data.current.status}</p>
        <p>Temperature: {data.current.temperature} °C</p>
        <p>Load: {data.current.load} %</p>
        <p>Oil: {data.current.oil} %</p>
        <p>Health: {data.current.health}</p>
      </div>

      {/* 🔥 HEALTH GAUGE */}
      <div style={{ marginTop: "30px" }}>
        <HealthGauge health={data.current.health} />
      </div>

      {/* 🔥 GRAPHS */}
      <div style={{
        display: "flex",
        gap: "40px",
        flexWrap: "wrap",
        marginTop: "40px"
      }}>
        <TemperatureGraph history={data.history || []} />
        <HealthGraph history={data.history || []} />
      </div>

    </div>
  );
}

export default TransformerDetails;