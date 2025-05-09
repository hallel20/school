export type Role = 'Student' | 'Staff' | 'Admin';

export interface User {
    id: string;
    email: string;
    role: Role;
    firstName?: string;
    lastName?: string;
}