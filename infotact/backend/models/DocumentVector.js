import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  fileName: String,
  content: String,
  chunkIndex: Number,
  embedding: {
    type: [Number],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("DocumentVector", documentSchema);
