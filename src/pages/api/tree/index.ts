import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const nodes = await prisma.treeNode.findMany();

            if (nodes.length === 0) {
                // Create root node if none exists
                const rootNode = await prisma.treeNode.create({
                    data: {
                        name: 'Chilinet',
                        category: 'ROOT'
                    }
                });
                return res.status(200).json({
                    id: rootNode.id,
                    name: rootNode.name,
                    category: rootNode.category,
                    children: [],
                    isExpanded: true
                });
            }

            // Build tree structure
            const nodeMap = new Map<string, any>();
            nodes.forEach(node => {
                nodeMap.set(node.id, {
                    id: node.id,
                    name: node.name,
                    category: node.category,
                    children: [],
                    isExpanded: true
                });
            });

            // Link nodes
            nodes.forEach(node => {
                if (node.parentId) {
                    const parent = nodeMap.get(node.parentId);
                    const child = nodeMap.get(node.id);
                    if (parent && child) {
                        parent.children.push(child);
                    }
                }
            });

            // Find root node
            const rootNode = nodes.find(node => !node.parentId);
            if (!rootNode) throw new Error('Root node not found');

            res.status(200).json(nodeMap.get(rootNode.id));
        } catch (error) {
            console.error('Error fetching tree:', error);
            res.status(500).json({ error: 'Failed to fetch tree' });
        }
    } else if (req.method === 'POST') {
        try {
            const { name, parentId, category } = req.body;
            const node = await prisma.treeNode.create({
                data: {
                    name,
                    parentId,
                    category: category || 'KUNDE'
                }
            });
            res.status(201).json(node);
        } catch (error) {
            res.status(500).json({ error: 'Error creating tree node' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 