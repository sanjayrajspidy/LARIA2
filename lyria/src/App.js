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
      {/* 🔹 Top Bar */}
      <div className="top-bar">
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
