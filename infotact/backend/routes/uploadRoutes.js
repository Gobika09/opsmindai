import express from "express";
import multer from "multer";
import { uploadPDF, getAllVectors } from "../controllers/uploadController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ Upload single PDF
router.post("/", upload.single("file"), uploadPDF);

// ✅ Get stored chunks (needed for frontend list)
router.get("/", getAllVectors);

export default router;