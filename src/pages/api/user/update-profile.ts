import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';
import authOptions from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions) as Session | null;

        if (!session?.user?.email) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        const { name, email } = req.body;

        // Check if email is already taken by another user
        if (email !== session.user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Diese E-Mail-Adresse wird bereits verwendet' });
            }
        }

        // Get current user
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!currentUser) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        // Update user profile
        await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                name,
                email,
            },
        });

        res.status(200).json({ message: 'Profil erfolgreich aktualisiert' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
    }
} 