import React from "react";

export default function ResultCard({ r }) {
  return (
    <div
      style={{
        borderRadius: 14,
        padding: 14,
        background: "rgba(255,255,255,0.75)",
        border: "1px solid rgba(2,6,23,0.08)",
      }}
    >
      <div style={{ fontWeight: 800 }}>{r.fileName}</div>
      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
        Chunk {r.chunkIndex + 1} • Score {(r.score * 100).toFixed(2)}%
      </div>
      <div style={{ fontSize: 13, opacity: 0.85, marginTop: 10 }}>
        {r.content.slice(0, 180)}...
      </div>
    </div>
  );
}