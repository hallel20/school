import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const password = bcrypt.hashSync('password', 10);

const prisma = new PrismaClient();

const mockUsers = [
    {
        email: 'john.doe@school.com',
        role: 'Student',
        firstName: 'John',
        lastName: 'Doe',
        studentId: 'STU001',
    },
    {
        email: 'jane.smith@school.com',
        role: 'Student',
        firstName: 'Jane',
        lastName: 'Smith',
        studentId: 'STU002',
    },
    {
        email: 'prof.johnson@school.com',
        role: 'Staff',
        firstName: 'Robert',
        lastName: 'Johnson',
        staffId: 'STAFF001',
    },
    {
        email: 'admin@school.com',
        role: 'Admin',
        firstName: 'Admin',
        lastName: 'User',
    },
];

async function main() {
    for (const user of mockUsers) {
        if (user.role === 'Admin') {
            await prisma.user.create({
                data: {
                    email: user.email,
                    role: user.role,
                    password,
                },
            });
            continue;
        } else if (user.role === 'Staff') {
            await prisma.user.create({
                // @ts-ignore
                data: {
                    email: user.email,
                    role: user.role,
                    password,
                    staff: {
                        create: {
                            staffId: user.staffId!,
                            firstName: user.firstName,
                            lastName: user.lastName,
                        },
                    },
                },
            });
            continue;
        } else if (user.role === 'Student') {
            await prisma.user.create({
                data: {
                    email: user.email,
                    role: user.role,
                    password,
                    student: {
                        create: {
                            studentId: user.studentId!,
                            firstName: user.firstName,
                            lastName: user.lastName,
                        },
                    },
                },
            });
            continue;
        }
    }
    console.log('Mock users saved to database.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
