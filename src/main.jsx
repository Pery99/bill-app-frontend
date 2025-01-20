import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from 'react-router-dom';
import ErrorBoundary from "./components/ErrorBoundary";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Router>
  </React.StrictMode>
);
