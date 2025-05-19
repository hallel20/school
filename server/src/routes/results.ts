import express, { Response } from 'express';
import { body } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { verifyToken, verifyAdmin, isCourseLecturer, RequestWithUser, verifyStaff } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Result validation
const resultValidation = [
  body('score').isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('grade').optional().isString().withMessage('Grade must be a string'),
];

// Get student results
router.get('/student/:studentId', verifyToken, async (req: RequestWithUser, res: Response) => {
  try {
    // Students can only view their own results
    if (req.user?.role === 'Student' && req.user.studentId !== parseInt(req.params.studentId)) {
      return res.status(403).send({ message: 'Forbidden' });
    }

    const results = await prisma.result.findMany({
      where: { studentId: parseInt(req.params.studentId) },
      include: {
        course: true,
        academicSession: true,
        semester: true
      }
    });
    res.send(results);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Get course results - Staff only
router.get('/course/:courseId', verifyToken, verifyStaff, isCourseLecturer, async (req, res) => {
  try {
    const results = await prisma.result.findMany({
      where: { courseId: parseInt(req.params.courseId) },
      include: {
        student: true,
        academicSession: true,
        semester: true
      }
    });
    res.send(results);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Create/Update result - Staff only
router.post('/course/:courseId/student/:studentId',
  verifyToken,
  verifyStaff,
  isCourseLecturer,
  resultValidation,
  async (req: RequestWithUser, res: Response) => {
    try {
      const { score, grade, academicSessionId, semesterId } = req.body;

      const result = await prisma.result.upsert({
        where: {
          studentId_courseId_academicSessionId_semesterId: {
            studentId: parseInt(req.params.studentId),
            courseId: parseInt(req.params.courseId),
            academicSessionId: parseInt(academicSessionId),
            semesterId: parseInt(semesterId)
          }
        },
        update: {
          score,
          grade
        },
        create: {
          studentId: parseInt(req.params.studentId),
          courseId: parseInt(req.params.courseId),
          academicSessionId: parseInt(academicSessionId),
          semesterId: parseInt(semesterId),
          score,
          grade
        },
        include: {
          student: true,
          course: true,
          academicSession: true,
          semester: true
        }
      });

      res.send(result);
    } catch (error) {
      console.log(error)
      res.status(500).send({ message: 'Server error' });
    }
  });

// Delete result - Admin only
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await prisma.result.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

export default router;