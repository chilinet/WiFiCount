import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const { areaId } = req.query;
            
            if (!areaId) {
                return res.status(400).json({ error: 'areaId ist erforderlich' });
            }

            const devices = await prisma.device.findMany({
                where: {
                    areaId: areaId as string
                },
                orderBy: {
                    name: 'asc'
                }
            });
            console.log('============================================');
            console.log(devices);
            console.log('============================================');
            return res.status(200).json(devices);
        } catch (error) {
            console.error('Fehler beim Laden der Geräte:', error);
            return res.status(500).json({ error: 'Fehler beim Laden der Geräte' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { macAddress, name, areaId } = req.body;

            if (!macAddress || !name || !areaId) {
                return res.status(400).json({ error: 'MAC-Adresse, Name und Bereich sind erforderlich' });
            }

            const device = await prisma.device.create({
                data: {
                    macAddress,
                    name,
                    areaId
                }
            });

            return res.status(201).json(device);
        } catch (error) {
            console.error('Fehler beim Erstellen des Geräts:', error);
            return res.status(500).json({ error: 'Fehler beim Erstellen des Geräts' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
} 