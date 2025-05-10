import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import courseRoutes from './routes/courses';
import resultRoutes from './routes/results';
import academicRoutes from './routes/academic';
import settingsRoutes from './routes/settings';
import logRoutes from './routes/logs';
import adminRoutes from './routes/admin';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import https from 'https';

import { PrismaClient } from '@prisma/client';
import { logger } from './middleware/logger';

const prisma = new PrismaClient();

dotenv.config();

const env = process.env.NODE_ENV || 'development';

const app = express();

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
      'http://localhost:5173', // Development frontend
      'https://school.cyberwizdev.com.ng', // Production frontend
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
};


// Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/admin', adminRoutes)

const PORT = process.env.PORT || 5000;

if (env === 'development') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  const options = {
    key: fs.readFileSync('/etc/nginx/ssl/api.privkey.pem'), // Adjust the path if necessary inside the container
    cert: fs.readFileSync('/etc/nginx/ssl/api.fullchain.pem'), // Adjust the path if necessary inside the container
  };

  https.createServer(options, app).listen(5000, () => {
    console.log('Server is running on port 5000');
  });
}

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown); // Handles Ctrl + C