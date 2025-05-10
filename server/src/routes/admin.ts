import express from 'express';
import { verifyToken, hasRole } from '../middleware/auth';
import { nextUserIdController } from '../controllers/nextUserId';

const router = express.Router()

router.get('/next-available-id', verifyToken, hasRole('Admin'), nextUserIdController);

export default router;