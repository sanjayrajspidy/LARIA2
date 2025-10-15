import React, { useState } from "react";
import "./App.css";

function Login({ onClose, onLoginSuccess }) {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const handleUsername = (e) => setUsernameInput(e.target.value);
  const handlePassword = (e) => setPasswordInput(e.target.value);

  // Login function
  const handleLoginClick = async () => {
    if (usernameInput.trim() === "" || passwordInput.trim() === "") {
      alert("⚠️ Please enter username and password!");
      return;
    }

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      const resp = await fetch(`${backendUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });

      const data = await resp.json();
      console.log("Login response:", data);

      if (data.ok) {
        onLoginSuccess(data.username, data.role, data.branch);

      } else {
        alert(" Login failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert(" Error: " + err.message);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-popup futuristic-glass">
        <button className="corner-close" onClick={onClose}>×</button>
        <h2>🔐 Login</h2>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={usernameInput}
          onChange={handleUsername}
          placeholder="Enter username..."
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={passwordInput}
          onChange={handlePassword}
          placeholder="Enter password..."
        />

        <div className="login-actions">
          <button onClick={handleLoginClick}>Login</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
