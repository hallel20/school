import dbData from '../db_backup.json';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const users = dbData.user;
const staffs = dbData.staff;
const deans = dbData.dean;
const hods = dbData.hod;
const faculties = dbData.faculty;
const departments = dbData.department;
const students = dbData.student;
const courses = dbData.course;

async function updateDbFromJson() {
    try {
        if (users) {
            await prisma.user.createMany({
                data: users,
            });
            console.log('Users updated');
        }

        if (staffs) {
            await prisma.staff.createMany({
                // @ts-ignore
                data: staffs,
            });
            console.log('Staffs updated');
        }

        if (deans) {
            await prisma.dean.createMany({
                data: deans,
            });
            console.log('Deans updated');
        }

        if (hods) {
            await prisma.hOD.createMany({
                // @ts-ignore
                data: hods,
            });
            console.log('Hods updated');
        }

        if (faculties) {
            await prisma.faculty.createMany({
                data: faculties,
            });
            console.log('Faculties updated');
        }

        if (departments) {
            await prisma.department.createMany({
                data: departments,
            });
            console.log('Departments updated');
        }

        if (students) {
            await prisma.student.createMany({
                // @ts-ignore
                data: students,
            });
            console.log('Students updated');
        }

        if (courses) {
            await prisma.course.createMany({
                data: courses,
            });
            console.log('Courses updated');
        }

        console.log('Database updated from JSON file');
    } catch (error) {
        console.error('Error updating database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateDbFromJson();