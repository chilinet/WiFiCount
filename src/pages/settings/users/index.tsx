import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getServerSession, Session } from 'next-auth';
import Layout from '@/components/Layout';
import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';
import { PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import authOptions from '@/pages/api/auth/[...nextauth]';
import { getToken } from "next-auth/jwt";


interface UsersPageProps {
    users: (User & {
        node: {
            id: string;
            name: string;
            category: string;
        } | null;
    })[];
}

export default function UsersPage({ users }: UsersPageProps) {
    const { data: session } = useSession();

    const node = session?.user?.node;
    console.log('*************************************************')    
    console.log('Node:', node);
    console.log('*************************************************')
    console.log('Client Session:', session);

    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isImpersonating, setIsImpersonating] = useState<string | null>(null);

    const handleDelete = async (userId: string) => {
        if (!confirm('Möchten Sie diesen Benutzer wirklich löschen?')) return;
        
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                router.reload();
            } else {
                alert('Fehler beim Löschen des Benutzers');
            }
        } catch (error) {
            console.error('Fehler beim Löschen:', error);
            alert('Fehler beim Löschen des Benutzers');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleImpersonate = async (userId: string, userEmail: string) => {
        if (!confirm('Möchten Sie sich als dieser Benutzer anmelden?')) return;
        
        setIsImpersonating(userId);
        try {
            // Rufe die Impersonation-API auf, die einen Cookie setzt
            const response = await fetch('/api/auth/impersonate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Wichtig: Cookies müssen mitgesendet werden
                body: JSON.stringify({ userEmail }),
            });

            if (response.ok) {
                // Jetzt melden wir uns mit signIn an, der den Cookie liest
                const { signIn } = await import('next-auth/react');
                const result = await signIn('credentials', {
                    email: userEmail,
                    password: '', // Wird nicht benötigt, da Impersonation über Cookie erkannt wird
                    redirect: false,
                });

                if (result?.ok) {
                    // Weiterleitung zum Dashboard
                    window.location.href = '/dashboard';
                } else {
                    alert('Fehler bei der Impersonation. Bitte versuchen Sie es erneut.');
                }
            } else {
                const error = await response.json();
                alert(error.error || 'Fehler bei der Impersonation');
            }
        } catch (error) {
            console.error('Fehler bei der Impersonation:', error);
            alert('Fehler bei der Impersonation');
        } finally {
            setIsImpersonating(null);
        }
    };

    if (!session) {
        return <div>Bitte melden Sie sich an</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Benutzerverwaltung</h1>
                <button
                    onClick={() => router.push('/settings/users/new')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Neuer Benutzer
                </button>
            </div>

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
                            {session.user.role === 'SUPERADMIN' && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Zugewiesener Kunde
                                </th>
                            )}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aktionen
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.role === 'SUPERADMIN' 
                                            ? 'bg-purple-100 text-purple-800'
                                            : user.role === 'ADMIN'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                {session.user.role === 'SUPERADMIN' && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {user.node?.name ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {user.node.name}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Kein Kunde zugewiesen
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end items-center space-x-2">
                                        <button
                                            onClick={() => router.push(`/settings/users/${user.id}`)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Bearbeiten"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        {session.user.role === 'SUPERADMIN' && (
                                            <>
                                                <button
                                                    onClick={() => handleImpersonate(user.id, user.email || '')}
                                                    disabled={isImpersonating === user.id}
                                                    className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                                    title="Als Benutzer anmelden"
                                                >
                                                    <UserIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    disabled={isDeleting}
                                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                    title="Löschen"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export async function getServerSideProps(context: any) {
    const session = await getServerSession(context.req, context.res, authOptions) as Session | null;
    
    //console.log('*************************************************')
    //console.log('Cookies:', context.req.headers.cookie);
    //console.log('*************************************************')
    
    //console.log('*************************************************')
    const token = await getToken({ req: context.req, secret: process.env.NEXTAUTH_SECRET });
    //console.log('Decoded token:', token);
    //console.log('*************************************************')
    if (!session) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    //console.log('+++++++++++++++++++++++++++++++++++++++++++++++++ ')
    //console.log('user.id:', token?.id);
    //console.log('user.email:', token?.email);
    //console.log('user.role:', token?.role);
    //console.log('user.nodeId:', token?.nodeId);
    //console.log('user.node:', token?.node);
    //console.log('+++++++++++++++++++++++++++++++++++++++++++++++++ ')

    try {
        console.log('*************************************************');
        console.log('Raw Server Session:', session);
        
        // Sicherstellen, dass alle Werte serialisierbar sind
        const serializableSession = {
            ...session,
            user: {
                ...session.user,
                id: session.user.id || null,
                name: session.user.name || null,
                email: session.user.email || null,
                role: session.user.role || null,
                nodeId: session.user.nodeId || null,
                image: session.user.image || null,
                node: session.user.node ? {
                    id: session.user.node.id || null,
                    name: session.user.node.name || null,
                    category: session.user.node.category || null
                } : null
            }
        };

        console.log('Serialized Server Session:', serializableSession);
        console.log('*************************************************');

        let users;
        
        if (token?.role === 'SUPERADMIN') {
            users = await prisma.user.findMany({
                include: {
                    node: true
                },
                orderBy: {
                    name: 'asc',
                },
            });
        } else if (token?.role === 'ADMIN' && token?.nodeId) {
            const adminNodeId = token?.nodeId;
            users = await prisma.user.findMany({
                where: {
                    nodeId: adminNodeId,
                    role: {
                        in: ['ADMIN', 'USER']
                    }
                },
                include: {
                    node: true
                },
                orderBy: {
                    name: 'asc',
                },
            });
        } else {
            users = await prisma.user.findMany({
                where: {
                    id: token?.id
                },
                include: {
                    node: true
                }
            });
        }

        return {
            props: {
                session: serializableSession,
                users: JSON.parse(JSON.stringify(users)),
            },
        };
    } catch (error) {
        console.error('Fehler beim Laden der Benutzer:', error);
        return {
            props: {
                session: null,
                users: [],
            },
        };
    }
} 