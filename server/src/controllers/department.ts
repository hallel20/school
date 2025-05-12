import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, res: Response) {
    try {
        const { page = 1, pageSize = 20, queryType, search = '' } = req.query;
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
        const includeOptions = {
            courses: queryType === 'withCourses' || queryType === 'all',
            students: (queryType === 'withStudents' || queryType === 'all') && { include: { user: true } },
            staffs: (queryType === 'withStaffs' || queryType === 'all') && { include: { user: true } },
            faculty: true,
            hod: true,
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
    const { name, code, facultyId } = req.body;
    try {
        const department = await prisma.department.create({
            data: {
                name,
                code,
                facultyId
            },
        });
        res.status(201).json(department);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function PUT(req: Request, res: Response) {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const department = await prisma.department.update({
            where: { id: Number(id) },
            data: {
                name,
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
    const { id } = req.params;
    try {
        const department = await prisma.department.findUnique({
            where: { id: Number(id) },
            include: {
                courses: true,
                staffs: { include: { user: true } },
            },
        });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
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