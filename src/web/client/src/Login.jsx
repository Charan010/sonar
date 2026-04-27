import React, { useState } from "react";
import { Lock, LogIn, Loader2 } from "lucide-react";
import "./SonarDashboard.css";
import { ec as EC } from "elliptic";
import BN from "bn.js";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getRandomBytes = (size) => {
    const array = new Uint8Array(size);
    window.crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const handleLogin = async () => {
  if (!username.trim()) {
    setError("Enter something at least 😭");
    return;
  }

  setIsLoading(true);
  setError("");

  try {
    await new Promise((res) => setTimeout(res, 500));

    localStorage.setItem("username", username);
    localStorage.setItem("jwt", "dev-token");

    onLogin(username);
  } catch (err) {
    setError("Something broke (but it shouldn't)");
  } finally {
    setIsLoading(false);
  }
};

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
  <div className="login-bg">
    <div className="login-wrapper">

      {/* LEFT SIDE (branding) */}
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-text">
            <h1>SONAR AI</h1>
            <p>Deep Visual Intelligence</p>
          </div>
        </div>

        <div className="login-info">
          <h2>Analyze. Understand. Explain.</h2>
          <p>
            Upload images, run AI classification, and visualize insights
            with Grad-CAM & LIME.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (form) */}
      <div className="login-card glass">
        <h2>Welcome Back</h2>

        <input
          className="login-input"
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
          disabled={isLoading}
        />

        <div
          className="login-error"
          style={{
            visibility: error ? "visible" : "hidden",
            minHeight: "1.5em",
          }}
        >
          {error || "\u00A0"}
        </div>

        <button
          className="login-btn"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="spinner" />
              Logging in...
            </>
          ) : (
            <>
              <LogIn size={18} />
              Enter System
            </>
          )}
        </button>
      </div>

    </div>
  </div>
  
)};

export default Login;
