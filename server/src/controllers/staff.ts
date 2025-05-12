import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const GET = async (req: Request, res: Response) => {
    try {
        const { page = 1, pageSize = 20 } = req.query;
        const facultyId = req.query.faculty as string;
        
        const where: any = {
            isDeleted: false,
        };
        if (facultyId) {
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
        const pageNumber = Number(page);
        const pageSizeNumber = Number(pageSize);

        const staff = await prisma.staff.findMany({
            include: {
                user: true,
            },
            where,
            take: pageSizeNumber,
            skip: (pageNumber - 1) * pageSizeNumber,
        });

        const allStaffCount = await prisma.staff.count();
        const totalPages = Math.ceil(allStaffCount / pageSizeNumber);

        const response = {
            staff,
            page: pageNumber,
            pageSize: pageSizeNumber,
            totalPages,
            totalStaff: allStaffCount,
        };

        res.send(response);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server error" });
    }
}
export const GET_BY_ID = async (req: Request, res: Response) => {
    try {
        const staff = await prisma.staff.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                user: true,
            },
        });
        if (!staff) {
            return res.status(404).send({ message: "Staff not found" });
        }
        res.send(staff);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server error" });
    }
}
export const POST = async (req: Request, res: Response) => {
    try {
        const { userId, departmentId } = req.body;
        const staff = await prisma.staff.create({
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
        res.status(201).send(staff);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server error" });
    }
}
export const PUT = async (req: Request, res: Response) => {
    try {
        const { userId, departmentId } = req.body;
        const staff = await prisma.staff.update({
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
        res.status(200).send(staff);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server error" });
    }
}

export const DELETE = async (req: Request, res: Response) => {
    try {
        await prisma.staff.delete({
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
        await prisma.staff.update({
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
        const staff = await prisma.staff.update({
            where: { id: parseInt(id) },
            data: { isDeleted: false },
        });
        res.status(200).send(staff);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server error" });
    }
}
export const getStaffByDepartment = async (req: Request, res: Response) => {
    try {
        const { departmentId } = req.params;
        const staff = await prisma.staff.findMany({
            where: { departmentId: parseInt(departmentId) },
            include: {
                user: true,
            },
        });
        res.status(200).send(staff);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server error" });
    }
}