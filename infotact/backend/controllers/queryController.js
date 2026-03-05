// controllers/queryController.js
import { vectorSearch, answerWithRAG } from "../services/ragService.js";
import ChatHistory from "../models/ChatHistory.js";

// POST /api/query/search
export const searchQuery = async (req, res) => {
  try {
    const { query, topK = 5 } = req.body;
    if (!query) return res.status(400).json({ error: "query is required" });

    const matches = await vectorSearch(query, topK);
    res.json({ query, matches });
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/query/ask
export const askQuery = async (req, res) => {
  try {
    const { query, topK = 5 } = req.body;
    if (!query) return res.status(400).json({ error: "query is required" });

    const { answer, matches } = await answerWithRAG(query, topK);

    // ✅ 1) Deduplicate matches by text (prevents same chunk repeating)
    const uniqueMatches = [];
    const seen = new Set();

    for (const m of matches || []) {
      const t = (m?.text || m?.chunk || m?.content || "").trim();
      if (!t) continue;

      const key = t.replace(/\s+/g, " ").toLowerCase();
      if (seen.has(key)) continue;

      seen.add(key);
      uniqueMatches.push(m);
    }

    // ✅ 2) Clean the answer to remove repeated sentences/lines
    const cleanAnswer = (answer || "")
      .split(/\n+|(?<=\.)\s+/) // split by newline OR sentence end
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s, i, arr) => arr.indexOf(s) === i) // remove duplicates
      .join("\n");

    // Save chat history
    await ChatHistory.create({
      question: query,
      answer: cleanAnswer,
      matches: uniqueMatches,
    });

    res.json({ query, answer: cleanAnswer, matches: uniqueMatches });
  } catch (err) {
    console.error("ASK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/query/vectors
// Returns stored "chunks" from previous chats (flattened matches)
export const getVectors = async (req, res) => {
  try {
    const rows = await ChatHistory.find({})
      .sort({ createdAt: -1 }) // works best if schema has timestamps:true
      .limit(50)
      .lean();

    const vectors = rows
      .flatMap((r) => (Array.isArray(r.matches) ? r.matches : []))
      .filter((m) => m && typeof m === "object");

    res.json({ vectors });
  } catch (err) {
    console.error("VECTORS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};