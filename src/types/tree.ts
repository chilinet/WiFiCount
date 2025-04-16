import { TreeNode as PrismaTreeNode } from '@prisma/client';

export type NodeCategory = 'ROOT' | 'KUNDE' | 'STANDORT' | 'BEREICH';

export interface TreeNode extends Omit<PrismaTreeNode, 'createdAt' | 'updatedAt'> {
    children: TreeNode[];
    createdAt: string;
    updatedAt: string;
    category: NodeCategory;
} 