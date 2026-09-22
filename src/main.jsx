import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./base.css";
import "./workflow.css";
import "./new-ui.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
