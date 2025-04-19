import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Profile() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user) {
            setProfileData({
                name: session.user.name || '',
                email: session.user.email || '',
            });
        }
    }, [status, session, router]);

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (status === 'unauthenticated') {
        return null;
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/user/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            setSuccess('Profil wurde erfolgreich aktualisiert');
            // Update the session to reflect the changes
            await update();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Die neuen Passwörter stimmen nicht überein');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/user/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            setSuccess('Passwort wurde erfolgreich geändert');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-8">Profil Einstellungen</h1>

                            {error && (
                                <div className="mb-4 p-4 bg-red-50 rounded-md">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="mb-4 p-4 bg-green-50 rounded-md">
                                    <p className="text-sm text-green-700">{success}</p>
                                </div>
                            )}

                            <div className="space-y-8 divide-y divide-gray-200">
                                {/* Profile Section */}
                                <div className="space-y-6 pt-8 first:pt-0">
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">Persönliche Informationen</h3>
                                        <p className="mt-1 text-sm text-gray-500">Aktualisieren Sie Ihre persönlichen Daten.</p>
                                    </div>

                                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? 'Wird gespeichert...' : 'Speichern'}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Password Section */}
                                <div className="space-y-6 pt-8">
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">Passwort ändern</h3>
                                        <p className="mt-1 text-sm text-gray-500">Stellen Sie sicher, dass Ihr Konto ein sicheres Passwort verwendet.</p>
                                    </div>

                                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                        <div>
                                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                                                Aktuelles Passwort
                                            </label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                id="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                                Neues Passwort
                                            </label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                id="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                minLength={8}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                                Neues Passwort bestätigen
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                id="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                minLength={8}
                                                required
                                            />
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? 'Wird geändert...' : 'Passwort ändern'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 