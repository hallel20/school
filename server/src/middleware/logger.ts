import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();


export const logger = (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body?: any): Response<any, Record<string, any>> {
        if (res.statusCode >= 400) {
            const description = `
Method: ${req.method} 
URL: ${req.url} - Status: ${res.statusCode} 
\n\nRequest Body: 
\n${JSON.stringify(req.body)} 
\n\nResponse Body: 
\n ${JSON.stringify(body)}`;
            const error = new Error(description);
            console.error(error);
            // Log the error to the database asynchronously
            prisma.log.create({
                data: {
                    details: description,
                    origin: "server",
                    status: `${res.statusCode}`,
                },
            }).catch(err => console.error("Failed to log error:", err));
        }
        originalSend.call(this, body);
        return res;
    };

    next();
};
