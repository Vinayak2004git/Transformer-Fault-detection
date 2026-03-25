
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import TransformerDetails from "./pages/TransformerDetails";
import FaultLogs from "./pages/FaultLogs";
;


function App() {
  return (
    <Router>
      <Routes>

        {/* Main Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Transformer Details Page */}
        <Route path="/transformer/:id" element={<TransformerDetails />} />

        {/* Auto Severity Logs */}
        <Route path="/faultlogs" element={<FaultLogs />} />

        

      </Routes>
    </Router>
  );
}

export default App;