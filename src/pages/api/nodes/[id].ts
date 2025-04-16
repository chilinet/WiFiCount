import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

type NodeCategory = 'ROOT' | 'KUNDE' | 'STANDORT' | 'BEREICH';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === 'PUT') {
        try {
            const { name, category } = req.body;

            // Überprüfen, ob die Kategorie gültig ist
            const node = await prisma.treeNode.findUnique({
                where: { id: id as string },
                include: { children: true }
            });

            if (!node) {
                return res.status(404).json({ error: 'Node nicht gefunden' });
            }

            // Root Node darf nur ROOT sein
            if (node.parentId === null && category !== 'ROOT') {
                return res.status(400).json({ error: 'Root Node muss die Kategorie ROOT haben' });
            }

            // Wenn der Node Kinder hat, überprüfen ob die neue Kategorie gültig ist
            if (node.children.length > 0) {
                if (category === 'BEREICH' && node.children.some(child => child.category !== 'BEREICH')) {
                    return res.status(400).json({ error: 'Unter einem Bereich können nur weitere Bereiche sein' });
                }
            }

            const updatedNode = await prisma.treeNode.update({
                where: { id: id as string },
                data: { name, category }
            });

            res.status(200).json(updatedNode);
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Nodes:', error);
            res.status(500).json({ error: 'Fehler beim Aktualisieren des Nodes' });
        }
    } else if (req.method === 'DELETE') {
        try {
            await prisma.treeNode.delete({
                where: { id: id as string }
            });

            res.status(204).end();
        } catch (error) {
            console.error('Fehler beim Löschen des Nodes:', error);
            res.status(500).json({ error: 'Fehler beim Löschen des Nodes' });
        }
    } else {
        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 