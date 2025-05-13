import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { verifyToken, hasRole, isCourseLecturer, RequestWithUser } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Course validation
const courseValidation = [
  body('name').notEmpty().withMessage('Course name is required'),
  body('code').notEmpty().withMessage('Course code is required'),
  body('credits').isInt({ min: 1 }).withMessage('Credits must be a positive number'),
];

// Get all courses
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, facultyId, departmentId, search = '' } = req.query;
    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);
    const where: any = {}

    if (facultyId && facultyId !== "undefined") {
      const departments = await prisma.department.findMany({
        where: {
          isDeleted: false,
          facultyId: facultyId ? Number(facultyId) : undefined,
        },
      })
      const departmentIds = departments.map((department) => department.id);
      where.departmentId = {
        in: departmentIds,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        {
          code: { contains: search as string }
        },
      ];
    }

    if (departmentId && departmentId !== "undefined") {
      where.departmentId = Number(departmentId);
    }

    const courses = await prisma.course.findMany({
      include: {
        lecturer: true,
        department: true
      },
      where,
      take: pageSizeNumber,
      skip: (pageNumber - 1) * pageSizeNumber,
    });
    const allCoursesCount = await prisma.course.count();
    const totalPages = Math.ceil(allCoursesCount / pageSizeNumber);

    const response = {
      courses,
      page: pageNumber,
      pageSize: pageSizeNumber,
      totalPages,
      totalCourses: allCoursesCount,
    };

    res.send(response);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
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
      return res.status(404).send({ message: 'Course not found' });
    }
    res.send(course);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Create course - Admin only
router.post('/', verifyToken, hasRole('Admin'), courseValidation, async (req: Request, res: Response) => {
  try {
    const { name, code, credits, lecturerId, departmentId } = req.body;

    const existingCourse = await prisma.course.findUnique({
      where: { code },
    });
    if (existingCourse) {
      return res.status(400).send({ message: 'Course with this code already exists' });
    }

    const course = await prisma.course.create({
      data: {
        name,
        code,
        credits,
        departmentId,
        lecturerId: lecturerId ? parseInt(lecturerId) : null
      },
      include: {
        lecturer: true
      }
    });

    res.status(201).send(course);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
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
        lecturerId: lecturerId ? parseInt(lecturerId) : undefined
      },
      include: {
        lecturer: true
      }
    });

    res.send(course);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
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
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Register student for course
router.post('/:id/register', verifyToken, hasRole('Student'), async (req: RequestWithUser, res: Response) => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) throw new Error('Student ID not found');

    const course = await prisma.course.update({
      where: { id: parseInt(req.params.id) },
      data: {
        students: {
          connect: { id: studentId }
        }
      }
    });
    res.send(course);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
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
    const students = course?.students || [];

    res.send(students);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

export default router;