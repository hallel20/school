import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

export interface RequestWithUser extends Request {
  user?: User;
}

const prisma = new PrismaClient();

// Verify JWT token
export const verifyToken = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const JWT_SECRET = process.env.JWT_SECRET as string;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      // @ts-ignore
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
    console.log(error)
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Role-based middleware
export const hasRole = (...roles: string[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
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
export const isOwnResource = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (req.user?.role === 'Admin') {
    return next();
  }

  const resourceId = parseInt(req.params.id);

  if (req.user?.role === 'Student' && req.user.studentId !== resourceId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (req.user?.role === 'Staff' && req.user.staffId !== resourceId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  next();
};

// Course ownership middleware for staff
export const isCourseLecturer = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (req.user?.role === 'Admin') {
    return next();
  }

  const courseId = parseInt(req.params.courseId);
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { lecturerId: true }
  });

  if (!course || course.lecturerId !== req.user?.staffId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  next();
};