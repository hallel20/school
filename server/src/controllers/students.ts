import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client"; // Import CourseSemester
import { Semester } from "../utils/enums";
import { RequestWithUser } from "../middleware/auth";
import { getStudentYearLevelForSession } from "../utils";

const prisma = new PrismaClient();

export const GET = async (req: Request, res: Response) => {
    try {
        const { page = 1, pageSize = 20, search = '' } = req.query;
        const facultyId = req.query.faculty as string;
        const departmentId = req.query.departmentId as string

        const where: any = {
            isDeleted: false,
        };

        if (search) {
            where.OR = [
                { firstName: { contains: search as string } },
                { lastName: { contains: search as string } },
                {
                    user: {
                        email: { contains: search as string }
                    }
                }
            ]
        }
        if (facultyId && facultyId !== "undefined") {
            const departments = await prisma.department.findMany({
                where: {
                    isDeleted: false,
                    facultyId: facultyId ? parseInt(facultyId) : undefined,
                },
            })
            const departmentIds = departments.map((department) => department.id);
            where.departmentId = {
                in: departmentIds,
            };
        }

        if (departmentId && departmentId !== "undefined") {
            where.departmentId = parseInt(departmentId);
        }
        const pageNumber = Number(page);
        const pageSizeNumber = Number(pageSize);

        const students = await prisma.student.findMany({
            include: {
                user: true,
                department: true,
            },
            where,
            take: pageSizeNumber,
            skip: (pageNumber - 1) * pageSizeNumber,
        });

        const allStudentCount = await prisma.student.count();
        const totalPages = Math.ceil(allStudentCount / pageSizeNumber);

        const response = {
            students,
            page: pageNumber,
            pageSize: pageSizeNumber,
            totalPages,
            totalStudent: allStudentCount,
        };

        res.send(response);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server error" });
    }
}
export const GET_BY_ID = async (req: Request, res: Response) => {
    try {
        const student = await prisma.student.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                user: true,
                department: true
            },
        });
        if (!student) {
            return res.status(404).send({ message: "Student not found" });
        }

        const facultyId = student.department.facultyId;

        if (facultyId) {
            (student as any).user.facultyId = facultyId;
        }
        res.send(student);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server error" });
    }
}
export const POST = async (req: Request, res: Response) => {
    try {
        const { userId, departmentId } = req.body;
        const student = await prisma.student.create({
            //@ts-ignore
            data: {
                user: {
                    connect: { id: userId },
                },
                department: {
                    connect: { id: departmentId },
                },
            },
        });
        res.status(201).send(student);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server error" });
    }
}
export const PUT = async (req: Request, res: Response) => {
    try {
        const { userId, departmentId } = req.body;
        const student = await prisma.student.update({
            where: { id: parseInt(req.params.id) },
            data: {
                user: {
                    connect: { id: userId },
                },
                department: {
                    connect: { id: departmentId },
                },
            },
        });
        res.status(200).send(student);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server error" });
    }
}

export const DELETE = async (req: Request, res: Response) => {
    try {
        await prisma.student.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.status(204).send();
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server error" });
    }
}
export const RESTORE = async (req: Request, res: Response) => {
    try {
        await prisma.student.update({
            where: { id: parseInt(req.params.id) },
            data: { isDeleted: false },
        });
        res.status(204).send();
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server error" });
    }
}

export const handleRestore = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const student = await prisma.student.update({
            where: { id: parseInt(id) },
            data: { isDeleted: false },
        });
        res.status(200).send(student);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server error" });
    }
}

export const getStudentByDepartment = async (req: Request, res: Response) => {
    try {
        const { departmentId } = req.params;
        const student = await prisma.student.findMany({
            where: { departmentId: parseInt(departmentId) },
            include: {
                user: true,
            },
        });
        res.status(200).send(student);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server error" });
    }
}


