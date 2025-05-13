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
    const { page = 1, pageSize = 20, role, search = '' } = req.query;
    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);
    const where: any = {
      isDeleted: false,
    };

    if (role) {
      where.role = role as string;
    }

    if (search) {
      where.OR = [
        { email: { contains: search as string } },
        { student: { firstName: { contains: search as string } } },
        { student: { lastName: { contains: search as string } } },
        { staff: { firstName: { contains: search as string } } },
        { staff: { lastName: { contains: search as string } } },
      ];
    }
    const users = await prisma.user.findMany({
      where,
      include: {
        student: true,
        staff: true,
      },
      take: pageSizeNumber,
      skip: (pageNumber - 1) * pageSizeNumber,
    });

    const departmentIds = users
      .map((user) => user.student?.departmentId || user.staff?.departmentId)
      .filter((id): id is number => id !== undefined);

    const faculties = await prisma.faculty.findMany({
      where: {
        departments: {
          some: {
            id: {
              in: departmentIds,
            },
          },
        },
      },
      include: {
        departments: true,
      },
    });

    users.forEach((user) => {
      const departmentId = user.student?.departmentId || user.staff?.departmentId;
      if (departmentId) {
        const department = faculties.find((faculty) =>
          faculty.departments.some((dept) => dept.id === departmentId)
        )?.departments.find((dept) => dept.id === departmentId);
        if (department) {
          (user as any).department = {
            id: department.id,
            name: department.name,
            code: department.code,
            facultyId: faculties.find(f => f.departments.some(d => d.id === departmentId))?.id
          };
        }
      }
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

    res.send(response);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Get user by ID - Admin only
router.get('/:id', verifyToken, hasRole('Admin'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id), isDeleted: false },
      include: {
        student: true,
        staff: true
      }
    });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const departmentId = user.staff?.departmentId || user.student?.departmentId;
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: {
          id: departmentId
        }
      });

      (user as any).facultyId = department?.facultyId || undefined;
    }

    res.send({
      ...user,
      password: undefined, // Exclude password from response
    });
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Create user - Admin only
router.post('/', verifyToken, hasRole('Admin'), userValidation, async (req: Request, res: Response) => {
  try {
    const { email, password, role, firstName, lastName, departmentId, position } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return res.status(400).send({ message: 'User already exists' });
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
              departmentId,
              studentId: `STU${padToTenThousands(nextStudent)}`
            }
          }
        }),
        ...(role === 'Staff' && {
          staff: {
            create: {
              firstName,
              lastName,
              departmentId,
              position,
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

    res.status(201).send(user);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Update user - Admin only
router.put('/:id', verifyToken, hasRole('Admin'), async (req, res) => {
  try {
    const { email, role, firstName, lastName, departmentId, position } = req.body;

    const nextUserIds = await prisma.nextId.findMany()
    const nextStudent = nextUserIds.find((user) => user.tableName === 'student')?.nextId || 1;
    const nextStaff = nextUserIds.find((user) => user.tableName === 'staff')?.nextId || 1;
    const password = req.body.password
    const passwordInput: any = {}
    if (password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      passwordInput.password = hashedPassword;
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        staff: true,
        student: true
      }
    });

    if (!existingUser) {
      return res.status(404).send({ message: 'User not found' });
    }

    const isEmailTaken = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });
    if (isEmailTaken && isEmailTaken.id !== existingUser.id) {
      return res.status(400).send({ message: 'Email already in use' });
    }


    let user;
    if (existingUser?.staff || existingUser?.student) {
      user = await prisma.user.update({
        where: { id: parseInt(req.params.id) },
        data: {
          email,
          role,
          ...passwordInput,
          ...(role === 'Student' && {
            student: {
              update: {
                firstName,
                lastName,
                departmentId,
              }
            }
          }),
          ...(role === 'Staff' && {
            staff: {
              update: {
                firstName,
                lastName,
                departmentId,
              }
            }
          })
        },
        include: {
          student: true,
          staff: true
        }
      });
    } else {
      user = await prisma.user.update({
        where: { id: parseInt(req.params.id) },
        data: {
          email,
          role,
          ...passwordInput,
          ...(role === 'Student' && {
            student: {
              create: {
                firstName,
                lastName,
                departmentId,
                studentId: `STU${padToTenThousands(nextStudent)}`
              }
            }
          }),
          ...(role === 'Staff' && {
            staff: {
              create: {
                firstName,
                lastName,
                departmentId,
                position,
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
    }

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

    res.send(user);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});

// Delete user - Admin only
router.delete('/:id', verifyToken, hasRole('Admin'), async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { isDeleted: true }
    });
    res.status(204).send();
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Server error' });
  }
});


export default router;