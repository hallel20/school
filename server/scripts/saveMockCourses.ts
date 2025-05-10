import { PrismaClient } from '@prisma/client';

const mockCourses = [
    {
        id: 1,
        name: 'Introduction to Computer Science',
        code: 'CS101',
        credits: 3,
        lecturerId: 1,
    },
    {
        id: 2,
        name: 'Advanced Mathematics',
        code: 'MATH201',
        credits: 4,
        lecturerId: 1,
    },
    {
        id: 3,
        name: 'English Literature',
        code: 'ENG101',
        credits: 3,
        lecturerId: 1,
    },
    {
        id: 4,
        name: 'Physics I',
        code: 'PHYS101',
        credits: 4,
        lecturerId: 1,
    },
    {
        id: 5,
        name: 'Database Systems',
        code: 'CS301',
        credits: 3,
        lecturerId: 1,
    },
];

const prisma = new PrismaClient();

(async () => {
    try {
        await prisma.course.createMany({
            data: mockCourses,
        });
        console.log('Mock courses saved successfully');
    } catch (error) {
        console.error('Error saving mock courses:', error);
    } finally {
        await prisma.$disconnect();
    }
}
)();