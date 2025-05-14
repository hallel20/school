import { Request, Response } from "express"
import { CourseSemester, Prisma, PrismaClient, year } from "@prisma/client"

const prisma = new PrismaClient()

export const updateAllowedCourses = async (req: Request, res: Response) => {
    const {
        allowedCourses: courseIds, // These are the IDs of the courses to be allowed
        departmentId: rawDepartmentId,
        yearLevel,
        semester,
    } = req.body as {
        allowedCourses: number[];
        departmentId: string;
        yearLevel: year;
        semester: CourseSemester;
    };

    const departmentId = Number(rawDepartmentId);

    // Basic input validation
    if (!courseIds || !Array.isArray(courseIds) || !departmentId || !yearLevel || !semester) {
        return res.status(400).json({ message: "Missing or invalid parameters. Required: allowedCourses (array of numbers), departmentId, yearLevel, semester." });
    }
    if (courseIds.some(id => typeof id !== 'number')) {
        return res.status(400).json({ message: "allowedCourses must be an array of course IDs (numbers)." });
    }

    try {
        // Step 1: Upsert the AllowedCourses rule.
        // This finds an existing rule for the department, year, and semester, or creates a new one.
        const allowedCoursesRule = await prisma.allowedCourses.upsert({
            where: {
                // This unique constraint must match the one defined in your Prisma schema
                unique_allowed_courses_department_semester_year: {
                    departmentId,
                    yearLevel,
                    semester,
                },
            },
            update: {}, // No fields on AllowedCourses itself need updating in this operation
            create: {
                departmentId,
                yearLevel,
                semester,
            },
        });

        // Step 2: Delete all existing AllowedCourseEntry records for this specific rule.
        // This clears out the old list of allowed courses for this rule.
        await prisma.allowedCourseEntry.deleteMany({
            where: {
                allowedCoursesId: allowedCoursesRule.id,
            },
        });

        // Step 3: Create new AllowedCourseEntry records for the provided course IDs.
        if (courseIds.length > 0) {
            await prisma.allowedCourseEntry.createMany({
                data: courseIds.map((courseId) => ({
                    allowedCoursesId: allowedCoursesRule.id,
                    courseId: courseId,
                })),
                skipDuplicates: true, // In case of duplicate course IDs in the input, though the DB constraint would also catch this.
            });
        }

        res.json({ message: "Allowed courses updated successfully", allowedCoursesRuleId: allowedCoursesRule.id });
    } catch (error) {
        console.error("Error updating allowed courses:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Example: Catching foreign key constraint violations if a courseId doesn't exist
            if (error.code === 'P2003') { // Foreign key constraint failed
                 // The field name might vary based on your schema and the specific constraint violated
                const fieldName = error.meta?.field_name as string || 'related record';
                return res.status(400).json({ message: `Invalid input: A course ID provided does not exist or ${fieldName} is invalid.` });
            }
        }
        res.status(500).json({ message: "An error occurred while updating allowed courses." });
    }
};

export const getAllowedCourses = async (req: Request, res: Response) => {
    const { departmentId: rawDepartmentId, yearLevel } = req.query as {
        departmentId?: string;
        yearLevel?: year;
    };

    if (!rawDepartmentId || !yearLevel) {
        return res.status(400).json({ message: "departmentId and yearLevel query parameters are required." });
    }

    const departmentId = Number(rawDepartmentId);
    if (isNaN(departmentId)) {
        return res.status(400).json({ message: "Invalid departmentId." });
    }

    try {
        const allowedCoursesRules = await prisma.allowedCourses.findMany({
            where: {
                departmentId: departmentId,
                yearLevel: yearLevel,
            },
            include: {
                allowedEntries: {
                    include: {
                        course: { // Include details of the course
                            select: { // Select specific fields you need for the course
                                id: true,
                                code: true,
                                name: true,
                                credits: true,
                            }
                        }
                    }
                }
            }
        });
        res.json(allowedCoursesRules);
    } catch (error) {
        console.error("Error fetching allowed courses:", error);
        res.status(500).json({ message: "An error occurred while fetching allowed courses." });
    }
};