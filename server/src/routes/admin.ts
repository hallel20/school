import express from 'express';
import { verifyToken, hasRole } from '../middleware/auth';
import { nextUserIdController } from '../controllers/nextUserId';
import {
    getAdminCount,
    getCourseDistributionData,
    getStaffDistributionData,
    getEnrollmentTrendData,
    getPerformanceData,
} from '../controllers/count';

const router = express.Router();
router.use(verifyToken);
router.use(hasRole('Admin'));

router.get('/next-available-id', nextUserIdController);
router.get('/count', getAdminCount);
router.get('/course-distribution', getCourseDistributionData);
router.get('/staff-distribution', getStaffDistributionData);

router.get('/enrollment-trend', getEnrollmentTrendData);
router.get('/performance', getPerformanceData);

export default router;