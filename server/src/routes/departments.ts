import { GET, GET_BY_ID, POST, PUT, DELETE, handleRestore } from "../controllers/department";

import { Router } from "express";
import { verifyAdmin, verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", verifyToken, GET);
router.get("/:id", verifyToken, GET_BY_ID);
router.post("/", verifyToken, verifyAdmin, POST);
router.post("/:id/restore", verifyToken, verifyAdmin, handleRestore);
router.put("/:id", verifyToken, verifyAdmin, PUT);
router.delete("/", verifyToken, verifyAdmin, DELETE);

export default router;