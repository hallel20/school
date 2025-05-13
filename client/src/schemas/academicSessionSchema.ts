// src/schemas/academicSessionSchema.ts (or a similar location)
import { z } from 'zod';

export const semesterSchema = z.object({
    // id: z.number().optional(), // Optional: if you plan to reuse for editing existing semesters
    name: z.string().min(3, 'Semester name must be at least 3 characters'),
});

export const academicSessionSchema = z.object({
    // id: z.number().optional(), // Optional: for editing an existing session
    name: z.string().min(3, 'Academic session name must be at least 3 characters'),
    semesters: z
        .array(semesterSchema)
        .min(1, 'At least one semester is required for the academic session.'),
});

export type AcademicSessionFormData = z.infer<typeof academicSessionSchema>;
export type SemesterFormData = z.infer<typeof semesterSchema>;
