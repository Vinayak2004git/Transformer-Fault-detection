 
import { Line } from "react-chartjs-2";
import {
Chart as ChartJS,
LineElement,
CategoryScale,
LinearScale,
PointElement
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function HealthGraph({ history }) {

const labels = history.map(h => new Date(h.time * 1000).toLocaleTimeString());
const health = history.map(h => h.health);

const data = {
labels: labels,
datasets: [
{
label: "Health Score",
data: health,
borderColor: "green",
backgroundColor: "rgba(0,255,0,0.2)",
tension: 0.4
}
]
};

return (
<div style={{width:"600px", marginTop:"40px"}}>
<h3>Health Score Trend</h3>
<Line data={data} />
</div>
);
}

export default HealthGraph;