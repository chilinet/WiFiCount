import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Bars3Icon, XMarkIcon, UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSignOut = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Abmelden gestartet');
        try {
            console.log('Session vor Abmelden:', session);
            setIsUserMenuOpen(false);
            setIsMobileMenuOpen(false);
            
            const result = await signOut({ 
                redirect: false,
                callbackUrl: '/login'
            });
            
            console.log('Abmelden Ergebnis:', result);
            router.push('/login');
        } catch (error) {
            console.error('Fehler beim Abmelden:', error);
            router.push('/login');
        }
    };

    const handleEndImpersonation = async () => {
        try {
            // Rufe die API auf, die einen Cookie setzt
            const response = await fetch('/api/auth/end-impersonation', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                
                // Melde dich als ursprünglicher Benutzer an
                const result = await signIn('credentials', {
                    email: data.email,
                    password: '', // Wird nicht benötigt, da Restore über Cookie erkannt wird
                    redirect: false,
                });

                if (result?.ok) {
                    // Seite neu laden, um die neue Session zu aktivieren
                    window.location.href = '/dashboard';
                } else {
                    alert('Fehler beim Zurückkehren. Bitte versuchen Sie es erneut.');
                }
            } else {
                const error = await response.json();
                alert(error.error || 'Fehler beim Zurückkehren');
            }
        } catch (error) {
            console.error('Fehler beim Beenden der Impersonation:', error);
            alert('Fehler beim Zurückkehren');
        }
    };

    const isImpersonated = (session as any)?.isImpersonated || false;

    return (
        <>
            {/* Impersonation Banner */}
            {isImpersonated && (
                <div className="bg-yellow-400 border-b border-yellow-500">
                    <div className="max-w-1xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-yellow-900">
                                    ⚠️ Sie sind als <strong>{session?.user?.name}</strong> angemeldet (Impersonation)
                                </span>
                            </div>
                            <button
                                onClick={handleEndImpersonation}
                                className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md transition-colors duration-150"
                            >
                                <ArrowLeftIcon className="h-4 w-4" />
                                <span>Zurückkehren</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <header className="bg-white shadow-sm">
                <div className="max-w-1xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <Image
                                src="/cnlogo.png"
                                alt="ChiliNet Logo"
                                width={100}
                                height={100}
                                className="h-10 w-auto"
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        <Link 
                            href="/dashboard" 
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150"
                        >
                            Dashboard
                        </Link>
                        <Link 
                            href="/settings" 
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150"
                        >
                            Settings
                        </Link>
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex md:items-center">
                        <div className="relative" ref={userMenuRef}>
                            <button
                                type="button"
                                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            >
                                <UserCircleIcon className="h-6 w-6" />
                                <span>{session?.user?.name || 'Benutzer'}</span>
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-10">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{session?.user?.name || 'Benutzer'}</p>
                                        <p className="text-xs text-gray-500">{session?.user?.email}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 p-2">
                                        <Link
                                            href="/profile"
                                            className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <Cog6ToothIcon className="h-6 w-6 text-gray-600 mb-1" />
                                            <span className="text-sm text-gray-700">Profil</span>
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={handleSignOut}
                                            className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                                        >
                                            <ArrowRightOnRectangleIcon className="h-6 w-6 text-gray-600 mb-1" />
                                            <span className="text-sm text-gray-700">Abmelden</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            type="button"
                            className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <span className="sr-only">Menü öffnen</span>
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link 
                                href="/dashboard"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link 
                                href="/settings"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Settings
                            </Link>
                            <div className="border-t border-gray-200 pt-2">
                                <div className="px-3 py-2">
                                    <p className="text-sm font-medium text-gray-900">{session?.user?.name || 'Benutzer'}</p>
                                    <p className="text-xs text-gray-500">{session?.user?.email}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 p-2">
                                    <Link
                                        href="/profile"
                                        className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Cog6ToothIcon className="h-6 w-6 text-gray-600 mb-1" />
                                        <span className="text-sm text-gray-700">Profil</span>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handleSignOut}
                                        className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                                    >
                                        <ArrowRightOnRectangleIcon className="h-6 w-6 text-gray-600 mb-1" />
                                        <span className="text-sm text-gray-700">Abmelden</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
        </>
    );
} 