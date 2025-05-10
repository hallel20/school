import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { RequestWithUser, verifyToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Login validation
const loginValidation = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Login route - Public
router.post('/login', loginValidation, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        staff: true
      }
    });

    const JWT_SECRET = process.env.JWT_SECRET as string;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.send({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Get current user - Protected
router.get('/me', verifyToken, async (req: RequestWithUser, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      include: {
        student: true,
        staff: true
      }
    });

    res.send(user);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

export default router;