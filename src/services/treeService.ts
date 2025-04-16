import { TreeNode } from '../types/tree';

class TreeService {
    private baseUrl = '/api/tree';

    async getTree(): Promise<TreeNode> {
        const response = await fetch(this.baseUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch tree');
        }
        return response.json();
    }

    async createNode(parentId: string, name: string, category: TreeNode['category'] = 'Kunde'): Promise<void> {
        const response = await fetch(`${this.baseUrl}/nodes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ parentId, name, category }),
        });
        if (!response.ok) {
            throw new Error('Failed to create node');
        }
    }

    async updateNode(nodeId: string, name: string, category: TreeNode['category']): Promise<void> {
        const response = await fetch(`${this.baseUrl}/nodes/${nodeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, category }),
        });
        if (!response.ok) {
            throw new Error('Failed to update node');
        }
    }

    async deleteNode(nodeId: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/nodes/${nodeId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete node');
        }
    }

    async moveNode(nodeId: string, newParentId: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nodeId, newParentId }),
        });
        if (!response.ok) {
            throw new Error('Failed to move node');
        }
    }
}

export const treeService = new TreeService(); 