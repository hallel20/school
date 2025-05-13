import { Router } from "express";
import { isOwnResource, verifyToken } from "../middleware/auth";
import { changePassword, updateStaffDetails, updateStudentDetails } from "../controllers/profile";

const router = Router()

router.use(verifyToken)
router.post('/change-password', changePassword)
router.post('/student/:id', isOwnResource, updateStudentDetails)
router.post('/staff/:id', isOwnResource, updateStaffDetails)

export default router