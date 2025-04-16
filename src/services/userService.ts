import { User, LoginCredentials, UserFormData } from '../types/user';

class UserService {
    private users: User[] = [];
    private currentUser: User | null = null;

    constructor() {
        // Initialize with an admin user for testing
        this.users.push({
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    async login(credentials: LoginCredentials): Promise<User | null> {
        const user = this.users.find(
            u => u.email === credentials.email && u.password === credentials.password
        );
        if (user) {
            this.currentUser = user;
            return user;
        }
        return null;
    }

    async logout(): Promise<void> {
        this.currentUser = null;
    }

    async getCurrentUser(): Promise<User | null> {
        return this.currentUser;
    }

    async getAllUsers(): Promise<User[]> {
        return this.users;
    }

    async createUser(userData: UserFormData): Promise<User> {
        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.users.push(newUser);
        return newUser;
    }

    async updateUser(id: string, userData: Partial<UserFormData>): Promise<User | null> {
        const index = this.users.findIndex(u => u.id === id);
        if (index === -1) return null;

        this.users[index] = {
            ...this.users[index],
            ...userData,
            updatedAt: new Date()
        };
        return this.users[index];
    }

    async deleteUser(id: string): Promise<boolean> {
        const initialLength = this.users.length;
        this.users = this.users.filter(u => u.id !== id);
        return this.users.length !== initialLength;
    }
}

export const userService = new UserService(); 