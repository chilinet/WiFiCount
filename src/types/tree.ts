import { TreeNode as PrismaTreeNode } from '@prisma/client';

export type NodeCategory = 'ROOT' | 'KUNDE' | 'STANDORT' | 'BEREICH';

export interface TreeNode {
    id: string;
    name: string;
    parentId: string | null;
    category: string;
    children?: TreeNode[];
    createdAt: string;
    updatedAt: string;
} 