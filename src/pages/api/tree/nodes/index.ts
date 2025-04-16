import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { name, parentId } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Name is required' });
            }

            const node = await prisma.treeNode.create({
                data: {
                    name,
                    parent: parentId ? {
                        connect: {
                            id: parentId
                        }
                    } : undefined
                }
            });

            res.status(201).json(node);
        } catch (error) {
            console.error('Error creating node:', error);
            res.status(500).json({ error: 'Failed to create node' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 