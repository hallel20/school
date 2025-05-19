import { verifyToken, isOwnResource, verifyAdmin, verifyStudent } from "../middleware/auth";
import { Router } from "express";
import { GET, POST, PUT, DELETE, RESTORE, GET_BY_ID, getAvailableCourses, getRegisteredCourses } from "../controllers/students";
import { registerCourses } from "../controllers/courses";

const router = Router();
router.use(verifyToken);
router.get("/", verifyAdmin, GET);
router.post("/", verifyAdmin, POST);
router.get("/courses/available", verifyStudent, getAvailableCourses)
router.post("/courses/register", verifyStudent, registerCourses)
router.get("/courses/registered", verifyStudent, getRegisteredCourses)
router.put("/:id", isOwnResource, PUT);
router.delete("/:id", verifyAdmin, DELETE);
router.post("/:id/restore", verifyAdmin, RESTORE);
router.get("/:id", verifyAdmin, GET_BY_ID);

export default router;