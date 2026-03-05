import express from "express";
import { login, createUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/create-user", createUser);
router.post("/login", login);

export default router;