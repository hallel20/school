export type Role = 'Student' | 'Staff' | 'Admin';

export type User = {
    email: string;
    password: string;
    role: Role;
    id: number;
    studentId: number | null;
    student: Student | null;
    staff: Staff | null;
    staffId: number | null;
}

export type Student = {
    id: number;
    studentId: string;
    firstName: string;
    lastName: string;
    userId: number | null;
};
export type Staff = {
    id: number;
    staffId: string;
    firstName: string;
    lastName: string;
    userId: number | null;
}