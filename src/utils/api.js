// src/utils/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

// ✅ Attach token automatically (if you use auth)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // change key if you store token as "nb_auth"
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ Auth
export const loginUser = (email, password) =>
  API.post("/api/auth/login", { email, password });

// ✅ Upload PDF (multipart/form-data)
export const uploadPDF = (formData) =>
  API.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ✅ Vector search (Dashboard calls: searchPDF(query, 5))
export const searchPDF = (query, topK = 5) =>
  API.post("/api/query/search", { query, topK });

// ✅ Ask with RAG (Dashboard calls: askPDF(query, 5))
export const askPDF = (query, topK = 5) =>
  API.post("/api/query/ask", { query, topK });

// ✅ Get stored chunks (from ChatHistory matches)
export const getVectors = () => API.get("/api/query/vectors");

export default API;