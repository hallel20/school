import { verifyToken, isOwnResource, verifyAdmin } from "../middleware/auth";
import { Router } from "express";
import { GET, POST, PUT, DELETE, RESTORE, GET_BY_ID } from "../controllers/staff";

const router = Router();
router.use(verifyToken);
router.get("/", verifyAdmin, GET);
router.post("/", verifyAdmin, POST);
router.put("/:id", isOwnResource, PUT);
router.delete("/:id", verifyAdmin, DELETE);
router.post("/:id/restore", verifyAdmin, RESTORE);
router.get("/:id", verifyAdmin, GET_BY_ID);

export default router;