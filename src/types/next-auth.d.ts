import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface User {
        id: string;
        name: string | null;
        email: string;
        role: string;
        nodeId: string | null;
        node: {
            id: string;
            name: string;
            category: string;
        } | null;
    }

    interface Session {
        user: User;
        expires: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        name: string | null;
        email: string;
        role: string;
        nodeId: string | null;
        node: {
            id: string;
            name: string;
            category: string;
        } | null;
    }
} 