import express from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { verifyToken, hasRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// User validation
const userValidation = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['Student', 'Staff', 'Admin']).withMessage('Invalid role'),
];

// Get all users - Admin only
router.get('/', verifyToken, hasRole('Admin'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        student: true,
        staff: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID - Admin only
router.get('/:id', verifyToken, hasRole('Admin'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        student: true,
        staff: true
      }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user - Admin only
router.post('/', verifyToken, hasRole('Admin'), userValidation, async (req, res) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        ...(role === 'Student' && {
          student: {
            create: {
              firstName,
              lastName,
              studentId: `STU${Date.now()}`
            }
          }
        }),
        ...(role === 'Staff' && {
          staff: {
            create: {
              firstName,
              lastName,
              staffId: `STAFF${Date.now()}`
            }
          }
        })
      },
      include: {
        student: true,
        staff: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user - Admin only
router.put('/:id', verifyToken, hasRole('Admin'), async (req, res) => {
  try {
    const { email, role, firstName, lastName } = req.body;
    
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: {
        email,
        role,
        ...(role === 'Student' && {
          student: {
            update: {
              firstName,
              lastName
            }
          }
        }),
        ...(role === 'Staff' && {
          staff: {
            update: {
              firstName,
              lastName
            }
          }
        })
      },
      include: {
        student: true,
        staff: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user - Admin only
router.delete('/:id', verifyToken, hasRole('Admin'), async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;