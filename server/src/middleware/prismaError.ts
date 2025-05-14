import { Request, Response, NextFunction } from 'express';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';

// Middleware to handle PrismaClientInitializationError
const handlePrismaError = (err: any, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof PrismaClientInitializationError) {
        // Log the error for debugging purposes.  Consider using a proper logging library.
        console.error('Database Initialization Error:', err);
        return res.status(500).json({
            message: 'Database initialization error. Please check your database connection and migrations.',
            error: err.message, // Optionally include the original error message for more details (for development)
        });
    }
    // If it's not a PrismaClientInitializationError, pass it on to the next error handler
    next(err);
};

export default handlePrismaError;
