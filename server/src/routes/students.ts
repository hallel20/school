import { verifyToken, hasRole, isOwnResource } from "../middleware/auth";
import { Router } from "express";
import { GET, POST, PUT, DELETE, RESTORE, GET_BY_ID } from "../controllers/students";

const router = Router();
router.use(verifyToken);
router.get("/", hasRole("Admin"), GET);
router.post("/", hasRole("Admin"), POST);
router.put("/:id", isOwnResource, PUT);
router.delete("/:id", hasRole("Admin"), DELETE);
router.post("/:id/restore", hasRole("Admin"), RESTORE);
router.get("/:id", hasRole("Admin"), GET_BY_ID);

export default router;