// src/bot.jsx
import React, { useState, useEffect, useRef } from "react";
import "./bot.css";

function Bot({ username }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Hi! Ask me for a PDF (e.g. 'Physics R23 first year')",
      sender: "bot",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Log activity (download / view)
  const logActivity = async (pdfId, action) => {
    if (!username) return;
    try {
      const backendUrl =
        process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      console.log("📡 Sending logActivity:", { username, pdfId, action });

      const resp = await fetch(`${backendUrl}/api/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pdfId, action }),
      });

      const data = await resp.json();
      console.log(" Activity API response:", data);
    } catch (err) {
      console.error(" Failed to log activity:", err);
    }
  };

  // ✅ Handle sending message
  const handleSend = async () => {
    const text = message.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { text, sender: "user" }]);
    setMessage("");
    setLoading(true);

    try {
      const backendUrl =
        process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

      const resp = await fetch(`${backendUrl}/api/find-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ message: text, username }),
      });

      if (resp.status === 403) {
        const data = await resp.json();
        setMessages((prev) => [
          ...prev,
          {
            text: data.error || " Please login to access PDFs.",
            sender: "bot",
          },
        ]);
        setLoading(false);
        return;
      }

      if (!resp.ok) throw new Error(`Server responded with ${resp.status}`);

      const data = await resp.json();
      console.log("📁 /api/find-pdf response:", data);
      //  AI MODE RESPONSE
if (data.aiAnswer) {
  setMessages(prev => [
    ...prev,
    { text: `AI Answer for "${text}"`, sender: "bot" },
    { text: data.aiAnswer, sender: "bot" }
  ]);
  return;
}
      if (!data.ok) {
        setMessages((prev) => [
          ...prev,
          {
            text: "Server error: " + (data.error || "unknown"),
            sender: "bot",
          },
        ]);
      } else if (data.found) {
        const pdfs = data.pdfs || [];

        if (pdfs.length === 0) {
          setMessages((prev) => [
            ...prev,
            { text: "No PDFs found for that request.", sender: "bot" },
          ]);
        } else if (pdfs.length === 1) {
          const pdf = pdfs[0];
          const botText = `Found: ${
            pdf.name || pdf.subject + " " + (pdf.regulation || "")
          }`;
          setMessages((prev) => [
            ...prev,
            { text: botText, sender: "bot" },
            {
              text: ` PDF Available for Download`,
              sender: "bot",
              meta: { pdf },
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              text: `Found ${pdfs.length} PDFs for your request:`,
              sender: "bot",
            },
            { text: "", sender: "bot", meta: { suggestions: pdfs } },
          ]);
        }
      } else if (data.matches && data.matches.length) {
        setMessages((prev) => [
          ...prev,
          {
            text:
              data.message ||
              "No exact match. Here are some suggestions:",
            sender: "bot",
          },
          { text: "", sender: "bot", meta: { suggestions: data.matches } },
        ]);
      } else if (data.sample && data.sample.length) {
        setMessages((prev) => [
          ...prev,
          {
            text: data.hint || "Here are some available PDFs:",
            sender: "bot",
          },
          { text: "", sender: "bot", meta: { suggestions: data.sample } },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            text:
              data.hint ||
              data.message ||
              "No matches found. Try different keywords.",
            sender: "bot",
          },
        ]);
      }
    } catch (err) {
      console.error("Connection error:", err);
      setMessages((prev) => [
        ...prev,
        {
          text: ` Connection error: ${err.message}`,
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-list">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`message ${m.sender === "user" ? "user" : "bot"}`}
          >
            {m.text && <div>{m.text}</div>}

          {/* ===== Single PDF Card ===== */}
{m.meta && m.meta.pdf && (
  <div className="pdf-card">
    <div className="pdf-header">
      📘 {m.meta.pdf.subject}{" "}
      {m.meta.pdf.regulation && `(${m.meta.pdf.regulation})`}
      {m.meta.pdf.year && ` - ${m.meta.pdf.year} Year`}
    </div>

    <div className="pdf-buttons">

      {/* 🡇 DOWNLOAD */}
      <button
        type="button"
        className="pdf-download"
        onClick={async (e) => {
          e.preventDefault();
          if (!m.meta?.pdf) return;

          await logActivity(m.meta.pdf._id, "download");
          window.open(m.meta.pdf.pdfUrl, "_blank");
        }}
      >
        🡇 Download
      </button>

      {/* 👀 VIEW */}
      <button
        type="button"
        className="pdf-view"
        onClick={async (e) => {
          e.preventDefault();
          if (!m.meta?.pdf) return;

          await logActivity(m.meta.pdf._id, "view");
          window.open(m.meta.pdf.pdfUrl, "_blank");
        }}
      >
        👀 View
      </button>
      <button
  className="pdf-summary"
  onClick={async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

      const resp = await fetch(`${backendUrl}/api/summarize-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfId: m.meta.pdf._id })
      });

      const data = await resp.json();

      if (data.ok) {
        setMessages(prev => [
          ...prev,
          { text: " Summary:", sender: "bot" },
          { text: data.answer, sender: "bot" }
        ]);
      }

    } catch (err) {
      alert("Summarization failed");
    } finally {
      setLoading(false);
    }
  }}
>
  Summarize
</button>
    </div>
  </div>
)}

            {/* ===== Suggestions Section ===== */}
            {m.meta && m.meta.suggestions && m.meta.suggestions.length > 0 && (
              <div>
                {m.meta.suggestions.map((s, idx) => (
                  <div key={idx} className="suggestion-card">
                    <div className="suggestion-header">
                      📘 {s.subject}{" "}
                      {s.regulation && `(${s.regulation})`}{" "}
                      {s.year && `- Year ${s.year}`}
                    </div>
                    {s.pdfUrl && (
                      <div className="pdf-buttons">
                        <button
                          type="button"
                          className="pdf-download"
                          onClick={async (e) => {
                            e.preventDefault();
                            await logActivity(s._id, "download");
                            window.open(s.pdfUrl, "_blank");
                          }}
                        >
                          🡇 Download
                        </button>
                        <button
                          type="button"
                          className="pdf-view"
                          onClick={async (e) => {
                            e.preventDefault();
                            await logActivity(s._id, "view");
                            window.open(s.pdfUrl, "_blank");
                          }}
                        >
                          👀 View
                        </button>
                        <button
  className="pdf-summary"
  onClick={async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

      const resp = await fetch(`${backendUrl}/api/summarize-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfId: s._id })
      });

      const data = await resp.json();

      if (data.ok) {
        setMessages(prev => [
          ...prev,
          { text: "🧠 Summary:", sender: "bot" },
          { text: data.answer, sender: "bot" }
        ]);
      }

    } catch (err) {
      alert("Summarization failed");
    } finally {
      setLoading(false);
    }
  }}
>
  Summarize
</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="message bot">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="loading-spinner"></div>
              🔍 Searching for PDFs...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ===== Input Bar ===== */}
      <div className="bot-input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a request, e.g. 'physics R23 first year'..."
        />
        <button onClick={handleSend} disabled={loading || !message.trim()}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default Bot;
