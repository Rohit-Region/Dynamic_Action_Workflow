import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import ConfigPage from "./pages/ConfigPage";
import OutputPage from "./pages/OutputPage";
function App() {
  const [config, setConfig] = useState({ label: "Click Me", workflow: [] });

  useEffect(() => {
    const savedConfig = JSON.parse(localStorage.getItem("buttonConfig"));
    if (savedConfig) setConfig(savedConfig);
  }, []);

  return (
    <Router>
        <Routes>
          <Route path="/" element={<ConfigPage setConfig={setConfig} />} />
          <Route path="/output" element={<OutputPage config={config} />} />
        </Routes>
    </Router>
  );
}

export default App
