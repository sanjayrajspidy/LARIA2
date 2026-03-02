import React, { useState, useEffect } from "react";
import Login from "./loginPage";
import Register from "./registerPage";
import Bot from "./bot";
import "./App.css";
import AdminDashboard from "./AdminDashboard";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || "");
  const [userBranch, setUserBranch] = useState(localStorage.getItem("branch") || "");
  const [showChat, setShowChat] = useState(false);

  // Keep login state after refresh
  useEffect(() => {
    if (username) localStorage.setItem("username", username);
    if (userRole) localStorage.setItem("role", userRole);
    if (userBranch) localStorage.setItem("branch", userBranch);
  }, [username, userRole, userBranch]);

  // Logout clears everything
  const handleLogout = () => {
    setUsername("");
    setUserRole("");
    setUserBranch("");
    localStorage.clear();
    setShowChat(false);
  };

  // Popup toggles
  const handleOpenLogin = () => setShowLogin(true);
  const handleCloseLogin = () => setShowLogin(false);
  const handleOpenRegister = () => setShowRegister(true);
  const handleCloseRegister = () => setShowRegister(false);

  // Auth success handlers
  const handleLoginSuccess = (user, role, branch) => {
    setUsername(user);
    setUserRole(role);
    setUserBranch(branch);
    setShowLogin(false);
  };

  const handleRegisterSuccess = (user, role, branch) => {
    setUsername(user);
    setUserRole(role);
    setUserBranch(branch);
    setShowRegister(false);
  };

  // 🔹 If ADMIN → Show AdminDashboard
  if (username && userRole === "admin") {
    return (
      <AdminDashboard
        username={username}
        branch={userBranch}
        onLogout={handleLogout}
      />
    );
  }

  // 🔹 Else → Student / Main Home Page
  return (
    <div className="app-container">
      <div className="ai-network-bg">
  <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#7c5cff" stopOpacity="0"/>
        <stop offset="50%" stopColor="#7c5cff" stopOpacity="1"/>
        <stop offset="100%" stopColor="#7c5cff" stopOpacity="0"/>
      </linearGradient>
    </defs>

    <g stroke="url(#lineGradient)" strokeWidth="2" fill="none">
      <path className="data-line" d="M100 400 C 300 200, 600 600, 900 300 S 1300 500, 1500 200"/>
      <path className="data-line" d="M200 600 C 500 100, 800 700, 1200 350"/>
      <path className="data-line" d="M50 200 C 400 100, 700 400, 1400 150"/>
    </g>

    <g fill="#4f9cff">
      <circle className="pulse-node" cx="100" cy="400" r="4"/>
      <circle className="pulse-node" cx="600" cy="600" r="5"/>
      <circle className="pulse-node" cx="900" cy="300" r="5"/>
      <circle className="pulse-node" cx="1200" cy="350" r="4"/>
      <circle className="pulse-node" cx="1400" cy="150" r="5"/>
    </g>
  </svg>
</div>
      {/* 🔹 Top Bar */}
      <div className="top-bar">
         <div className="brand">
            {/* <span className="logo-icon">🧠</span> */}
            <span className="logo-text">LARIA</span>
          </div>
        {!username ? (
          <>
            <button onClick={handleOpenLogin} className="login-btn">
              Login
            </button>
            <button onClick={handleOpenRegister} className="register-btn">
              Register
            </button>
          </>
        ) : (
          <div className="user-bar">
            <span className="welcome-text">
              Hi, {username} <br />
              <small style={{ color: "#ccc" }}>Role: {userRole}</small>
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </div>

      {/* 🔹 Main Content */}
      <div className="main-content">
        <h1>Welcome to LARIA</h1>
        <p>
          LARIA (Learning And Responsive Intelligent Assistant) is your smart,
          interactive AI companion designed to make learning fun and easy.
        </p>
        <ul>
          <li>💬 Chat-based learning</li>
          <li>🤖 AI-powered responses</li>
          <li>🔐 Secure login & registration system</li>
          <li>🎨 Modern interactive design</li>
        </ul>
      </div>

      {/* 🔹 Chat Button */}
      {username && (
        <button className="chat-button" onClick={() => setShowChat(!showChat)}>
          {showChat ? "×" : "💬 Chat"}
        </button>
      )}

      {/* 🔹 Chat Popup */}
      {showChat && (
        <div className="chat-popup">
          <div className="chat-header">
            <span>LARIA Chat</span>
            <button
              className="close-chat"
              onClick={() => setShowChat(false)}
            >
              ×
            </button>
          </div>
          <Bot username={username} />
        </div>
      )}

      {/* 🔹 Popups */}
      {showLogin && (
        <Login
          onClose={handleCloseLogin}
          onLoginSuccess={(u, r, b) => handleLoginSuccess(u, r, b)}
        />
      )}

      {showRegister && (
        <Register
          onClose={handleCloseRegister}
          onRegisterSuccess={(u, r, b) => handleRegisterSuccess(u, r, b)}
        />
      )}
    </div>
  );
}

export default App;
