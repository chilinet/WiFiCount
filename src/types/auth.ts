export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
    SUPERADMIN = 'SUPERADMIN'
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    nodeId?: string;
} 