import React, { useState } from "react";

export default function SearchBox({ onSearch, onAsk, loading }) {
  const [query, setQuery] = useState("");

  return (
    <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type your question... (ex: refund policy)"
        style={{
          flex: 1,
          padding: 12,
          borderRadius: 12,
          border: "1px solid rgba(2,6,23,0.18)",
          outline: "none",
        }}
      />
      <button
        onClick={() => onSearch(query)}
        disabled={loading || !query.trim()}
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid rgba(2,6,23,0.12)",
          background: "white",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        {loading ? "..." : "Search"}
      </button>
      <button
        onClick={() => onAsk(query)}
        disabled={loading || !query.trim()}
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: "none",
          background: "linear-gradient(90deg,#38bdf8,#a855f7)",
          color: "white",
          cursor: "pointer",
          fontWeight: 800,
        }}
      >
        {loading ? "..." : "Ask AI"}
      </button>
    </div>
  );
}