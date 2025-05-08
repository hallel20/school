import express from 'express';
import { body } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { verifyToken, hasRole, isCourseLecturer } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Course validation
const courseValidation = [
  body('name').notEmpty().withMessage('Course name is required'),
  body('code').notEmpty().withMessage('Course code is required'),
  body('credits').isInt({ min: 1 }).withMessage('Credits must be a positive number'),
];

// Get all courses
router.get('/', verifyToken, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        lecturer: true,
        students: true
      }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        lecturer: true,
        students: true
      }
    });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create course - Admin only
router.post('/', verifyToken, hasRole('Admin'), courseValidation, async (req, res) => {
  try {
    const { name, code, credits, lecturerId } = req.body;
    
    const course = await prisma.course.create({
      data: {
        name,
        code,
        credits,
        lecturerId: lecturerId ? parseInt(lecturerId) : null
      },
      include: {
        lecturer: true
      }
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course - Admin only
router.put('/:id', verifyToken, hasRole('Admin'), async (req, res) => {
  try {
    const { name, code, credits, lecturerId } = req.body;
    
    const course = await prisma.course.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        code,
        credits,
        lecturerId: lecturerId ? parseInt(lecturerId) : null
      },
      include: {
        lecturer: true
      }
    });

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete course - Admin only
router.delete('/:id', verifyToken, hasRole('Admin'), async (req, res) => {
  try {
    await prisma.course.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register student for course
router.post('/:id/register', verifyToken, hasRole('Student'), async (req, res) => {
  try {
    const course = await prisma.course.update({
      where: { id: parseInt(req.params.id) },
      data: {
        students: {
          connect: { id: req.user.studentId }
        }
      }
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course students - Staff only
router.get('/:id/students', verifyToken, hasRole('Staff'), isCourseLecturer, async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        students: true
      }
    });
    res.json(course.students);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;