import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token) {
            return res.status(403).json({ error: 'Nicht authentifiziert' });
        }

        // Prüfe, ob eine Impersonation aktiv ist
        if (!token.isImpersonated || !token.impersonatedBy) {
            return res.status(400).json({ error: 'Keine aktive Impersonation' });
        }

        // Hole den ursprünglichen SUPERADMIN-Benutzer
        const originalUser = await prisma.user.findUnique({
            where: { id: token.impersonatedBy as string },
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

        if (!originalUser) {
            return res.status(404).json({ error: 'Ursprünglicher Benutzer nicht gefunden' });
        }

        // Setze einen Cookie, um zurück zum ursprünglichen Benutzer zu wechseln
        res.setHeader('Set-Cookie', [
            `next-auth.restore.email=${originalUser.email}; Path=/; HttpOnly; SameSite=Lax; Max-Age=60`,
        ]);

        return res.status(200).json({
            success: true,
            email: originalUser.email,
            message: 'Zurück zum ursprünglichen Benutzer',
        });
    } catch (error) {
        console.error('Fehler beim Beenden der Impersonation:', error);
        return res.status(500).json({ error: 'Fehler beim Beenden der Impersonation' });
    }
}

