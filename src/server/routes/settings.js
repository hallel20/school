import express from 'express';
import { body } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { verifyToken, hasRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Settings validation
const settingsValidation = [
  body('name').notEmpty().withMessage('School name is required'),
  body('address').notEmpty().withMessage('School address is required'),
  body('currentAcademicSessionId').optional().isInt().withMessage('Invalid academic session ID'),
  body('semestersPerSession').isInt({ min: 1 }).withMessage('Must have at least 1 semester per session'),
];

// Get school settings
router.get('/', verifyToken, async (req, res) => {
  try {
    const settings = await prisma.schoolSetting.findFirst({
      include: {
        currentAcademicSession: true
      }
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update school settings - Admin only
router.put('/', verifyToken, hasRole('Admin'), settingsValidation, async (req, res) => {
  try {
    const { name, address, currentAcademicSessionId, semestersPerSession } = req.body;
    
    const settings = await prisma.schoolSetting.upsert({
      where: { id: 1 },
      update: {
        name,
        address,
        currentAcademicSessionId: currentAcademicSessionId ? parseInt(currentAcademicSessionId) : null,
        semestersPerSession
      },
      create: {
        name,
        address,
        currentAcademicSessionId: currentAcademicSessionId ? parseInt(currentAcademicSessionId) : null,
        semestersPerSession
      },
      include: {
        currentAcademicSession: true
      }
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;