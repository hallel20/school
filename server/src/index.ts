import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import courseRoutes from './routes/courses';
import resultRoutes from './routes/results';
import academicRoutes from './routes/academic';
import settingsRoutes from './routes/settings';
import helmet from 'helmet';
import morgan from 'morgan';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  allowedHeaders: '*',
  origin: [
    'http://localhost:5173',
    'http://localhost:80',
    'http://school.cyberwizdev.com.ng',
    'https://school.cyberwizdev.com.ng'
  ]
}));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/settings', settingsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown); // Handles Ctrl + C