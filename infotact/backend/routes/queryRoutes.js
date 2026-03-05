// routes/queryRoutes.js

import express from "express";
import {
  searchQuery,
  askQuery,
  getVectors,
} from "../controllers/queryController.js";

const router = express.Router();

/*
========================================
📌 QUERY ROUTES
Base URL: /api/query
========================================
*/

// 🔍 Vector similarity search
// POST /api/query/search
router.post("/search", searchQuery);

// 🤖 Ask question using RAG (Gemini + top chunks)
// POST /api/query/ask
router.post("/ask", askQuery);

// 📦 Get stored chunks (from ChatHistory matches)
// GET /api/query/vectors
router.get("/vectors", getVectors);

export default router;