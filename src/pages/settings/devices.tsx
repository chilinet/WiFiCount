import { useState } from 'react';
import Layout from '@/components/Layout';
import Tree from '@/components/Tree';
import { prisma } from '@/lib/prisma';
import { TreeNode } from '@/types/tree';

interface Device {
    id: string;
    macAddress: string;
    name: string;
    areaId: string;
    createdAt: string;
    updatedAt: string;
}

interface DevicesPageProps {
    initialNodes: TreeNode[];
}

export default function DevicesPage({ initialNodes }: DevicesPageProps) {
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);
    const [newDevice, setNewDevice] = useState({ macAddress: '', name: '' });
    const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    const handleNodeSelect = async (node: TreeNode) => {
        setSelectedNode(node);
        if (node.category === 'BEREICH') {
            try {
                const response = await fetch(`/api/devices?areaId=${node.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setDevices(data);
                }
            } catch (error) {
                console.error('Fehler beim Laden der Geräte:', error);
            }
        }
    };

    const handleAddDevice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedNode || selectedNode.category !== 'BEREICH') return;

        try {
            const response = await fetch('/api/devices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newDevice,
                    areaId: selectedNode.id,
                }),
            });

            if (response.ok) {
                const device = await response.json();
                setDevices([...devices, device]);
                setNewDevice({ macAddress: '', name: '' });
            }
        } catch (error) {
            console.error('Fehler beim Hinzufügen des Geräts:', error);
        }
    };

    const handleDeleteDevice = async (deviceId: string) => {
        try {
            const response = await fetch(`/api/devices/${deviceId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setDevices(devices.filter(device => device.id !== deviceId));
            }
        } catch (error) {
            console.error('Fehler beim Löschen des Geräts:', error);
        }
    };

    const handleStartEditing = (device: Device) => {
        setEditingDeviceId(device.id);
        setEditingName(device.name);
    };

    const handleSaveEdit = async (deviceId: string) => {
        try {
            const response = await fetch(`/api/devices/${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: editingName }),
            });

            if (response.ok) {
                const updatedDevice = await response.json();
                setDevices(devices.map(device => 
                    device.id === deviceId ? updatedDevice : device
                ));
                setEditingDeviceId(null);
            }
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Geräts:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingDeviceId(null);
        setEditingName('');
    };

    return (
        <Layout>
            <div className="flex h-full">
                {/* Linke Seite: Tree */}
                <div className="w-1/3 p-4 border-r">
                    <h2 className="text-lg font-semibold mb-4">Struktur</h2>
                    <Tree
                        initialNodes={initialNodes}
                        onNodeSelect={handleNodeSelect}
                    />
                </div>

                {/* Rechte Seite: Gerätetabelle */}
                <div className="w-2/3 p-4">
                    {selectedNode?.category === 'BEREICH' ? (
                        <>
                            <h2 className="text-lg font-semibold mb-4">
                                Geräte in {selectedNode.name}
                            </h2>
                            
                            {/* Formular zum Hinzufügen eines neuen Geräts */}
                            <form onSubmit={handleAddDevice} className="mb-4">
                                <div className="flex space-x-4">
                                    <input
                                        type="text"
                                        placeholder="MAC-Adresse"
                                        value={newDevice.macAddress}
                                        onChange={(e) => setNewDevice({ ...newDevice, macAddress: e.target.value })}
                                        className="flex-1 p-2 border rounded"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Bezeichnung"
                                        value={newDevice.name}
                                        onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                                        className="flex-1 p-2 border rounded"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Hinzufügen
                                    </button>
                                </div>
                            </form>

                            {/* Gerätetabelle */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                MAC-Adresse
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Bezeichnung
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Aktionen
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {devices.map((device) => (
                                            <tr key={device.id}>
                                                <td className="px-6 py-4 border-b border-gray-200">
                                                    {device.macAddress}
                                                </td>
                                                <td className="px-6 py-4 border-b border-gray-200">
                                                    {editingDeviceId === device.id ? (
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="text"
                                                                value={editingName}
                                                                onChange={(e) => setEditingName(e.target.value)}
                                                                className="flex-1 p-1 border rounded"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        handleSaveEdit(device.id);
                                                                    } else if (e.key === 'Escape') {
                                                                        handleCancelEdit();
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => handleSaveEdit(device.id)}
                                                                className="text-green-500 hover:text-green-700"
                                                            >
                                                                Speichern
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-gray-500 hover:text-gray-700"
                                                            >
                                                                Abbrechen
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span
                                                            className="cursor-pointer hover:text-blue-500"
                                                            onClick={() => handleStartEditing(device)}
                                                        >
                                                            {device.name}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 border-b border-gray-200">
                                                    <button
                                                        onClick={() => handleDeleteDevice(device.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Löschen
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-500 mt-8">
                            Bitte wählen Sie einen Bereich aus der Struktur aus
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export async function getServerSideProps() {
    try {
        const nodes = await prisma.treeNode.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        // Convert Date objects to ISO strings
        const serializedNodes = nodes.map(node => ({
            ...node,
            createdAt: node.createdAt.toISOString(),
            updatedAt: node.updatedAt.toISOString()
        }));

        return {
            props: {
                initialNodes: serializedNodes
            }
        };
    } catch (error) {
        console.error('Fehler beim Laden der Tree-Nodes:', error);
        return {
            props: {
                initialNodes: []
            }
        };
    }
} 