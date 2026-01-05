import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { UserRole } from '@/types/auth';
import { Cog6ToothIcon, UserGroupIcon, DevicePhoneMobileIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function Settings() {
    const router = useRouter();
    const { data: session } = useSession();
    const isSuperAdmin = session?.user?.role === UserRole.SUPERADMIN;
    const isAdmin = session?.user?.role === UserRole.ADMIN;

    const settings = [
        {
            title: 'Benutzerverwaltung',
            description: 'Verwalten Sie Benutzer und deren Berechtigungen',
            icon: UserGroupIcon,
            href: '/settings/users',
        },
        ...(isSuperAdmin ? [
            {
                title: 'Struktur',
                description: 'Verwalten Sie die Baumstruktur und Kategorien',
                icon: Cog6ToothIcon,
                href: '/settings/structure',
            },
            {
                title: 'Devices',
                description: 'Verwalten Sie angeschlossene Geräte',
                icon: DevicePhoneMobileIcon,
                href: '/settings/devices',
            },
        ] : []),
        ...((isSuperAdmin || isAdmin) ? [
            {
                title: 'Captive Portal',
                description: 'Verwalten Sie Captive Portal Konfigurationen',
                icon: GlobeAltIcon,
                href: '/settings/captive-portal',
            },
        ] : []),
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Einstellungen</h1>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {settings.map((setting) => (
                    <div
                        key={setting.title}
                        className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                        onClick={() => router.push(setting.href)}
                    >
                        <div className="p-6">
                            <div className="flex items-center">
                                <setting.icon className="h-8 w-8 text-blue-600" />
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">{setting.title}</h3>
                                    <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 