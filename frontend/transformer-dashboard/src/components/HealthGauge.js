
import React from "react";
import GaugeChart from "react-gauge-chart";

function HealthGauge({ health }) {

  const percent = health / 100;

  return (
    <div style={{ width: "350px", marginTop: "40px" }}>

      <h3>⚡ Transformer Health Score</h3>

      <GaugeChart
        id="health-gauge"
        nrOfLevels={3}
        percent={percent}
        colors={["#ef4444", "#facc15", "#22c55e"]}
        arcWidth={0.3}
        textColor="#ffffff"
      />

      <p style={{ textAlign: "center", marginTop: "10px" }}>
        Health Score: {health}
      </p>

    </div>
  );
}

export default HealthGauge;