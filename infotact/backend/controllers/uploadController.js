import { parsePDF } from "../services/pdfParser.js";
import { generateEmbedding } from "../services/embeddingService.js";
import DocumentVector from "../models/DocumentVector.js";

export const uploadPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const chunks = await parsePDF(req.file.path);

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i]);

      await DocumentVector.create({
        fileName: req.file.originalname,
        content: chunks[i],
        chunkIndex: i,
        embedding,
      });
    }

    res.json({ message: "PDF processed & stored successfully ✅" });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ GET /api/upload
export const getAllVectors = async (req, res) => {
  try {
    const vectors = await DocumentVector.find().sort({ createdAt: -1 });
    res.json({ vectors });
  } catch (error) {
    console.error("GET VECTORS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};