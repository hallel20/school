export type Role = 'Student' | 'Staff' | 'Admin';

export enum StaffPosition {
    lecturer = 'lecturer',
    doctor = 'doctor',
    assistant = 'assistant',
    professor = 'professor',
}

export type User = {
    email: string;
    password: string;
    role: Role;
    id: number;
    studentId: number | null;
    student: Student | null;
    staff: Staff | null;
    staffId: number | null;
    facultyId: number | null
}

export type Student = {
    id: number;
    studentId: string;
    firstName: string;
    levelYear: years;
    lastName: string;
    userId: number | null;
    user?: User
    departmentId: number | null;
    department?: Department | null;
};
export type Staff = {
    id: number;
    staffId: string;
    firstName: string;
    lastName: string;
    user?: User;
    position: StaffPosition;
    departmentId: number | null;
    department?: Department | null;
    userId: number | null;
}

export enum Semesters {
    First = 'FirstSemester',
    Second = 'SecondSemester',
    Third = 'ThirdSemester',
    Fourth = 'FourthSemester',
}

export enum years {
    First = 'first',
    Second = 'second',
    Third = 'third',
    Fourth = 'fourth',
    Fifth = 'fifth'
}

export type Course = {
    id: number;
    name: string;
    code: string;
    credits: number;
    students: Student[];
    lecturer: Staff;
    yearLevel: years;
    semester: Semesters;
    departmentId: number;
    department: Department;
    results: Result[];
    lecturerId: number;
    createdAt: string;
    updatedAt: string;
};


export type Result = {
    id: number;
    studentId: number;
    courseId: number;
    course?: Course;
    student?: Student;
    score: number;
    grade: string;
    semesterId: number;
    academicSessionId: number;
}


export type Department = {
    id: number;
    name: string;
    code: string;
    hodId: number | null;
    facultyId: number;
    courses: Course[];
    hod: Staff | null;
    faculty: Faculty | null;
    students?: Student[];
    staff?: Staff[];
};

export type Faculty = {
    id: number;
    name: string;
    code: string;
    dean?: Staff;
    deanId?: number | null;
    departments: Department[];
}

export type AcademicSession = {
    id: number;
    name: string;
    semesters: Semester[];
    results: Result[];
    current?: boolean;
    schoolSettingId: number | null;
    registrations: Registration[];
}

export type Semester = {
    id: number;
    name: string;
    academicSession: AcademicSession;
    academicSessionId: number;
    results: Result[];
    registrations: Registration[];
}

export type SchoolSetting = {
    id: number;
    name: string;
    address: string;
    maximumCreditUnit: number;
    currentAcademicSessionId: number | null;
    currentAcademicSession: AcademicSession | null;
    semestersPerSession: number;
}

export type Registration = {
    id: number;
    studentId: number;
    semesterId: number;
    academicSessionId: number;
    student: Student;
    semester: Semester;
    academicSession: AcademicSession;
    courses: Course[];
}


// This structure should align with what your backend provides
export interface AllowedCourseDetail {
    id: number;
    code: string;
    name: string;
    credits: number;
    // any other relevant course fields
}

export interface AllowedCoursesApiResponseItem {
    id: number; // ID of the AllowedCourses rule
    departmentId: number;
    yearLevel: string; // e.g., 'first', 'second'
    semester: string; // e.g., 'FirstSemester', 'SecondSemester' (matching Prisma's CourseSemester enum)
    allowedEntries: Array<{
        id: number; // AllowedCourseEntry ID
        course: AllowedCourseDetail;
    }>;
}

// The API would return: AllowedCoursesApiResponseItem[]