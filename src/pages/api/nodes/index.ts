import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

type NodeCategory = 'ROOT' | 'KUNDE' | 'STANDORT' | 'BEREICH';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const nodes = await prisma.treeNode.findMany({
                orderBy: {
                    name: 'asc'
                }
            });
            res.status(200).json(nodes);
        } catch (error) {
            console.error('Fehler beim Abrufen der Nodes:', error);
            res.status(500).json({ error: 'Fehler beim Abrufen der Nodes' });
        }
    } else if (req.method === 'POST') {
        try {
            const { parentId, name, category } = req.body;

            // Überprüfen, ob die Kategorie für den Parent gültig ist
            if (parentId) {
                const parent = await prisma.treeNode.findUnique({
                    where: { id: parentId }
                });

                if (!parent) {
                    return res.status(400).json({ error: 'Parent Node nicht gefunden' });
                }

                if (parent.category === 'BEREICH' && category !== 'BEREICH') {
                    return res.status(400).json({ error: 'Unter einem Bereich können nur weitere Bereiche erstellt werden' });
                }
            } else if (category !== 'ROOT') {
                return res.status(400).json({ error: 'Root Node muss die Kategorie ROOT haben' });
            }

            const node = await prisma.treeNode.create({
                data: {
                    name,
                    category,
                    parentId
                }
            });

            res.status(201).json(node);
        } catch (error) {
            console.error('Fehler beim Erstellen des Nodes:', error);
            res.status(500).json({ error: 'Fehler beim Erstellen des Nodes' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 