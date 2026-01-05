import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getToken } from 'next-auth/jwt';

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
                password: { label: "Password", type: "password" },
                impersonate: { label: "Impersonate", type: "text" }
            },
            async authorize(credentials, req) {
                // Wiederherstellung zum ursprünglichen Benutzer
                const cookies = (req as any)?.headers?.cookie || '';
                const restoreEmail = cookies.match(/next-auth\.restore\.email=([^;]+)/)?.[1];
                
                if (restoreEmail) {
                    // Hole den ursprünglichen Benutzer
                    const user = await prisma.user.findUnique({
                        where: { email: decodeURIComponent(restoreEmail) },
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

                    if (!user) {
                        throw new Error('Benutzer nicht gefunden');
                    }

                    return {
                        id: user.id,
                        email: user.email || '',
                        name: user.name,
                        role: user.role || 'USER',
                        nodeId: user.nodeId,
                        image: user.image,
                        node: user.node ? {
                            id: user.node.id,
                            name: user.node.name,
                            category: user.node.category,
                        } : null,
                        impersonatedBy: undefined,
                        isImpersonated: false,
                    };
                }

                // Impersonation-Modus - prüfe Cookie
                const impersonateEmail = cookies.match(/next-auth\.impersonate\.email=([^;]+)/)?.[1];
                const impersonatedBy = cookies.match(/next-auth\.impersonate\.by=([^;]+)/)?.[1];
                
                if (impersonateEmail && impersonatedBy) {
                    // Prüfe, ob der Benutzer, der die Impersonation durchführt, SUPERADMIN ist
                    const adminUser = await prisma.user.findUnique({
                        where: { id: impersonatedBy },
                        select: { role: true }
                    });

                    if (!adminUser || adminUser.role !== 'SUPERADMIN') {
                        throw new Error('Nur SUPERADMIN kann Impersonation durchführen');
                    }

                    // Hole den Benutzer, als der sich angemeldet werden soll
                    const user = await prisma.user.findUnique({
                        where: { email: decodeURIComponent(impersonateEmail) },
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

                    if (!user) {
                        throw new Error('Benutzer nicht gefunden');
                    }

                    return {
                        id: user.id,
                        email: user.email || '',
                        name: user.name,
                        role: user.role || 'USER',
                        nodeId: user.nodeId,
                        image: user.image,
                        node: user.node ? {
                            id: user.node.id,
                            name: user.node.name,
                            category: user.node.category,
                        } : null,
                        impersonatedBy: impersonatedBy,
                        isImpersonated: true,
                    };
                }

                // Normaler Login
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
        async jwt({ token, user, trigger, session }) {
            // Wenn ein User-Objekt vorhanden ist (beim Login oder Impersonation)
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.role = user.role;
                token.nodeId = user.nodeId;
                token.image = user.image;
                token.node = user.node;
                // Impersonation-Flags setzen, falls vorhanden
                if ((user as any).impersonatedBy) {
                    token.impersonatedBy = (user as any).impersonatedBy;
                    token.isImpersonated = true;
                } else {
                    token.impersonatedBy = undefined;
                    token.isImpersonated = false;
                }
            }
            // Wenn die Session aktualisiert wird (z.B. bei Impersonation)
            if (trigger === 'update' && session) {
                if ((session as any).impersonate) {
                    token.id = (session as any).id;
                    token.email = (session as any).email;
                    token.name = (session as any).name;
                    token.role = (session as any).role;
                    token.nodeId = (session as any).nodeId;
                    token.image = (session as any).image;
                    token.node = (session as any).node;
                    token.impersonatedBy = (session as any).impersonatedBy;
                    token.isImpersonated = (session as any).isImpersonated;
                }
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
                // Impersonation-Informationen hinzufügen
                if (token.isImpersonated) {
                    (session as any).isImpersonated = true;
                    (session as any).impersonatedBy = token.impersonatedBy;
                }
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