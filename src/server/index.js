import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import resultRoutes from './routes/results.js';
import academicRoutes from './routes/academic.js';
import settingsRoutes from './routes/settings.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
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