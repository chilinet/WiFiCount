import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';
import authOptions from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions) as Session | null;

        if (!session?.user?.email) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        const { currentPassword, newPassword } = req.body;

        // Get user with current password
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                password: true,
            },
        });

        if (!user?.password) {
            return res.status(400).json({ error: 'Benutzer hat kein Passwort gesetzt' });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({ error: 'Aktuelles Passwort ist nicht korrekt' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
            },
        });

        res.status(200).json({ message: 'Passwort erfolgreich geändert' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
    }
} 