import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token ist erforderlich' });
        }

        // Find user with this token and check if it's still valid
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });

        if (!user) {
            return res.status(400).json({ error: 'Token ist ungültig oder abgelaufen' });
        }

        res.status(200).json({ valid: true });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
    }
} 