import { Request, Response } from "express";
import { ErrorOrigin, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getLogs = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page?.toString() || "1");
    const limit = parseInt(req.query.limit?.toString() || "10");
    const skip = (page - 1) * limit;

    const origin = req.query.origin?.toString() as ErrorOrigin;
    const filter = origin ? { origin } : {};
    const search = req.query.search?.toString();
    const searchFilter = search
        ? {
            OR: [
                { error: { contains: search, mode: "insensitive" } },
                { details: { contains: search, mode: "insensitive" } },
            ],
        }
        : {};
    const filters = { ...filter, ...searchFilter };
    const where = Object.keys(filters).length > 0 ? filters : undefined;

    try {
        const logs = await prisma.log.findMany({
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            where,
        });

        const totalLogs = await prisma.log.count();
        const totalPages = Math.ceil(totalLogs / limit);

        res.status(200).json({
            data: logs,
            meta: {
                currentPage: page,
                totalPages,
                totalLogs,
            },
        });
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ error: "Failed to fetch logs" });
    }
};


export const createLog = async (req: Request, res: Response) => {
    const { error, details, stack, componentStack } = req.body;
    const fullDetails = `${details}\n\nStack Trace:\n${stack}\n\nComponent Stack:\n${componentStack}`;

    try {
        const log = await prisma.log.create({
            data: {
                error,
                details: fullDetails,
                origin: "client",
            },
        });

        res.status(201).json(log);
    } catch (error) {
        console.error("Error creating log:", error);
        res.status(500).json({ error: "Failed to create log" });
    }
};