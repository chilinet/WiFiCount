import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === 'PUT') {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Name ist erforderlich' });
            }

            const updatedDevice = await prisma.device.update({
                where: {
                    id: id as string
                },
                data: {
                    name
                }
            });

            return res.status(200).json(updatedDevice);
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Geräts:', error);
            return res.status(500).json({ error: 'Fehler beim Aktualisieren des Geräts' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            await prisma.device.delete({
                where: {
                    id: id as string
                }
            });

            return res.status(204).end();
        } catch (error) {
            console.error('Fehler beim Löschen des Geräts:', error);
            return res.status(500).json({ error: 'Fehler beim Löschen des Geräts' });
        }
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
} 