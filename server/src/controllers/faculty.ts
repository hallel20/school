import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, res: Response) {
    try {
        const pageNumber = Number(req.query.page) || 1;
        const pageSizeNumber = Number(req.query.pageSize) || 20;
        const faculties = await prisma.faculty.findMany({
            where: {
                isDeleted: false,
            },
            take: pageSizeNumber,
            skip: (pageNumber - 1) * pageSizeNumber,
            orderBy: {
                id: 'desc',
            },
            include: {
                departments: {
                    where: {
                        isDeleted: false,
                    },
                },
            },
        });

        const allDeanIds = faculties.map(faculty => faculty.deanId).filter(id => id !== null);
        const allDeans = await prisma.staff.findMany({
            where: {
                id: { in: allDeanIds },
                isDeleted: false,
            },
            include: {
                user: true
            }
        })
        const deanMap = new Map(allDeans.map(dean => [dean.id, dean]));
        faculties.forEach(faculty => {
            const deanId = faculty.deanId;
            if (deanId !== null) {
                const dean = deanMap.get(deanId);
                if (dean) {
                    (faculty as any).dean = {
                        id: dean.id,
                        firstName: dean.firstName,
                        lastName: dean.lastName,
                        email: dean.user?.email,
                        role: dean.user?.role,
                    };
                }
            }
        });
        const allFacultiesCount = await prisma.faculty.count({
            where: {
                isDeleted: false,
            },
        });
        const totalPages = Math.ceil(allFacultiesCount / pageSizeNumber);
        const response = {
            faculties,
            page: pageNumber,
            pageSize: pageSizeNumber,
            totalPages,
            totalFaculties: allFacultiesCount,
        };
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
}

export async function GET_BY_ID(req: Request, res: Response) {
    const facultyId = Number(req.params.id);
    if (isNaN(facultyId)) {
        return res.status(400).send({ message: 'Invalid faculty ID format.' });
    }
    try {
        const faculty = await prisma.faculty.findUnique({
            where: { id: facultyId },
            include: {
                departments: {
                    where: {
                        isDeleted: false,
                    },
                },
            },
        });
        if (!faculty) {
            return res.status(404).send({ message: 'Faculty not found.' });
        }
        res.status(200).send(faculty);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
}

export async function POST(req: Request, res: Response) {
    const { name, code, deanId } = req.body;
    try {
        const faculty = await prisma.faculty.create({
            data: {
                name,
                code,
                deanId: deanId ? Number(deanId) : undefined,
            },
        });
        res.status(201).send(faculty);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
}
export async function PUT(req: Request, res: Response) {
    const { id } = req.params;
    const { name, code, deanId } = req.body;
    try {
        const faculty = await prisma.faculty.update({
            where: { id: Number(id) },
            data: {
                name,
                code,
                deanId: deanId ? Number(deanId) : undefined,
            },
        });
        res.status(200).send(faculty);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
}
export async function DELETE(req: Request, res: Response) {
    const facultyId = Number(req.params.id);

    if (isNaN(facultyId)) {
        return res.status(400).send({ message: 'Invalid faculty ID format.' });
    }

    try {
        // Fetch IDs of all departments associated with this faculty.
        // This ensures we correctly target all children, even if a department
        // was already soft-deleted for other reasons.
        const relatedDepartments = await prisma.department.findMany({
            where: {
                facultyId: facultyId,
            },
            select: { id: true },
        });
        const departmentIds = relatedDepartments.map(d => d.id);

        await prisma.$transaction(async (tx) => {
            // Step 1: Mark the faculty as deleted.
            // Prisma will throw a P2025 error if facultyId does not exist,
            // which will cause the transaction to roll back.
            await tx.faculty.update({
                where: { id: facultyId },
                data: { isDeleted: true },
            });

            // If there are associated departments, collect User IDs from their students and staff
            let allUserIdsToSoftDelete: number[] = [];
            if (departmentIds.length > 0) {
                const studentsInAffectedDepartments = await tx.student.findMany({
                    where: { departmentId: { in: departmentIds } },
                    select: { userId: true },
                });
                const studentUserIds = studentsInAffectedDepartments
                    .map(s => s.userId)
                    .filter((id): id is number => id !== null); // Filter out nulls and ensure type is number

                const staffInAffectedDepartments = await tx.staff.findMany({
                    where: { departmentId: { in: departmentIds } },
                    select: { userId: true },
                });
                const staffUserIds = staffInAffectedDepartments
                    .map(s => s.userId)
                    .filter((id): id is number => id !== null); // Filter out nulls and ensure type is number

                allUserIdsToSoftDelete = [...new Set([...studentUserIds, ...staffUserIds])];
            }


            // If there are associated departments, proceed to mark them and their children as deleted.
            if (departmentIds.length > 0) {
                // Step 2: Mark associated departments as deleted.
                await tx.department.updateMany({
                    where: {
                        id: { in: departmentIds },
                    },
                    data: { isDeleted: true },
                });

                // Step 2.5 (New): Mark associated users (from students and staff) as deleted.
                if (allUserIdsToSoftDelete.length > 0) {
                    await tx.user.updateMany({
                        where: { id: { in: allUserIdsToSoftDelete } },
                        data: { isDeleted: true },
                    });
                }

                // Step 3: Mark associated courses as deleted.
                await tx.course.updateMany({
                    where: {
                        departmentId: { in: departmentIds },
                    },
                    data: { isDeleted: true },
                });

                // Step 4: Mark associated students as deleted.
                await tx.student.updateMany({
                    where: {
                        departmentId: { in: departmentIds },
                    },
                    data: { isDeleted: true },
                });

                // Step 5: Mark associated staff as deleted.
                await tx.staff.updateMany({
                    where: {
                        departmentId: { in: departmentIds },
                    },
                    data: { isDeleted: true },
                });
            }
        });

        res.status(204).send();
    } catch (error: any) {
        // Handle specific Prisma error for "Record to update not found"
        if (error.code === 'P2025') {
            return res.status(404).send({ message: 'Faculty not found.' });
        }
        console.error('Error during faculty soft delete:', error);
        res.status(500).send({ message: 'Internal server error during soft delete operation.' });
    }
}

export async function RESTORE(req: Request, res: Response) {
    const facultyId = Number(req.params.id);

    if (isNaN(facultyId)) {
        return res.status(400).send({ message: 'Invalid faculty ID format.' });
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Step 1: Check if the faculty exists and was soft-deleted
            const facultyToRestore = await tx.faculty.findUnique({
                where: { id: facultyId },
            });

            if (!facultyToRestore) {
                throw { code: 'P2025', message: 'Faculty not found for restoration.' };
            }

            // Optional: Check if it's already not deleted
            // if (!facultyToRestore.isDeleted) {
            //     // return res.status(200).send({ message: 'Faculty is already active.' });
            // }

            // Step 2: Restore the faculty
            await tx.faculty.update({
                where: { id: facultyId },
                data: { isDeleted: false },
            });

            // Step 3: Identify departments associated with this faculty that were also soft-deleted
            const relatedDepartmentsToRestore = await tx.department.findMany({
                where: {
                    facultyId: facultyId,
                    isDeleted: true, // Only consider departments that were soft-deleted
                },
                select: { id: true },
            });
            const departmentIdsToRestore = relatedDepartmentsToRestore.map(d => d.id);

            if (departmentIdsToRestore.length > 0) {
                // Step 4: Restore associated departments
                await tx.department.updateMany({
                    where: { id: { in: departmentIdsToRestore } },
                    data: { isDeleted: false },
                });

                // Step 5: Gather User IDs from students and staff in these departments that were soft-deleted
                const studentsInRestoredDepts = await tx.student.findMany({
                    where: { departmentId: { in: departmentIdsToRestore }, isDeleted: true },
                    select: { userId: true },
                });
                const studentUserIdsToRestore = studentsInRestoredDepts
                    .map(s => s.userId)
                    .filter((id): id is number => id !== null);

                const staffInRestoredDepts = await tx.staff.findMany({
                    where: { departmentId: { in: departmentIdsToRestore }, isDeleted: true },
                    select: { userId: true },
                });
                const staffUserIdsToRestore = staffInRestoredDepts
                    .map(s => s.userId)
                    .filter((id): id is number => id !== null);

                const allUserIdsToRestore = [...new Set([...studentUserIdsToRestore, ...staffUserIdsToRestore])];

                // Step 6: Restore associated courses, students, and staff
                await tx.course.updateMany({ where: { departmentId: { in: departmentIdsToRestore }, isDeleted: true }, data: { isDeleted: false } });
                await tx.student.updateMany({ where: { departmentId: { in: departmentIdsToRestore }, isDeleted: true }, data: { isDeleted: false } });
                await tx.staff.updateMany({ where: { departmentId: { in: departmentIdsToRestore }, isDeleted: true }, data: { isDeleted: false } });

                // Step 7: Restore associated users
                if (allUserIdsToRestore.length > 0) {
                    await tx.user.updateMany({ where: { id: { in: allUserIdsToRestore }, isDeleted: true }, data: { isDeleted: false } });
                }
            }
        });
        res.status(200).send({ message: 'Faculty and associated entities restored successfully.' });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).send({ message: error.message || 'Faculty not found for restoration.' });
        }
        console.error('Error during faculty restore:', error);
        res.status(500).send({ message: 'Internal server error during restore operation.' });
    }
}
