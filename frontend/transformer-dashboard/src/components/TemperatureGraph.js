
import { Line } from "react-chartjs-2";
import {
Chart as ChartJS,
LineElement,
CategoryScale,
LinearScale,
PointElement
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function TemperatureGraph({ history }) {

const labels = history.map(h => new Date(h.time * 1000).toLocaleTimeString());
const temps = history.map(h => h.temperature);

const data = {
labels: labels,
datasets: [
{
label: "Temperature (°C)",
data: temps,
borderColor: "red",
backgroundColor: "rgba(255,0,0,0.2)",
tension: 0.4
}
]
};

return (
<div style={{width:"600px", marginTop:"30px"}}>
<h3>Temperature Trend</h3>
<Line data={data} />
</div>
);
}

export default TemperatureGraph;