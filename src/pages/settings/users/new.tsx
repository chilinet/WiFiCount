import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getServerSession, Session } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';
import authOptions from '@/pages/api/auth/[...nextauth]';
import { getToken } from 'next-auth/jwt';

type Role = 'USER' | 'ADMIN' | 'SUPERADMIN';

interface NewUserPageProps {
    nodes: {
        id: string;
        name: string;
        category: string;
    }[];
    currentUserNodeId: string | null;
}

interface ExtendedSession extends Session {
    user: {
        id: string;
        name: string | null;
        email: string;
        role: string;
        nodeId: string | null;
        node: {
            id: string;
            name: string;
            category: string;
        } | null;
    };
}

export default function NewUserPage({ nodes, currentUserNodeId }: NewUserPageProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER' as Role,
        nodeId: currentUserNodeId
    });

    if (!session) {
        return <div>Bitte melden Sie sich an</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        console.log('*************************************************')
        console.log('Form data:', formData);
        console.log('*************************************************')    
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push('/settings/users');
            } else {
                const data = await response.json();
                setError(data.message || 'Fehler beim Erstellen des Benutzers');
            }
        } catch (error) {
            setError('Ein Fehler ist aufgetreten');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Neuer Benutzer</h1>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Passwort
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Rolle
                    </label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="USER">Benutzer</option>
                        <option value="ADMIN">Administrator</option>
                        {session.user.role === 'SUPERADMIN' && (
                            <option value="SUPERADMIN">Super Administrator</option>
                        )}
                    </select>
                </div>

                {session.user.role === 'SUPERADMIN' && (
                    <div>
                        <label htmlFor="nodeId" className="block text-sm font-medium text-gray-700">
                            Zugewiesener Kunde
                        </label>
                        <select
                            id="nodeId"
                            name="nodeId"
                            value={formData.nodeId || ''}
                            onChange={(e) => setFormData({ ...formData, nodeId: e.target.value || null })}
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

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => router.push('/settings/users')}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Abbrechen
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Speichern
                    </button>
                </div>
            </form>
        </div>
    );
}

export async function getServerSideProps(context: any) {
    const session = await getServerSession(context.req, context.res, authOptions) as ExtendedSession;
    const token = await getToken({ req: context.req, secret: process.env.NEXTAUTH_SECRET });

    console.log('*************************************************')
    console.log('Session:', session);
    console.log('Token:', token);
    console.log('*************************************************')    

    if (!session) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    try {
        const nodes = await prisma.treeNode.findMany({
            where: {
                category: 'KUNDE'
            },
            select: {
                id: true,
                name: true,
                category: true
            }
        });

        return {
            props: {
                nodes,
                currentUserNodeId: token?.nodeId
            },
        };
    } catch (error) {
        console.error('Fehler beim Laden der Kunden:', error);
        return {
            props: {
                nodes: [],
                currentUserNodeId: token?.nodeId
            },
        };
    }
} 