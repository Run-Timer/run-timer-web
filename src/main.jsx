import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

/* ── ErrorBoundary global para depuración ── */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("💥 React crashed:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#09090b",
          color: "#fff",
          fontFamily: "monospace",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          gap: "1rem",
        }}>
          <div style={{ fontSize: "2rem" }}>💥 Error de la aplicación</div>
          <div style={{
            background: "#18181b",
            border: "1px solid #ef4444",
            borderRadius: "12px",
            padding: "1.5rem",
            maxWidth: "720px",
            width: "100%",
          }}>
            <p style={{ color: "#ef4444", fontWeight: "bold", marginBottom: "0.5rem" }}>
              {this.state.error?.name}: {this.state.error?.message}
            </p>
            <pre style={{ color: "#a1a1aa", fontSize: "0.75rem", overflowX: "auto", whiteSpace: "pre-wrap" }}>
              {this.state.error?.stack}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);