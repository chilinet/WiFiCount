import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare, hash } from 'bcryptjs';

// Funktion zum Erstellen eines Testbenutzers
async function createTestUser() {
    const testUser = await prisma.user.findUnique({
        where: { email: 'test@example.com' }
    });

    if (!testUser) {
        const hashedPassword = await hash('test123', 12);
        await prisma.user.create({
            data: {
                username: 'Test User',
                email: 'test@example.com',
                password: hashedPassword,
                role: 'admin'
            }
        });
        console.log('Testbenutzer erstellt');
    }
}

// Erstelle Testbenutzer beim Start
createTestUser().catch(console.error);

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email und Passwort sind erforderlich');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: {
                        node: true
                    }
                });

                if (!user) {
                    throw new Error('Benutzer nicht gefunden');
                }

                const isValid = await compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error('Ungültiges Passwort');
                }

                // Ensure all required fields are present and not undefined
                return {
                    id: user.id,
                    email: user.email,
                    name: user.username || null,
                    role: user.role || 'user',
                    nodeId: user.nodeId || null,
                    node: user.node ? {
                        id: user.node.id,
                        name: user.node.name,
                        category: user.node.category
                    } : null
                };
            }
        })
    ],
    pages: {
        signIn: '/login',
        signOut: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    role: user.role,
                    nodeId: user.nodeId,
                    node: user.node,
                    name: user.name,
                    email: user.email
                };
            }
            return token;
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id as string,
                    name: token.name as string | null,
                    email: token.email as string,
                    role: token.role as string,
                    nodeId: token.nodeId as string | null,
                    node: token.node as any,
                    image: null
                }
            };
        }
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 Tage
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
}); 