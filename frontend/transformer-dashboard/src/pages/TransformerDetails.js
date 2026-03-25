
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

import TemperatureGraph from "../components/TemperatureGraph";
import HealthGraph from "../components/HealthGraph";
import HealthGauge from "../components/HealthGauge";

function TransformerDetails() {

  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {

    const fetchData = () => {
      axios.get(`http://127.0.0.1:5000/api/transformer/${id}`)
        .then(res => setData(res.data))
        .catch(err => console.log(err));
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);

  }, [id]);

  if (!data) return <div style={{ color: "white" }}>Loading...</div>;

  const current = data.current;
  const history = data.history;

  return (
    <div style={{ padding: "40px", background: "#0f172a", minHeight: "100vh", color: "white" }}>

      <Link to="/">← Back</Link>

      <h1 style={{ marginTop: "20px" }}>
        ⚡ Transformer {id} Detailed View
      </h1>

      <p>Status: {current.status}</p>
      <p>Temperature: {current.temperature} °C</p>
      <p>Load: {current.load} %</p>
      <p>Oil Level: {current.oil} %</p>
      <p>Health Score: {current.health}</p>

      <hr style={{ margin: "30px 0" }} />

      {/* Temperature Graph */}
      <TemperatureGraph history={history} />

      {/* Health Graph */}
      <HealthGraph history={history} />

      {/* Health Gauge */}
      <HealthGauge health={current.health} />

    </div>
  );
}

export default TransformerDetails;