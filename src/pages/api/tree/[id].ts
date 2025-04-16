import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    if (req.method === 'PUT') {
        try {
            const { name } = req.body;
            const node = await prisma.treeNode.update({
                where: { id },
                data: { name }
            });
            res.json(node);
        } catch (error) {
            res.status(500).json({ error: 'Error updating tree node' });
        }
    } else if (req.method === 'DELETE') {
        try {
            // Finde alle Kindknoten
            const children = await findAllChildren(id);
            
            // Lösche alle Kindknoten
            for (const childId of children) {
                await prisma.treeNode.delete({
                    where: { id: childId }
                });
            }

            // Lösche den Knoten selbst
            await prisma.treeNode.delete({
                where: { id }
            });
            
            res.status(200).json({ message: 'Node deleted' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting tree node' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}

async function findAllChildren(nodeId: string): Promise<string[]> {
    const children: string[] = [];
    const directChildren = await prisma.treeNode.findMany({
        where: { parentId: nodeId }
    });

    for (const child of directChildren) {
        children.push(child.id);
        const grandChildren = await findAllChildren(child.id);
        children.push(...grandChildren);
    }

    return children;
} 