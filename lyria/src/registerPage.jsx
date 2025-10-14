import React, { useState } from "react";
import "./App.css";

function Register({ onClose, onRegisterSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !branch.trim() || !year.trim()) {
      alert("⚠️ Please fill all fields!");
      return;
    }

    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      const resp = await fetch(`${backendUrl}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, branch, year, role }),
      });

      const data = await resp.json();
      console.log("Register response:", data);

      if (data.ok) {
        alert(`🎉 Registration successful! You are registered as ${data.role}`);
        onRegisterSuccess(data.username, data.role);
        onClose();
      } else {
        alert("❌ Registration failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("🚨 Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-popup futuristic-glass">
        <button className="corner-close" onClick={onClose}>×</button>
        <h2>🚀 Register</h2>

        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Create a username"
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
        />

        <label>Branch</label>
        <input
          type="text"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          placeholder="E.g. CSE, ECE, MECH"
        />

        <label>Year</label>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Select Year</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>

        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        <div className="login-actions">
          <button onClick={handleRegister} disabled={loading}>
            {loading ? "⚙️ Registering..." : "✨ Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
