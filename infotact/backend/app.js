// app.js
import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Routes
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import queryRoutes from "./routes/queryRoutes.js";

const app = express();

//  Middlewares
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

//  Debug logs
console.log("MONGO URI LOADED:", process.env.MONGO_URI ? "YES" : "NO");
console.log("GROQ KEY LOADED:", process.env.GROQ_API_KEY ? "YES" : "NO"); // ✅ ADDED

//  MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) =>
    console.error("❌ MongoDB Connection Error:", err.message)
  );

//  API Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/query", queryRoutes);

//  Health Check Route
app.get("/", (req, res) => {
  res.status(200).send("🚀 NeuralBrain Backend Running");
});

//  Global Error Handler (recommended)
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});