import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Funktion zum Erstellen eines Testbenutzers
async function createTestUser() {
    const testUser = await prisma.user.findUnique({
        where: { email: 'test@example.com' }
    });

    if (!testUser) {
        const hashedPassword = await bcrypt.hash('test123', 12);
        await prisma.user.create({
            data: {
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword,
                role: 'SUPERADMIN'
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
                        node: {
                            select: {
                                id: true,
                                name: true,
                                category: true,
                            },
                        },
                    },
                });

                if (!user || !user.password) {
                    throw new Error('Ungültige Anmeldedaten');
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error('Ungültige Anmeldedaten');
                }

                return {
                    id: user.id,
                    email: user.email || '',  // Ensure email is never null
                    name: user.name,
                    role: user.role || 'USER',
                    nodeId: user.nodeId,
                    image: user.image,
                    node: user.node ? {
                        id: user.node.id,
                        name: user.node.name,
                        category: user.node.category,
                    } : null,
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
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.role = user.role;
                token.nodeId = user.nodeId;
                token.image = user.image;
                token.node = user.node;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    id: token.id,
                    email: token.email,
                    name: token.name,
                    role: token.role,
                    nodeId: token.nodeId,
                    image: token.image,
                    node: token.node,
                };
            }
            return session;
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