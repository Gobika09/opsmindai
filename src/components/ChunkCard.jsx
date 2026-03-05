import React from "react";

export default function ChunkCard({ chunk }) {
  // ✅ safe defaults
  const text =
    chunk?.text ||
    chunk?.chunk ||
    chunk?.content ||
    chunk?.pageContent ||
    "";

  const score = chunk?.score ?? chunk?.similarity ?? chunk?.distance ?? null;

  // embedding may be called embedding / vector / values
  const embedding =
    Array.isArray(chunk?.embedding)
      ? chunk.embedding
      : Array.isArray(chunk?.vector)
      ? chunk.vector
      : Array.isArray(chunk?.values)
      ? chunk.values
      : [];

  const meta = chunk?.metadata || {};
  const page = meta?.page ?? chunk?.page ?? null;

  return (
    <div className="card">
      <div className="card-title">
        Chunk {page !== null ? `• Page ${page}` : ""}
      </div>

      {score !== null && (
        <div className="badge">Score: {Number(score).toFixed(4)}</div>
      )}

      <div className="card-text">
        {text ? (text.length > 260 ? text.slice(0, 260) + "..." : text) : "No text available"}
      </div>

      <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
        Embedding: {embedding.length} dims
      </div>
    </div>
  );
}