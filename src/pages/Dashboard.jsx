import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadBox from "../components/UploadBox";
import SearchBox from "../components/SearchBox";
import ChunkCard from "../components/ChunkCard";
import ResultCard from "../components/ResultCard";
import { getVectors, uploadPDF, searchPDF, askPDF } from "../utils/api";
import "../styles/dashboard.css";
import "../styles/chunks.css";

export default function Dashboard() {
  const nav = useNavigate();

  const [vectors, setVectors] = useState([]);
  const [matches, setMatches] = useState([]);
  const [answer, setAnswer] = useState("");
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showChunks, setShowChunks] = useState(false);

  // ✅ Fetch stored chunks
  const fetchVectors = async () => {
    try {
      const res = await getVectors();
      setVectors(res?.data?.vectors || []);
    } catch (err) {
      console.log("FETCH VECTORS ERROR:", err?.response?.data || err.message);
    }
  };

  useEffect(() => {
    // Only load when user clicks Stored Chunks
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nb_user");
    nav("/login");
  };

  const handleUpload = async (file) => {
    try {
      setLoadingUpload(true);
      const fd = new FormData();
      fd.append("file", file);

      const res = await uploadPDF(fd);
      alert(res?.data?.message || "Uploaded ✅");

      setMatches([]);
      setAnswer("");

      if (showChunks) await fetchVectors();
    } catch (err) {
      console.log("UPLOAD ERROR:", err?.response?.data || err.message);
      alert(err?.response?.data?.error || "Upload failed");
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleSearch = async (query) => {
    try {
      setLoadingSearch(true);
      setAnswer("");

      const res = await searchPDF(query, 5);
      setMatches(res?.data?.matches || []);
    } catch (err) {
      console.log("SEARCH ERROR:", err?.response?.data || err.message);
      alert(err?.response?.data?.error || "Search failed");
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleAsk = async (query) => {
    try {
      setLoadingSearch(true);

      const res = await askPDF(query, 5);
      setMatches(res?.data?.matches || []);
      setAnswer(res?.data?.answer || "");
    } catch (err) {
      console.log("ASK ERROR:", err?.response?.data || err.message);
      alert(err?.response?.data?.error || "Ask failed");
    } finally {
      setLoadingSearch(false);
    }
  };

  const toggleChunks = async () => {
    const next = !showChunks;
    setShowChunks(next);
    if (next) {
      await fetchVectors();
    }
  };

  return (
    <div className="db-wrap">
      {/* ---------- Top Bar ---------- */}
      <div className="db-top">
        <div>
          <div className="db-brand">🧠 NeuralBrain</div>
          {/* ❌ Removed: Welcome email */}
        </div>

        <div className="db-actions">
          <button className="db-btn pulse" onClick={toggleChunks}>
            {showChunks ? "Hide Stored Chunks" : "Stored Chunks"}
          </button>

          <button className="db-btn danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* ---------- Main Grid ---------- */}
      <div className="db-grid">
        {/* Upload Section */}
        <div className="db-card">
          <h2>Upload PDF</h2>
          <p className="muted">
            Upload a single PDF and store chunks + embeddings.
          </p>

          <UploadBox onUpload={handleUpload} />

          <button className="db-primary" disabled={loadingUpload}>
            {loadingUpload ? "Uploading..." : "Ready ✅"}
          </button>
        </div>

        {/* Ask/Search Section */}
        <div className="db-card">
          <h2>Ask / Search</h2>
          <p className="muted">
            Search top chunks or ask AI using RAG.
          </p>

          <SearchBox
            onSearch={handleSearch}
            onAsk={handleAsk}
            loading={loadingSearch}
          />

          {answer && (
            <div className="answer">
              <div className="answer-head">🤖 AI Answer</div>
              <div className="answer-body">{answer}</div>
            </div>
          )}

          {matches.length > 0 && (
            <>
              <h3 className="section">Top Matches</h3>
              <div className="cards">
                {matches.map((m, i) => (
                  <ResultCard key={m?._id || i} r={m} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Stored Chunks */}
        {showChunks && (
          <div className="db-card full">
            <div className="row">
              <h2>Stored Chunks</h2>
              <span className="chip">{vectors.length} chunks</span>
            </div>

            {vectors.length === 0 ? (
              <div className="muted">
                No chunks found. Upload a PDF first.
              </div>
            ) : (
              <div className="cards">
                {vectors.map((v, i) => (
                  <ChunkCard key={v?._id || i} chunk={v} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}