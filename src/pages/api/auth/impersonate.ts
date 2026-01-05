import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import authOptions from './[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        // Prüfe, ob der aktuelle Benutzer SUPERADMIN ist
        const session = await getServerSession(req, res, authOptions);
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        console.log('[impersonate] Session:', session);
        console.log('[impersonate] Token:', token);
        console.log('[impersonate] Token role:', token?.role);

        if (!session || !token) {
            return res.status(403).json({ error: 'Nicht authentifiziert' });
        }

        if (token.role !== 'SUPERADMIN') {
            return res.status(403).json({ error: `Nur SUPERADMIN kann diese Funktion nutzen. Ihre Rolle: ${token.role}` });
        }

        const { userEmail } = req.body;

        if (!userEmail) {
            return res.status(400).json({ error: 'userEmail ist erforderlich' });
        }

        // Hole den Benutzer, als der sich angemeldet werden soll
        const targetUser = await prisma.user.findUnique({
            where: { email: userEmail },
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

        if (!targetUser) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        // Setze einen temporären Cookie, der die Impersonation signalisiert
        // Dieser Cookie wird im authorize-Callback gelesen
        res.setHeader('Set-Cookie', [
            `next-auth.impersonate.email=${targetUser.email}; Path=/; HttpOnly; SameSite=Lax; Max-Age=60`,
            `next-auth.impersonate.by=${token.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=60`,
        ]);

        return res.status(200).json({
            success: true,
            email: targetUser.email,
            message: 'Impersonation gestartet. Bitte melden Sie sich jetzt an.',
        });
    } catch (error) {
        console.error('Fehler bei der Impersonation:', error);
        return res.status(500).json({ error: 'Fehler bei der Impersonation' });
    }
}

