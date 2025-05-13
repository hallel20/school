// In your Express router file (e.g., results.routes.ts)
import { PrismaClient, Prisma } from '@prisma/client'; // Assuming Prisma client
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const adminResultHandler = async (req: Request, res: Response) => {
    try {
        const {
            studentId,
            sessionId,
            semesterId,
            search,
            page = '1',
            pageSize = '10',
        } = req.query as {
            studentId?: string;
            sessionId?: string;
            semesterId?: string;
            search?: string;
            page?: string;
            pageSize?: string;
        };

        if (!studentId) {
            return res.status(400).json({ message: 'Student ID is required.' });
        }

        const pageNumber = parseInt(page, 10);
        const pageSizeNumber = parseInt(pageSize, 10);

        const where: Prisma.ResultWhereInput = {
            studentId: Number(studentId), // Assuming Result model has a studentId field
            // If Result is related via a student object: student: { id: studentId }
        };

        if (sessionId) {
            // Assuming Result -> Semester -> AcademicSession relationship
            // Adjust based on your actual Prisma schema
            if (semesterId) {
                // Specific semester selected
                where.semesterId = Number(semesterId); // If Result has direct semesterId
                // OR: where.semester = { id: semesterId, academicSessionId: sessionId };
            } else {
                // Only session selected, fetch for all semesters in that session
                where.semester = {
                    ...(where.semester as Prisma.SemesterWhereInput), // Keep other semester conditions if any
                    academicSessionId: Number(sessionId),
                };
            }
        }
        // If Result has direct academicSessionId and semesterId fields:
        if (sessionId) {
          where.academicSessionId = Number(sessionId);
        }
        if (sessionId && semesterId) { // semesterId is only relevant if sessionId is also present
          where.semesterId = Number(semesterId);
        }


        if (search) {
            where.OR = [
                {
                    course: {
                        OR: [
                            { name: { contains: search as string } },
                            { code: { contains: search as string } },
                        ]
                    }
                }
            ];
        }

        const results = await prisma.result.findMany({
            where,
            include: {
                // student: true, // If you need to return student details with each result
                semester: {     // Include semester and session details
                    include: {
                        academicSession: true,
                    },
                },
                course: true
            },
            skip: (pageNumber - 1) * pageSizeNumber,
            take: pageSizeNumber,
            orderBy: {
                // Define a default sort order, e.g., by code or name
                createdAt: 'desc', // Or any other relevant field
            },
        });

        const totalResults = await prisma.result.count({ where });
        const totalPages = Math.ceil(totalResults / pageSizeNumber);

        res.json({
            results,
            page: pageNumber,
            pageSize: pageSizeNumber,
            totalPages,
            totalResult: totalResults,
        });
    } catch (error) {
        console.error('Failed to fetch results:', error);
        res.status(500).json({ message: 'Failed to fetch results' });
    }
};

