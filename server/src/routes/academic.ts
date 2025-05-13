import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { verifyToken, hasRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Academic session validation
const sessionValidation = [
  body('name').notEmpty().withMessage('Session name is required'),
];

// Semester validation
const semesterValidation = [
  body('name').notEmpty().withMessage('Semester name is required'),
  body('academicSessionId').isInt().withMessage('Academic session ID is required'),
];

// Get all academic sessions
router.get('/sessions', verifyToken, async (_req, res) => {
  try {
    const sessions = await prisma.academicSession.findMany({
      include: {
        semesters: true
      }
    });

    const settings = await prisma.schoolSetting.findFirst()

    sessions.forEach((session) => {
      if (session.id === settings?.currentAcademicSessionId) {
        (session as any).current = true
      }
    })
    res.send(sessions);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Get academic session by ID
router.get('/sessions/:id', verifyToken, async (req, res) => {
  try {
    const session = await prisma.academicSession.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        semesters: true
      }
    });
    if (!session) {
      return res.status(404).send({ message: 'Academic session not found' });
    }
    res.send(session);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Create academic session - Admin only
router.post('/sessions', verifyToken, hasRole('Admin'), sessionValidation, async (req: Request, res: Response) => {
  try {
    const { name, semesters } = req.body;

    const createSemesterType = [{
      name: '',
    }]

    const updateSemesterType = [
      {
        name: '',
        id: 1
      }]

    const data: any = {
      name
    }

    if (semesters && typeof semesters === typeof createSemesterType) {
      data.semesters = {
        create: semesters
      }
    } else if (semesters && typeof semesters === typeof updateSemesterType) {
      data.semesters = {
        update: semesters
      }
    }

    const session = await prisma.academicSession.create({
      data,
      include: {
        semesters: true
      }
    });

    res.status(201).send(session);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Update academic session - Admin only
router.put('/sessions/:id', verifyToken, hasRole('Admin'), sessionValidation, async (req: Request, res: Response) => {
  try {
    const { name, semesters } = req.body;

    const createSemesterType = [{
      name: '',
    }]

    const updateSemesterType = [
      {
        name: '',
        id: 1
      }]

    const data: any = {
      name
    }

    if (semesters && typeof semesters === typeof createSemesterType) {
      data.semesters = {
        create: semesters
      }
    } else if (semesters && typeof semesters === typeof updateSemesterType) {
      data.semesters = {
        update: semesters
      }
    }

    const session = await prisma.academicSession.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: {
        semesters: true
      }
    });

    res.send(session);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Delete academic session - Admin only
router.delete('/sessions/:id', verifyToken, hasRole('Admin'), async (req, res) => {
  try {
    await prisma.academicSession.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Get all semesters
router.get('/semesters', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (sessionId) {
      const semesters = await prisma.semester.findMany({
        where: { academicSessionId: Number(sessionId as string) },
        include: {
          academicSession: true
        }
      });
      return res.send(semesters);
    }
    const semesters = await prisma.semester.findMany({
      include: {
        academicSession: true
      }
    });
    res.send(semesters);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Get semester by ID
router.get('/semesters/:id', verifyToken, async (req, res) => {
  try {
    const semester = await prisma.semester.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        academicSession: true
      }
    });
    if (!semester) {
      return res.status(404).send({ message: 'Semester not found' });
    }
    res.send(semester);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Create semester - Admin only
router.post('/semesters', verifyToken, hasRole('Admin'), semesterValidation, async (req: Request, res: Response) => {
  try {
    const { name, academicSessionId } = req.body;

    const semester = await prisma.semester.create({
      data: {
        name,
        academicSessionId: parseInt(academicSessionId)
      },
      include: {
        academicSession: true
      }
    });

    res.status(201).send(semester);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Update semester - Admin only
router.put('/semesters/:id', verifyToken, hasRole('Admin'), semesterValidation, async (req: Request, res: Response) => {
  try {
    const { name, academicSessionId } = req.body;

    const semester = await prisma.semester.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        academicSessionId: parseInt(academicSessionId)
      },
      include: {
        academicSession: true
      }
    });

    res.send(semester);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Delete semester - Admin only
router.delete('/semesters/:id', verifyToken, hasRole('Admin'), async (req, res) => {
  try {
    await prisma.semester.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

export default router;