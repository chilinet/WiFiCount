import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
        try {
            const { nodeId, newParentId } = req.body;

            // Verhindere, dass ein Node sein eigener Parent wird
            if (nodeId === newParentId) {
                return res.status(400).json({ error: 'Node cannot be its own parent' });
            }

            // Aktualisiere die Parent-ID des Nodes
            const updatedNode = await prisma.treeNode.update({
                where: { id: nodeId },
                data: { parentId: newParentId }
            });

            res.json(updatedNode);
        } catch (error) {
            res.status(500).json({ error: 'Error moving tree node' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 