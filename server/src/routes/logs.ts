import express from "express";
import { getLogs, createLog } from "../controllers/logsController";
import { verifyToken, verifyAdmin } from "../middleware/auth";

const router = express.Router();

router.get("/", verifyToken, verifyAdmin, getLogs);

router.post("/", createLog);

export default router;