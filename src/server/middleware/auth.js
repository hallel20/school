import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        student: true,
        staff: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Role-based middleware
export const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};

// Resource ownership middleware for students
export const isOwnResource = async (req, res, next) => {
  if (req.user.role === 'Admin') {
    return next();
  }

  const resourceId = parseInt(req.params.id);
  
  if (req.user.role === 'Student' && req.user.studentId !== resourceId) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  if (req.user.role === 'Staff' && req.user.staffId !== resourceId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  next();
};

// Course ownership middleware for staff
export const isCourseLecturer = async (req, res, next) => {
  if (req.user.role === 'Admin') {
    return next();
  }

  const courseId = parseInt(req.params.courseId);
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { lecturerId: true }
  });

  if (!course || course.lecturerId !== req.user.staffId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  next();
};