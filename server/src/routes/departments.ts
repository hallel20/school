import { GET, GET_BY_ID, POST, PUT, DELETE, handleRestore } from "../controllers/department";

import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { hasRole } from "../middleware/auth";

const router = Router();

router.get("/", verifyToken, GET);
router.get("/:id", verifyToken, GET_BY_ID);
router.post("/", verifyToken, hasRole('Admin'), POST);
router.post("/:id/restore", verifyToken, hasRole('Admin'), handleRestore);
router.put("/", verifyToken, hasRole('Admin'), PUT);
router.delete("/", verifyToken, hasRole('Admin'), DELETE);

export default router;