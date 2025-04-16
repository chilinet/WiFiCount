import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { User, TreeNode } from '@prisma/client';

interface ExtendedUser extends User {
    nodeId: string | null;
}

interface UsersPageProps {
    initialUsers: ExtendedUser[];
    nodes: TreeNode[];
}

export default function UsersPage({ initialUsers, nodes }: UsersPageProps) {
    const router = useRouter();
    const [users, setUsers] = useState<ExtendedUser[]>(initialUsers);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleEdit = (userId: string) => {
        router.push(`/settings/users/${userId}`);
    };

    const handleCreate = () => {
        router.push('/settings/users/new');
    };

    const getRoleDisplay = (role: string) => {
        switch (role) {
            case 'SUPERADMIN':
                return 'Super Administrator';
            case 'ADMIN':
                return 'Administrator';
            case 'USER':
                return 'Benutzer';
            default:
                return role;
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Benutzerverwaltung</h1>
                    <button
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Benutzer hinzufügen
                    </button>
                </div>
                {message && (
                    <div className={`mb-4 p-4 rounded-md ${
                        message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    E-Mail
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rolle
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Zugewiesener Kunde
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aktionen
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.name || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getRoleDisplay(user.role)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.nodeId ? 
                                            nodes.find(node => node.id === user.nodeId)?.name || '-' 
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(user.id)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Bearbeiten
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}

export async function getServerSideProps() {
    const { prisma } = require('@/lib/prisma');
    
    try {
        const [users, nodes] = await Promise.all([
            prisma.user.findMany({
                orderBy: {
                    email: 'asc'
                }
            }),
            prisma.treeNode.findMany({
                orderBy: {
                    name: 'asc'
                }
            })
        ]);

        return {
            props: {
                initialUsers: JSON.parse(JSON.stringify(users)),
                nodes: JSON.parse(JSON.stringify(nodes))
            }
        };
    } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        return {
            props: {
                initialUsers: [],
                nodes: []
            }
        };
    }
} 