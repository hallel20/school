import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const GET = async (req: Request, res: Response) => {
    try {
        const { page = 1, pageSize = 20 } = req.query;
        const facultyId = req.query.faculty as string;
        const departmentId = req.query.departmentId as string
        
        const where: any = {
            isDeleted: false,
        };
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
            },
        });
        if (!student) {
            return res.status(404).send({ message: "Student not found" });
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