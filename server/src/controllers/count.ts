import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAdminCount = async (_req: Request, res: Response) => {
    try {
        const studentsCount = await prisma.student.count();
        const staffCount = await prisma.staff.count();
        const courseCount = await prisma.course.count();
        const departmentCount = await prisma.department.count();
        const facultyCount = await prisma.faculty.count();

        const response = {
            studentsCount,
            staffCount,
            courseCount,
            departmentCount,
            facultyCount,
        };

        res.json(response);
    } catch (error) {
        console.error(error)
        res.status(500).send({ error: 'Failed to fetch admin count' });
    }
};

export const getCourseDistributionData = async (_req: Request, res: Response) => {
    const faculties = await prisma.faculty.findMany({
        include: {
            departments: {
                include: {
                    courses: true,
                },
            },
        },
    });

    const courseDistribution = faculties.map((faculty) => ({
        name: faculty.name,
        value: faculty.departments.reduce(
            (sum, department) => sum + department.courses.length,
            0
        ),
    }));

    res.json(courseDistribution);
};

export const getStaffDistributionData = async (_req: Request, res: Response) => {
    try {
        const staff = await prisma.staff.findMany();

        const professors = staff?.filter(staff => staff.position === 'professor').length;
        const lecturers = staff?.filter(staff => staff.position === 'lecturer').length;
        const assistants = staff?.filter(staff => staff.position === 'assistant').length;

        const response = [
            { name: "Professors", value: professors },
            { name: "Lecturers", value: lecturers },
            { name: "Teaching Assistants", value: assistants },
        ];

        res.json(response);
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: 'Failed to fetch staff distribution' });
    }
};

// --- NEW IMPLEMENTATIONS ---

export const getEnrollmentTrendData = async (_req: Request, res: Response) => {
    try {
        // Using a raw query for YEAR() extraction, which is database-specific (MySQL in your case)
        const studentCounts = await prisma.$queryRaw`
      SELECT
        YEAR(createdAt) as year,
        COUNT(id) as count
      FROM Student
      GROUP BY YEAR(createdAt)
      ORDER BY YEAR(createdAt) ASC;
    `;

        // Cast the raw query result to a more usable type
        const typedStudentCounts = studentCounts as { year: number, count: BigInt }[];

        const academicSessions = await prisma.academicSession.findMany();

        const enrollmentData = academicSessions.map(session => {
            const yearsInSession = session.name.split('/').map(Number); // Convert '2024/2025' to [2024, 2025]
            let studentCountForSession = 0;

            for (const studentCount of typedStudentCounts) {
                const studentYear = Number(studentCount.year);
                if (yearsInSession.includes(studentYear)) {
                    studentCountForSession += Number(studentCount.count); // Convert BigInt to Number
                }
            }
            return { year: session.name, value: studentCountForSession };
        });

        res.json(enrollmentData);
    } catch (error) {
        console.error('Error fetching enrollment trend:', error);
        res.status(500).send({ error: 'Failed to fetch enrollment trend' });
    }
};

export const getPerformanceData = async (_req: Request, res: Response) => {
    try {
        const results = await prisma.result.findMany({
            include: {
                semester: true,
            },
        });

        const performanceMap = new Map<number, { name: string; pass: number; fail: number; total: number }>();

        for (const result of results) {
            const semesterId = result.semester.id;
            const semesterName = result.semester.name;

            if (!performanceMap.has(semesterId)) {
                performanceMap.set(semesterId, { name: semesterName, pass: 0, fail: 0, total: 0 });
            }

            const semesterData = performanceMap.get(semesterId)!;
            semesterData.total++;

            // Define your passing score (e.g., 50)
            if (result.score >= 50) {
                semesterData.pass++;
            } else {
                semesterData.fail++;
            }
        }

        const performanceData = Array.from(performanceMap.values()).map(data => ({
            semester: data.name,
            pass: data.total > 0 ? Math.round((data.pass / data.total) * 100) : 0,
            fail: data.total > 0 ? Math.round((data.fail / data.total) * 100) : 0,
        }));

        res.json(performanceData);
    } catch (error) {
        console.error('Error fetching performance data:', error);
        res.status(500).send({ error: 'Failed to fetch performance data' });
    }
};