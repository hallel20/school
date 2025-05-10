import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { verifyToken, hasRole } from '../middleware/auth';
import { padToTenThousands } from '../utils';

const router = express.Router();
const prisma = new PrismaClient();

// User validation
const userValidation = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['Student', 'Staff', 'Admin']).withMessage('Invalid role'),
];

// Get all users - Admin only
router.get('/', verifyToken, hasRole('Admin'), async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, role } = req.query;
    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);
    const where: any = {};

    if (role) {
      where.role = role as string;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        student: true,
        staff: true
      },
      take: pageSizeNumber,
      skip: (pageNumber - 1) * pageSizeNumber,
    });
    const allUsersCount = await prisma.user.count();
    const totalPages = Math.ceil(allUsersCount / pageSizeNumber);

    const response = {
      users,
      page: pageNumber,
      pageSize: pageSizeNumber,
      totalPages,
      totalUsers: allUsersCount,
    };

    res.json(response);
  } catch (error) {
    console.log(error)
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
    res.json({
      ...user,
      password: undefined, // Exclude password from response
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user - Admin only
router.post('/', verifyToken, hasRole('Admin'), userValidation, async (req: Request, res: Response) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Get the next available ID for student or staff
    const nextUserIds = await prisma.nextId.findMany()
    const nextStudent = nextUserIds.find((user) => user.tableName === 'student')?.nextId || 1;
    const nextStaff = nextUserIds.find((user) => user.tableName === 'staff')?.nextId || 1;
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
              studentId: `STU${padToTenThousands(nextStudent)}`
            }
          }
        }),
        ...(role === 'Staff' && {
          staff: {
            create: {
              firstName,
              lastName,
              staffId: `STAFF${padToTenThousands(nextStaff)}`
            }
          }
        })
      },
      include: {
        student: true,
        staff: true
      }
    });

    // Update the next available ID for the user
    if (role === 'Student') {
      await prisma.nextId.update({
        where: { tableName: 'student' },
        data: { nextId: nextStudent + 1 }
      });
    }
    if (role === 'Staff') {
      await prisma.nextId.update({
        where: { tableName: 'staff' },
        data: { nextId: nextStaff + 1 }
      });
    }

    res.status(201).json(user);
  } catch (error) {
    console.log(error)
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
    console.log(error)
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
    console.log(error)
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;