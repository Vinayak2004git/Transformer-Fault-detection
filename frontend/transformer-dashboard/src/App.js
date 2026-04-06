import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Dashboard from "./pages/Dashboard";
import TransformerDetails from "./pages/TransformerDetails";
import FaultLogs from "./pages/FaultLogs";
import SavedStates from "./pages/SavedStates"; // optional but useful

function App() {
  return (
    <Router>
      <Routes>

        {/* 🔥 Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* 🔥 Transformer Details (IMPORTANT) */}
        <Route path="/transformer/:id" element={<TransformerDetails />} />

        {/* 🔥 Fault Logs */}
        <Route path="/faultlogs" element={<FaultLogs />} />

        {/* 🔥 Saved States (optional) */}
        <Route path="/saved" element={<SavedStates />} />

        {/* 🔥 Fallback (optional safety) */}
        <Route path="*" element={<Dashboard />} />

      </Routes>
    </Router>
  );
}

export default App;