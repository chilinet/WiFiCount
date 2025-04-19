import 'next-auth';
import { JWT } from 'next-auth/jwt';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface User {
        id: string;
        email: string;
        name: string | null;
        role: string;
        nodeId: string | null;
        image: string | null;
        node: {
            id: string;
            name: string;
            category: string;
        } | null;
    }

    interface Session {
        user: {
            id: string;
            email: string;
            name: string | null;
            role: string;
            nodeId: string | null;
            image: string | null;
            node: {
                id: string;
                name: string;
                category: string;
            } | null;
        };
        expires: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        email: string;
        name: string | null;
        role: string;
        nodeId: string | null;
        image: string | null;
        node: {
            id: string;
            name: string;
            category: string;
        } | null;
    }
} 