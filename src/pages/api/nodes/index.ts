import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

type NodeCategory = 'ROOT' | 'KUNDE' | 'STANDORT' | 'BEREICH';

// Helper-Funktion: Finde alle Nachfolger-Nodes eines bestimmten Nodes
async function findAllDescendants(nodeId: string): Promise<string[]> {
    const descendants: string[] = [];
    const directChildren = await prisma.treeNode.findMany({
        where: { parentId: nodeId }
    });

    for (const child of directChildren) {
        descendants.push(child.id);
        const grandChildren = await findAllDescendants(child.id);
        descendants.push(...grandChildren);
    }

    return descendants;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            // Prüfe Authentifizierung
            const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
            
            let nodes;
            
            if (token?.role === 'SUPERADMIN') {
                // SUPERADMIN sieht alle Nodes
                nodes = await prisma.treeNode.findMany({
                    orderBy: {
                        name: 'asc'
                    }
                });
            } else if (token?.role === 'ADMIN' && token?.nodeId && token.nodeId !== 'NULL' && token.nodeId !== null) {
                // ADMIN sieht nur Nodes ab seinem zugewiesenen Kunden
                const adminNodeId = token.nodeId as string;
                
                // Finde alle Nachfolger-Nodes
                const descendantIds = await findAllDescendants(adminNodeId);
                const allowedNodeIds = [adminNodeId, ...descendantIds];
                
                nodes = await prisma.treeNode.findMany({
                    where: {
                        id: {
                            in: allowedNodeIds
                        }
                    },
                    orderBy: {
                        name: 'asc'
                    }
                });
            } else {
                // USER oder nicht authentifizierte Benutzer sehen keine Nodes
                nodes = [];
            }
            
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