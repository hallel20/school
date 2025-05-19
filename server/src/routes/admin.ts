import express from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth';
import { nextUserIdController } from '../controllers/nextUserId';
import {
    getAdminCount,
    getCourseDistributionData,
    getStaffDistributionData,
    getEnrollmentTrendData,
    getPerformanceData,
} from '../controllers/count';
import { adminResultHandler } from '../controllers/results';
import { getAllowedCourses, updateAllowedCourses } from '../controllers/courses';

const router = express.Router();
router.use(verifyToken);
router.use(verifyAdmin);

router.get('/next-available-id', nextUserIdController);
router.get('/count', getAdminCount);
router.get('/results', adminResultHandler)
router.get('/course-distribution', getCourseDistributionData);
router.get('/staff-distribution', getStaffDistributionData);
router.get('/allowed-courses', getAllowedCourses)
router.post('/allowed-courses', updateAllowedCourses)

router.get('/enrollment-trend', getEnrollmentTrendData);
router.get('/performance', getPerformanceData);

export default router;