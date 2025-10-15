import React, { useState, useEffect } from "react";
import Bot from "./bot";
import "./App.css";

function AdminDashboard({ username, branch, onLogout }) {
  const [activeTab, setActiveTab] = useState("home");
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDetails, setPdfDetails] = useState({
    subject: "",
    regulation: "",
    year: "",
  });

  // === Fetch Students ===
  useEffect(() => {
    if (activeTab === "students") {
      fetch(`http://localhost:5000/api/students-with-activity?branch=${branch}`)
        .then((res) => res.json())
        .then((data) => setStudents(data.students || []))
        .catch((err) => console.error("Error fetching students:", err));
    }
  }, [activeTab, branch]);

  // === Fetch Activities ===
  useEffect(() => {
    if (activeTab === "activities") {
      fetch(`http://localhost:5000/api/students-with-activity?branch=${branch}`)
        .then((res) => res.json())
        .then((data) => setActivities(data.students || []))
        .catch((err) => console.error("Error fetching activities:", err));
    }
  }, [activeTab, branch]);

  // === Fetch PDFs ===
  const loadPDFs = () => {
    fetch("http://localhost:5000/api/all-pdfs")
      .then((res) => res.json())
      .then((data) => setPdfs(data.pdfs || []))
      .catch((err) => console.error("Error fetching PDFs:", err));
  };

  useEffect(() => {
    if (activeTab === "pdfs") loadPDFs();
  }, [activeTab]);
const handleUpload = async (e) => {
  e.preventDefault();

  const { subject, regulation, year } = pdfDetails;

  if (!pdfFile || !subject || !regulation || !year) {
    alert("⚠️ Please fill all fields before uploading!");
    return;
  }

  const formData = new FormData();
  formData.append("regulation", regulation.trim().toLowerCase());
  formData.append("year", year.trim());
  formData.append("subject", subject.trim().toLowerCase());
  formData.append("pdf", pdfFile); // file always last

  console.log("📤 Uploading PDF with details:", {
    regulation,
    year,
    subject,
    file: pdfFile.name,
  });

  try {
    const res = await fetch("http://localhost:5000/api/upload-pdf", {
      method: "POST",
      body: formData,
    });

    // The server might respond with HTML on error; handle that
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("⚠️ Server did not return JSON:", text);
      alert("Server error — check your backend logs!");
      return;
    }

    if (!data.ok) {
      alert("❌ Upload failed: " + data.error);
      return;
    }

    alert("✅ PDF uploaded successfully!");
    setPdfDetails({ subject: "", regulation: "", year: "" });
    setPdfFile(null);
    loadPDFs();
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Upload failed! Check console for details.");
  }
};

  // === Delete PDF ===
  const handleDelete = async (id) => {
    if (!window.confirm("🗑️ Are you sure you want to delete this PDF?")) return;

    const res = await fetch(`http://localhost:5000/api/delete-pdf/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (data.ok) {
      alert("✅ PDF deleted successfully!");
      loadPDFs();
    } else {
      alert("❌ Delete failed: " + data.error);
    }
  };

  return (
    <div className="app-container">
      {/* 🔹 Top Bar */}
      <div
        className="top-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 30px",
          backgroundColor: "#0f1117",
          borderBottom: "1px solid #333",
        }}
      >
        {/* Center Tabs */}
        <div style={{ display: "flex", gap: "20px", margin: "auto" }}>
          {["home", "students", "activities", "pdfs"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? "#00d4ff" : "transparent",
                color: activeTab === tab ? "#000" : "#ccc",
                border: "1px solid #555",
                borderRadius: "6px",
                padding: "6px 14px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              {tab === "home" && "🏠 Home"}
              {tab === "students" && "👨‍🎓 Students"}
              {tab === "activities" && "📊 Activities"}
              {tab === "pdfs" && "📘 PDFs"}
            </button>
          ))}
        </div>

        {/* Right Side */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span className="welcome-text">Hi, {username} 👋</span>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* 🔹 Main Content */}
      <div className="main-content" style={{ textAlign: "center", padding: "50px 20px" }}>
        {activeTab === "home" && (
          <>
            <h1>Welcome, Admin 🚀</h1>
            <p>Manage your PDFs and monitor student activities.</p>
          </>
        )}

        {activeTab === "students" && (
          <>
            <h2>👨‍🎓 Students in {branch}</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>Last Action</th>
                  <th>Last PDF</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={i}>
                    <td>{s.username}</td>
                    <td>{s.branch}</td>
                    <td>{s.year}</td>
                    <td>{s.lastAction}</td>
                    <td>{s.lastPdf}</td>
                    <td>{new Date(s.lastTime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === "activities" && (
          <>
            <h2>📊 Student Activities</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>PDF</th>
                  <th>Action</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a, i) => (
                  <tr key={i}>
                    <td>{a.username}</td>
                    <td>{a.lastPdf}</td>
                    <td>{a.lastAction}</td>
                    <td>{new Date(a.lastTime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === "pdfs" && (
          <>
            <h2>📘 Manage PDFs</h2>
            <form
              onSubmit={handleUpload}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <input
                type="text"
                placeholder="Regulation (e.g., r23)"
                value={pdfDetails.regulation}
                onChange={(e) => setPdfDetails({ ...pdfDetails, regulation: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Year (e.g., 3)"
                value={pdfDetails.year}
                onChange={(e) => setPdfDetails({ ...pdfDetails, year: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Subject (e.g., nlp)"
                value={pdfDetails.subject}
                onChange={(e) => setPdfDetails({ ...pdfDetails, subject: e.target.value })}
                className="input-field"
              />
              <input type="file" onChange={(e) => setPdfFile(e.target.files[0])} className="file-input" />
              <button type="submit" className="upload-btn">🚀 Upload PDF</button>
            </form>

            <h3>📂 Uploaded PDFs</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Regulation</th>
                  <th>Year</th>
                  <th>View</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {pdfs.map((pdf, i) => (
                  <tr key={i}>
                    <td>{pdf.subject}</td>
                    <td>{pdf.regulation}</td>
                    <td>{pdf.year}</td>
                    <td>
                      <a href={pdf.pdfUrl} target="_blank" rel="noopener noreferrer" className="view-link">
                        View PDF
                      </a>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(pdf._id)} className="delete-btn">
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* 💬 Chat */}
      <button className="chat-button" onClick={() => setShowChat(!showChat)}>
        {showChat ? "×" : "💬 Chat"}
      </button>

      {showChat && (
        <div className="chat-popup">
          <div className="chat-header">
            <span>LARIA Chat</span>
            <button className="close-chat" onClick={() => setShowChat(false)}>
              ×
            </button>
          </div>
          <Bot username={username} />
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
