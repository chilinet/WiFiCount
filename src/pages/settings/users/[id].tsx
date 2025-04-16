import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { User, TreeNode } from '@prisma/client';

interface ExtendedUser extends User {
    nodeId: string | null;
}

interface EditUserPageProps {
    user: ExtendedUser;
    nodes: TreeNode[];
}

export default function EditUserPage({ user: initialUser, nodes }: EditUserPageProps) {
    const router = useRouter();
    const [user, setUser] = useState<ExtendedUser>(initialUser);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    nodeId: user.nodeId
                }),
            });

            if (response.ok) {
                router.push('/settings/users');
            } else {
                const data = await response.json();
                setError(data.error || 'Fehler beim Aktualisieren des Benutzers');
            }
        } catch (error) {
            setError('Ein Fehler ist aufgetreten');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Benutzer bearbeiten</h1>
                    
                    {error && (
                        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={user.name || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                E-Mail
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={user.email}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                Rolle
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={user.role}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="SUPERADMIN">Super Administrator</option>
                                <option value="ADMIN">Administrator</option>
                                <option value="USER">Benutzer</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="nodeId" className="block text-sm font-medium text-gray-700">
                                Zugewiesener Kunde
                            </label>
                            <select
                                id="nodeId"
                                name="nodeId"
                                value={user.nodeId || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Kein Kunde ausgewählt</option>
                                {nodes
                                    .filter(node => node.category === 'KUNDE')
                                    .map(node => (
                                        <option key={node.id} value={node.id}>
                                            {node.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => router.push('/settings/users')}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Abbrechen
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}

export async function getServerSideProps({ params }: { params: { id: string } }) {
    const { prisma } = require('@/lib/prisma');
    
    try {
        const [user, nodes] = await Promise.all([
            prisma.user.findUnique({
                where: { id: params.id }
            }),
            prisma.treeNode.findMany({
                orderBy: {
                    name: 'asc'
                }
            })
        ]);

        if (!user) {
            return {
                notFound: true
            };
        }

        return {
            props: {
                user: JSON.parse(JSON.stringify(user)),
                nodes: JSON.parse(JSON.stringify(nodes))
            }
        };
    } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        return {
            notFound: true
        };
    }
} 