import { verifyToken, hasRole, isOwnResource } from "../middleware/auth";
import { Router } from "express";
import { GET, POST, PUT, DELETE, RESTORE, GET_BY_ID, getAvailableCourses } from "../controllers/students";
import { registerCourses } from "../controllers/courses";

const router = Router();
router.use(verifyToken);
router.get("/", hasRole("Admin"), GET);
router.post("/", hasRole("Admin"), POST);
router.get("/courses/available", hasRole("Student"), getAvailableCourses)
router.get("/courses/register", hasRole("Student"), registerCourses)
router.put("/:id", isOwnResource, PUT);
router.delete("/:id", hasRole("Admin"), DELETE);
router.post("/:id/restore", hasRole("Admin"), RESTORE);
router.get("/:id", hasRole("Admin"), GET_BY_ID);

export default router;