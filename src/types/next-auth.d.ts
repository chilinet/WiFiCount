import 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: string;
            nodeId?: string | null;
            node?: {
                id: string;
                name: string;
                category: string;
            } | null;
        }
    }
} 