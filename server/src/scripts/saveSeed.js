const { PrismaClient } = require('@prisma/client');
const fillerData = require('./filler_data_output.json'); // Assuming you saved the Python script output to a JSON file

async function seedDatabase() {
  const prisma = new PrismaClient();

  try {
    const generatedData = fillerData; // The imported JSON data

    for (const modelName in generatedData) {
      if (modelName === 'NextId') {
        // Skip NextId as it's for internal tracking, not direct data insertion
        continue;
      }

      const modelData = generatedData[modelName];
      if (modelData && modelData.length > 0) {
        console.log(`Seeding table: ${modelName}`);
        for (const record of modelData) {
          try {
            // Dynamically access the Prisma model and use create or update
            // Adjust the createInput based on your Prisma schema and data structure

            if (modelName === 'User') {
              await prisma.user.upsert({
                where: { email: record.email },
                update: record,
                create: record,
              });
            } else if (modelName === 'Student') {
              await prisma.student.upsert({
                where: { studentId: record.studentId },
                update: {
                  userId: record.userId,
                  firstName: record.firstName,
                  lastName: record.lastName,
                  departmentId: record.departmentId,
                  isDeleted: record.isDeleted,
                  createdAt: record.createdAt
                    ? new Date(record.createdAt)
                    : new Date(),
                },
                create: {
                  userId: record.userId,
                  studentId: record.studentId,
                  firstName: record.firstName,
                  lastName: record.lastName,
                  department: { connect: { id: record.departmentId } },
                  isDeleted: record.isDeleted,
                  createdAt: record.createdAt
                    ? new Date(record.createdAt)
                    : new Date(),
                },
              });
            } else if (modelName === 'Staff') {
              await prisma.staff.upsert({
                where: { staffId: record.staffId },
                update: {
                  userId: record.userId,
                  firstName: record.firstName,
                  lastName: record.lastName,
                  position: record.position,
                  departmentId: record.departmentId,
                  isDeleted: record.isDeleted,
                  createdAt: record.createdAt
                    ? new Date(record.createdAt)
                    : new Date(),
                },
                create: {
                  userId: record.userId,
                  staffId: record.staffId,
                  firstName: record.firstName,
                  lastName: record.lastName,
                  position: record.position,
                  department: { connect: { id: record.departmentId } },
                  isDeleted: record.isDeleted,
                  createdAt: record.createdAt
                    ? new Date(record.createdAt)
                    : new Date(),
                },
              });
            } else if (modelName === 'Faculty') {
              await prisma.faculty.upsert({
                where: { code: record.code },
                update: {
                  name: record.name,
                  deanId: record.deanId,
                  isDeleted: record.isDeleted,
                  createdAt: record.createdAt
                    ? new Date(record.createdAt)
                    : new Date(),
                  updatedAt: record.updatedAt
                    ? new Date(record.updatedAt)
                    : new Date(),
                },
                create: {
                  name: record.name,
                  code: record.code,
                  deanId: record.deanId,
                  isDeleted: record.isDeleted,
                  createdAt: record.createdAt
                    ? new Date(record.createdAt)
                    : new Date(),
                  updatedAt: record.updatedAt
                    ? new Date(record.updatedAt)
                    : new Date(),
                },
              });
            } else if (modelName === 'Dean') {
              await prisma.dean.upsert({
                where: { staffId: record.staffId },
                update: {
                  facultyId: record.facultyId,
                  isDeleted: record.isDeleted,
                },
                create: {
                  staffId: record.staffId,
                  facultyId: record.facultyId,
                  isDeleted: record.isDeleted,
                },
              });
            } else if (modelName === 'HOD') {
              await prisma.hOD.upsert({
                where: { staffId: record.staffId },
                update: {
                  departmentId: record.departmentId,
                  isDeleted: record.isDeleted,
                },
                create: {
                  staffId: record.staffId,
                  departmentId: record.departmentId,
                  isDeleted: record.isDeleted,
                },
              });
            } else if (modelName === 'Department') {
              await prisma.department.upsert({
                where: { code: record.code },
                update: {
                  name: record.name,
                  hodId: record.hodId,
                  facultyId: record.facultyId,
                  isDeleted: record.isDeleted,
                },
                create: {
                  name: record.name,
                  code: record.code,
                  hodId: record.hodId,
                  faculty: { connect: { id: record.facultyId } },
                  isDeleted: record.isDeleted,
                },
              });
            } else if (modelName === 'Course') {
              await prisma.course.upsert({
                where: { code: record.code },
                update: {
                  name: record.name,
                  credits: record.credits,
                  departmentId: record.departmentId,
                  lecturerId: record.lecturerId,
                  isDeleted: record.isDeleted,
                  createdAt: record.createdAt
                    ? new Date(record.createdAt)
                    : new Date(),
                },
                create: {
                  name: record.name,
                  code: record.code,
                  credits: record.credits,
                  department: { connect: { id: record.departmentId } },
                  lecturerId: record.lecturerId,
                  isDeleted: record.isDeleted,
                  createdAt: record.createdAt
                    ? new Date(record.createdAt)
                    : new Date(),
                },
              });
            } else if (modelName === 'Registration') {
              // Assuming 'id' is unique for Registration
              await prisma.registration.upsert({
                where: { id: record.id },
                update: {
                  studentId: record.studentId,
                  academicSessionId: record.academicSessionId,
                  semesterId: record.semesterId,
                  createdAt: record.createdAt
                    ? new Date(record.createdAt)
                    : new Date(),
                  updatedAt: record.updatedAt
                    ? new Date(record.updatedAt)
                    : new Date(),
                  courses: {
                    connect: record.courses.map((courseId) => ({
                      id: courseId,
                    })),
                  },
                },
                create: {
                  id: record.id,
                  student: { connect: { id: record.studentId } },
                  academicSession: {
                    connect: { id: record.academicSessionId },
                  },
                  semester: { connect: { id: record.semesterId } },
                  createdAt: record.createdAt
                    ? new Date(record.createdAt)
                    : new Date(),
                  updatedAt: record.updatedAt
                    ? new Date(record.updatedAt)
                    : new Date(),
                  courses: {
                    connect: record.courses.map((courseId) => ({
                      id: courseId,
                    })),
                  },
                },
              });
            } else if (modelName === 'Result') {
              await prisma.result.upsert({
                where: {
                  studentId_courseId_academicSessionId_semesterId: {
                    studentId: record.studentId,
                    courseId: record.courseId,
                    academicSessionId: record.academicSessionId,
                    semesterId: record.semesterId,
                  },
                },
                update: record,
                create: {
                  student: { connect: { id: record.studentId } },
                  course: { connect: { id: record.courseId } },
                  academicSession: {
                    connect: { id: record.academicSessionId },
                  },
                  semester: { connect: { id: record.semesterId } },
                  score: record.score,
                  grade: record.grade,
                },
              });
            } else if (modelName === 'AcademicSession') {
              await prisma.academicSession.upsert({
                where: { name: record.name },
                update: record,
                create: record,
              });
            } else if (modelName === 'Semester') {
              await prisma.semester.upsert({
                where: {
                  academicSessionId_name: {
                    academicSessionId: record.academicSessionId,
                    name: record.name,
                  },
                },
                update: record,
                create: {
                  name: record.name,
                  academicSession: {
                    connect: { id: record.academicSessionId },
                  },
                },
              });
            } else if (modelName === 'SchoolSetting') {
              // Assuming only one SchoolSetting record
              if (modelData.length > 0) {
                await prisma.schoolSetting.upsert({
                  where: { id: record.id },
                  update: {
                    name: record.name,
                    address: record.address,
                    currentAcademicSessionId: record.currentAcademicSessionId,
                    semestersPerSession: record.semestersPerSession,
                  },
                  create: record,
                });
              }
            } else if (modelName === 'Notification') {
              await prisma.notification.upsert({
                where: { id: record.id },
                update: {
                  userId: record.userId,
                  message: record.message,
                  read: record.read,
                  createdAt: record.createdAt
                    ? new Date(record.createdAt)
                    : new Date(),
                },
                create: {
                  userId: record.userId,
                  message: record.message,
                  read: record.read,
                  createdAt: record.createdAt
                    ? new Date(record.createdAt)
                    : new Date(),
                },
              });
            } else if (modelName === 'Log') {
              await prisma.log.upsert({
                where: { id: record.id },
                update: {
                  origin: record.origin,
                  details: record.details,
                  ipAddress: record.ipAddress,
                  userAgent: record.userAgent,
                  status: record.status,
                  error: record.error,
                  createdAt: record.createdAt
                    ? new Date(record.createdAt)
                    : new Date(),
                  updatedAt: record.updatedAt
                    ? new Date(record.updatedAt)
                    : new Date(),
                },
                create: record,
              });
            } else {
              console.warn(`Model ${modelName} not handled in seed script.`);
            }
          } catch (error) {
            console.error(`Error seeding ${modelName} record:`, record, error);
          }
        }
      } else {
        console.log(`No data to seed for table: ${modelName}`);
      }
    }

    console.log('Database seeding completed.');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
