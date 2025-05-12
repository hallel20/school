import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, res: Response) {
    try {
        const { page = 1, pageSize = 20, queryType, search = '', facultyId } = req.query;
        const pageNumber = Number(page);
        const pageSizeNumber = Number(pageSize);
        const where: any = {
            isDeleted: false,
        };
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { code: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        if (queryType === 'withStudents') {
            where.students = { some: {} };
        }
        if (queryType === 'withCourses') {
            where.courses = { some: {} };
        }
        if (queryType === 'withStaffs') {
            where.staffs = { some: {} };
        }
        if (facultyId) {
            where.facultyId = Number(facultyId);
        }
        const includeOptions = {
            courses: queryType === 'withCourses' || queryType === 'all',
            students: (queryType === 'withStudents' || queryType === 'all') && { include: { user: true } },
            staffs: (queryType === 'withStaffs' || queryType === 'all') && { include: { user: true } },
            faculty: true,
            HOD: true,
        };
        const departments = await prisma.department.findMany({
            include: queryType === 'all' ||
                queryType === 'withStudents' ||
                queryType === 'withCourses' ||
                queryType === 'withStaffs'
                ? includeOptions : undefined,
            where,
            take: pageSizeNumber,
            skip: (pageNumber - 1) * pageSizeNumber,
            orderBy: {
                id: 'desc',
            },
        });

        const validHodIds = departments.map(department => department.hodId).filter(id => id !== null);

        const headOfDepartments = await prisma.hOD.findMany({
            where: {
                id: {
                    in: validHodIds
                },
            },
            include: {
                staff: {
                    include: {
                        user: true
                    }
                },
            },
        });
        console.log(headOfDepartments)

        departments.forEach(department => {
            const headOfDepartment = headOfDepartments.find(head => head.departmentId === department.id);
            if (headOfDepartment) {
                (department as any).hod = headOfDepartment.staff;
            }
        })

        const allDepartmentsCount = await prisma.department.count({
            where,
        });
        const totalPages = Math.ceil(allDepartmentsCount / pageSizeNumber);
        const response = {
            departments,
            page: pageNumber,
            pageSize: pageSizeNumber,
            totalPages,
            totalDepartments: allDepartmentsCount,
        };
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
export async function POST(req: Request, res: Response) {
    const { name, code, facultyId, hodId } = req.body;

    const existingDepartment = await prisma.department.findUnique({
        where: { code },
    });

    if (existingDepartment) {
        return res.status(400).json({ message: 'Department with this code already exists.' });
    }

    if (!name || !code || !facultyId) {
        return res.status(400).json({ message: 'Name, code, and facultyId are required.' });
    }

    try {
        const department = await prisma.department.create({
            data: {
                name,
                code,
                facultyId,
            },
        });

        const HOD = await prisma.hOD.create({
            data: {
                staffId: hodId,
                departmentId: department.id
            }
        })
        department.hodId = HOD.id;

        await prisma.department.update({
            where: {
                id: department.id
            },
            data: {
                hodId: HOD.id
            }
        })
        res.status(201).json(department);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function PUT(req: Request, res: Response) {
    const { id } = req.params;
    const { name, code, facultyId, hodId } = req.body;

    const existingDepartment = await prisma.department.findUnique({
        where: { code },
    });

    if (existingDepartment && existingDepartment.id !== Number(id)) {
        return res.status(400).json({ message: 'Department with this code already exists.' });
    }


    try {
        let HOD;
        const existingHod = await prisma.hOD.findUnique({
            where: {
                departmentId: Number(id)
            }
        })
        if (existingHod) {
            HOD = await prisma.hOD.update({
                where: {
                    id: existingHod.id
                },
                data: {
                    staffId: hodId ? Number(hodId) : undefined
                }
            })
        } else if (hodId) {
            HOD = await prisma.hOD.create({
                data: {
                    staffId: hodId,
                    departmentId: Number(id)
                }
            })
        }

        const department = await prisma.department.update({
            where: { id: Number(id) },
            data: {
                name,
                code,
                hodId: HOD ? HOD.id : null,
                facultyId: facultyId ? Number(facultyId) : undefined,
            },
        });
        res.status(200).json(department);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function DELETE(req: Request, res: Response) {
    const departmentId = Number(req.params.id);

    if (isNaN(departmentId)) {
        return res.status(400).json({ message: 'Invalid department ID format.' });
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Step 1: Mark the department as deleted.
            // Prisma will throw a P2025 error if departmentId does not exist,
            // which will cause the transaction to roll back.
            await tx.department.update({
                where: { id: departmentId },
                data: { isDeleted: true },
            });

            // Step 2: Gather User IDs from students and staff in this department
            const studentsInDepartment = await tx.student.findMany({
                where: { departmentId: departmentId },
                select: { userId: true },
            });
            const studentUserIds = studentsInDepartment
                .map(s => s.userId)
                .filter((id): id is number => id !== null);

            const staffInDepartment = await tx.staff.findMany({
                where: { departmentId: departmentId },
                select: { userId: true },
            });
            const staffUserIds = staffInDepartment
                .map(s => s.userId)
                .filter((id): id is number => id !== null);

            const allUserIdsToSoftDelete = [...new Set([...studentUserIds, ...staffUserIds])];

            // Step 3: Mark associated courses as deleted.
            // Assumes Course model has an isDeleted field.
            await tx.course.updateMany({
                where: { departmentId: departmentId },
                data: { isDeleted: true },
            });

            // Step 4: Mark associated students as deleted.
            // Assumes Student model has an isDeleted field.
            await tx.student.updateMany({
                where: { departmentId: departmentId },
                data: { isDeleted: true },
            });

            // Step 5: Mark associated staff as deleted.
            // Assumes Staff model has an isDeleted field.
            await tx.staff.updateMany({
                where: { departmentId: departmentId },
                data: { isDeleted: true },
            });

            // Step 6: Mark associated users (from students and staff) as deleted.
            if (allUserIdsToSoftDelete.length > 0) {
                await tx.user.updateMany({
                    where: { id: { in: allUserIdsToSoftDelete } },
                    data: { isDeleted: true },
                });
            }
        });

        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') { // Prisma error code for "Record to update not found"
            return res.status(404).json({ message: 'Department not found.' });
        }
        console.error('Error during department soft delete:', error);
        res.status(500).json({ message: 'Internal server error during soft delete operation.' });
    }
}

export async function GET_BY_ID(req: Request, res: Response) {
    const { id, queryType } = req.params;

    const includeOptions = {
        courses: queryType === 'withCourses' || queryType === 'all',
        students: (queryType === 'withStudents' || queryType === 'all') && { include: { user: true } },
        staffs: (queryType === 'withStaffs' || queryType === 'all') && { include: { user: true } },
        faculty: true,
        HOD: true,
    };
    try {
        const department = await prisma.department.findUnique({
            where: { id: Number(id) },
            include: {
                ...includeOptions,
                staffs: {
                    include: {
                        user: true
                    }
                },
                courses: {
                    include: {
                        lecturer: {
                            include: {
                                user: true
                            }
                        }
                    }
                },
                students: {
                    include: {
                        user: true
                    }
                }
            },

        })
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        const hodId = department.hodId

        if (hodId) {
            const headOfDepartment = await prisma.hOD.findUnique({
                where: {
                    id: hodId
                },
                include: {
                    staff: {
                        include: {
                            user: true
                        }
                    }
                }
            });
            // console.log(headOfDepartment);

            (department as any).hod = headOfDepartment?.staff
        }

        res.status(200).json(department);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function handleRestore(req: Request, res: Response) {
    const departmentId = Number(req.params.id);

    if (isNaN(departmentId)) {
        return res.status(400).json({ message: 'Invalid department ID format.' });
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Step 1: Check if the department exists and was soft-deleted
            const departmentToRestore = await tx.department.findUnique({
                where: { id: departmentId },
            });

            if (!departmentToRestore) {
                // Throw an error that will be caught by the outer catch block
                // and result in a 404 if it's a P2025 type error from a later update.
                // Or, handle it directly here if preferred.
                throw { code: 'P2025', message: 'Department not found for restoration.' };
            }

            if (!departmentToRestore.isDeleted) {
                // Consider what to do if it's already not deleted.
                // For now, we'll proceed, but you could return a specific message.
            }

            // Step 2: Restore the department
            await tx.department.update({
                where: { id: departmentId },
                data: { isDeleted: false },
            });

            // Step 3: Gather User IDs from students and staff in this department
            // We assume these users were soft-deleted along with the department
            const studentsInDepartment = await tx.student.findMany({
                where: { departmentId: departmentId, isDeleted: true }, // only consider those soft-deleted
                select: { userId: true, id: true }, // also select student id for restoring student record
            });
            const studentUserIdsToRestore = studentsInDepartment
                .map(s => s.userId)
                .filter((id): id is number => id !== null);

            const staffInDepartment = await tx.staff.findMany({
                where: { departmentId: departmentId, isDeleted: true }, // only consider those soft-deleted
                select: { userId: true, id: true }, // also select staff id for restoring staff record
            });
            const staffUserIdsToRestore = staffInDepartment
                .map(s => s.userId)
                .filter((id): id is number => id !== null);

            const allUserIdsToRestore = [...new Set([...studentUserIdsToRestore, ...staffUserIdsToRestore])];

            // Step 4: Restore associated entities
            await tx.course.updateMany({ where: { departmentId: departmentId, isDeleted: true }, data: { isDeleted: false } });
            await tx.student.updateMany({ where: { departmentId: departmentId, isDeleted: true }, data: { isDeleted: false } });
            await tx.staff.updateMany({ where: { departmentId: departmentId, isDeleted: true }, data: { isDeleted: false } });

            // Step 5: Restore associated users
            if (allUserIdsToRestore.length > 0) {
                await tx.user.updateMany({ where: { id: { in: allUserIdsToRestore }, isDeleted: true }, data: { isDeleted: false } });
            }
        });
        res.status(200).json({ message: 'Department and associated entities restored successfully.' });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: error.message || 'Department not found for restoration.' });
        }
        console.error('Error during department restore:', error);
        res.status(500).json({ message: 'Internal server error during restore operation.' });
    }
}