export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    createdAt: Date;
    updatedAt: Date;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface UserFormData {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
} 