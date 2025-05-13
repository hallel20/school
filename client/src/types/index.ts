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
    lastName: string;
    userId: number | null;
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

export type Course = {
    id: number;
    name: string;
    code: string;
    credits: number;
    students: Student[];
    lecturer: Staff;
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
    score: number;
    student: Student;
    course: Course;
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