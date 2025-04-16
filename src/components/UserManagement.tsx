import { useState, useEffect, useRef } from 'react';
import { User, UserFormData } from '../types/user';
import { userService } from '../services/userService';
import { useRouter } from 'next/router';
import Layout from './Layout';
import Tree from './Tree';
import NodeDetails from './NodeDetails';
import { TreeNode } from '../types/tree';
import { treeService } from '../services/treeService';

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<UserFormData>({
        username: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const router = useRouter();
    const treeRef = useRef<{ loadTree: () => Promise<void> }>(null);

    useEffect(() => {
        const loadData = async () => {
            const user = await userService.getCurrentUser();
            if (!user) {
                router.push('/login');
                return;
            }
            const allUsers = await userService.getAllUsers();
            setUsers(allUsers);
        };
        loadData();
    }, [router]);

    const handleLogout = async () => {
        await userService.logout();
        router.push('/login');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await userService.createUser(formData);
            const updatedUsers = await userService.getAllUsers();
            setUsers(updatedUsers);
            setShowForm(false);
            setFormData({
                username: '',
                email: '',
                password: '',
                role: 'user'
            });
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await userService.deleteUser(id);
            const updatedUsers = await userService.getAllUsers();
            setUsers(updatedUsers);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleNodeEdit = async (nodeId: string, newName: string, category: TreeNode['category']) => {
        try {
            await treeService.updateNode(nodeId, newName, category);
            // Aktualisiere den ausgewählten Node
            if (selectedNode && selectedNode.id === nodeId) {
                setSelectedNode({
                    ...selectedNode,
                    name: newName,
                    category
                });
            }
            // Tree neu laden
            if (treeRef.current) {
                await treeRef.current.loadTree();
            }
        } catch (error) {
            console.error('Error updating node:', error);
        }
    };

    return (
        <Layout>
            <div className="flex h-screen">
                {/* Linke Seitenleiste (1/3 Breite) */}
                <div className="w-1/3 bg-white shadow-lg min-h-full">
                    <div className="p-6">
                        <Tree ref={treeRef} onSelectNode={setSelectedNode} />
                    </div>
                </div>

                {/* Hauptbereich (2/3 Breite) */}
                <div className="w-2/3 p-6 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        <NodeDetails node={selectedNode} onEdit={handleNodeEdit} />
                    </div>
                </div>
            </div>
        </Layout>
    );
} 