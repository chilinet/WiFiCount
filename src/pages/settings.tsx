import Layout from '@/components/Layout';
import { Cog6ToothIcon, UserGroupIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

export default function Settings() {
    const tiles = [
        {
            title: 'Benutzerverwaltung',
            description: 'Verwalten Sie Benutzer und deren Berechtigungen',
            icon: UserGroupIcon,
            href: '/settings/users'
        },
        {
            title: 'Struktur',
            description: 'Verwalten Sie die Baumstruktur und Kategorien',
            icon: Cog6ToothIcon,
            href: '/settings/structure'
        },
        {
            title: 'Devices',
            description: 'Verwalten Sie angeschlossene Geräte',
            icon: DevicePhoneMobileIcon,
            href: '/settings/devices'
        }
    ];

    return (
        <Layout>
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Einstellungen</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tiles.map((tile) => (
                        <a
                            key={tile.title}
                            href={tile.href}
                            className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center space-x-4">
                                <tile.icon className="h-8 w-8 text-blue-600" />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">{tile.title}</h2>
                                    <p className="text-sm text-gray-500">{tile.description}</p>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </Layout>
    );
} 