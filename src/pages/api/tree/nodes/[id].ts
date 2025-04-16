import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === 'PUT') {
        try {
            const { name, category } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Name is required' });
            }

            const node = await prisma.treeNode.update({
                where: { id: id as string },
                data: {
                    name,
                    category
                }
            });

            res.status(200).json(node);
        } catch (error) {
            console.error('Error updating node:', error);
            res.status(500).json({ error: 'Failed to update node' });
        }
    } else if (req.method === 'DELETE') {
        try {
            await prisma.treeNode.delete({
                where: { id: id as string }
            });

            res.status(204).end();
        } catch (error) {
            console.error('Error deleting node:', error);
            res.status(500).json({ error: 'Failed to delete node' });
        }
    } else {
        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 