export const getAvailableCourses = async (req: RequestWithUser, res: Response) => {
    const { user } = req;
    if (!user || !user.student) {
        return res.status(403).send({ message: "Access denied. Student information not found." });
    }

    const studentId = user.student.id;
    const { academicSessionId: rawAcademicSessionId, semester: rawSemester } = req.query;

    if (!rawAcademicSessionId || !rawSemester) {
        return res.status(400).send({ message: "academicSessionId and semester query parameters are required." });
    }

    const academicSessionId = Number(rawAcademicSessionId);
    if (isNaN(academicSessionId)) {
        return res.status(400).send({ message: "Invalid academicSessionId." });
    }

    try {
        // Fetch the student to get their enrollment date (createdAt) and departmentId
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { createdAt: true, departmentId: true },
        });

        if (!student) {
            return res.status(404).send({ message: "Student not found." });
        }
        if (!student.departmentId) {
            return res.status(400).send({ message: "Student department information is missing." });
        }

        // Fetch all academic sessions (only id and name are needed for the utility function)
        const academicSessions = await prisma.academicSession.findMany({
            select: { id: true, name: true }
        });

        // Use the utility function to get the target year level
        const targetYearLevel = getStudentYearLevelForSession(
            student.createdAt,
            academicSessionId,
            academicSessions
        );

        console.log("Target Year Level:", targetYearLevel);

        if (!targetYearLevel) {
            // If the utility returns undefined, it means the student is not expected
            // to be in this session/year level (e.g., session before enrollment, or too far in future)
            // Return an empty list of allowed entries, consistent with how the client expects the data.
            return res.status(200).send({ allowedEntries: [] });
        }

        // Find the AllowedCourses rule for the student's department, calculated year level, and selected semester
        const allowedCoursesRule = await prisma.allowedCourses.findFirst({
            where: {
                departmentId: student.departmentId,
                yearLevel: targetYearLevel,
                semester: rawSemester as keyof typeof Semester, // Cast to Prisma's CourseSemester enum
            },
            include: {
                allowedEntries: {
                    include: {
                        course: {
                            include: {
                                lecturer: true // Include lecturer details if needed by the client
                            }
                        }
                    }
                }
            }
        });

        // If no specific rule is found, allowedCoursesRule will be null.
        // The client expects an object, potentially with an empty allowedEntries array.
        if (!allowedCoursesRule) {
            return res.json({ allowedEntries: [] });
        }

        res.json(allowedCoursesRule);

    } catch (error) {
        console.error("Error fetching available courses:", error);
        res.status(500).send({ message: "An error occurred while fetching available courses." });
    }
};


export const getRegisteredCourses = async (req: RequestWithUser, res: Response) => {
    const { user } = req;
    if (!user || !user.student) {
        // This should ideally be caught by middleware, but good for safety
        return res.status(403).send({ message: "Access denied. Student information not found." });
    }

    const studentId = user.student.id;
    const { academicSessionId: rawAcademicSessionId, semester: rawSemester } = req.query;

    if (!rawAcademicSessionId || !rawSemester) {
        return res.status(400).send({ message: "academicSessionId and semester query parameters are required." });
    }

    const academicSessionId = Number(rawAcademicSessionId);
    const semesterIndex = Semester[rawSemester as keyof typeof Semester]; // Expecting the string name like "FirstSemester"

    if (isNaN(academicSessionId)) {
        return res.status(400).send({ message: "Invalid academicSessionId." });
    }

    try {
        // Find the semester ID based on the academicSessionId and semester name
        const session = await prisma.academicSession.findUnique({
            where: {
                id: academicSessionId,
            },
            include: {
                semesters: true,
            },
        });

        const sessionSemesters = session?.semesters;
        if (!sessionSemesters) {
            return res.status(404).send({ message: "Academic session not found." });
        }

        const semesterRecord = sessionSemesters[semesterIndex]

        if (!semesterRecord) {
            // This could happen if the session/semester combination doesn't exist
            return res.status(404).send({ message: "Academic session or semester not found." });
        }

        // Find registration entries for the student in the specified session and semester
        const registeredEntries = await prisma.registrationEntry.findMany({
            where: {
                studentId: studentId,
                academicSessionId: academicSessionId,
                semesterId: semesterRecord.id, // Use the found semester ID
            },
            include: {
                course: { // Include the course details
                    include: { // Include lecturer details within the course
                        lecturer: true
                    }
                },
            },
        });

        // Return the list of courses from the registration entries
        res.json(registeredEntries.map(entry => entry.course));
    } catch (error) {
        console.error("Error fetching registered courses:", error);
        res.status(500).send({ message: "An error occurred while fetching registered courses." });
    }
};