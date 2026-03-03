// models/ChatHistory.js
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
    matches: Array,
  },
  { timestamps: true }
);

export default mongoose.model("ChatHistory", chatSchema);