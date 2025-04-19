import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { User, TreeNode } from '@prisma/client';
import { getToken } from "next-auth/jwt";

interface ExtendedUser extends User {
    nodeId: string | null;
}

interface EditUserPageProps {
    user: ExtendedUser;
    nodes: TreeNode[];
    role: string;
}

export default function EditUserPage({ user: initialUser, nodes, role }: EditUserPageProps) {
    const router = useRouter();
    const [user, setUser] = useState<ExtendedUser>(initialUser);
    const [password, setPassword] = useState('');
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
                    nodeId: user.nodeId,
                    password: password || undefined // Only send password if it's not empty
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
        if (name === 'password') {
            setPassword(value);
        } else {
            setUser(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Benutzer bearbeiten</h1>
            </div>
            
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
                        value={user.email || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Neues Passwort
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={handleChange}
                        placeholder="Leer lassen, um das Passwort nicht zu ändern"
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
                        value={user.role || 'USER'}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        {role === 'SUPERADMIN' && (
                            <option value="SUPERADMIN">Super Administrator</option>
                        )}
                        <option value="ADMIN">Administrator</option>
                        <option value="USER">Benutzer</option>
                    </select>
                </div>

                {role === 'SUPERADMIN' && (
                    <div>
                        <label htmlFor="nodeId" className="block text-sm font-medium text-gray-700">
                            Zugewiesener Kunde
                        </label>
                        <select
                            id="nodeId"
                            name="nodeId"
                            value={user.nodeId || ''}
                            onChange={(e) => setUser(prev => ({ ...prev, nodeId: e.target.value || null }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            <option value="">Kein Kunde zugewiesen</option>
                            {nodes.map((node) => (
                                <option key={node.id} value={node.id}>
                                    {node.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

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
    );
}

export async function getServerSideProps({ params, req }: { params: { id: string }, req: any }) {
    const { prisma } = require('@/lib/prisma');

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    console.log('***************user_id**************************')
    console.log('Token:', token);
    console.log('*************************************************')
    try {
        const [user, nodes] = await Promise.all([
            prisma.user.findUnique({
                where: { id: params.id }
            }),
            prisma.treeNode.findMany({
                where: {
                    category: 'KUNDE'
                },
                orderBy: {
                    name: 'asc'
                }
            })
        ]);
//        console.log('*************************************************')
//        console.log('User:', user);
//        console.log('Nodes:', nodes);
//        console.log('*************************************************')

        if (!user) {
            return {
                notFound: true
            };
        }

        return {
            props: {
                user: JSON.parse(JSON.stringify(user)),
                nodes: JSON.parse(JSON.stringify(nodes)),
                role: token?.role
            }
        };
    } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        return {
            notFound: true
        };
    }
} 