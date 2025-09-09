import { useState } from 'react';
import Layout from '@/components/Layout';
import Tree from '@/components/Tree';
import { prisma } from '@/lib/prisma';
import { TreeNode } from '@/types/tree';

interface CaptivePortalConfig {
    id: string;
    nodeId: string;
    portalName: string;
    welcomeMessage: string;
    termsOfService: string;
    redirectUrl: string;
    sessionTimeout: number;
    maxBandwidth: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    node?: {
        name: string;
        category: string;
    };
}

interface CaptivePortalPageProps {
    initialNodes: TreeNode[];
}

export default function CaptivePortalPage({ initialNodes }: CaptivePortalPageProps) {
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [configs, setConfigs] = useState<CaptivePortalConfig[]>([]);
    const [newConfig, setNewConfig] = useState({
        portalName: '',
        welcomeMessage: '',
        termsOfService: '',
        redirectUrl: '',
        sessionTimeout: 3600,
        maxBandwidth: 1024,
        isActive: true
    });
    const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
    const [editingConfig, setEditingConfig] = useState<CaptivePortalConfig | null>(null);

    const handleNodeSelect = async (node: TreeNode) => {
        setSelectedNode(node);
        try {
            const response = await fetch(`/api/captive-portal?nodeId=${node.id}`);
            if (response.ok) {
                const data = await response.json();
                setConfigs(data);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Captive Portal Konfigurationen:', error);
        }
    };

    const handleAddConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedNode) return;

        try {
            const response = await fetch('/api/captive-portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newConfig,
                    nodeId: selectedNode.id,
                }),
            });

            if (response.ok) {
                const config = await response.json();
                setConfigs([...configs, config]);
                setNewConfig({
                    portalName: '',
                    welcomeMessage: '',
                    termsOfService: '',
                    redirectUrl: '',
                    sessionTimeout: 3600,
                    maxBandwidth: 1024,
                    isActive: true
                });
            }
        } catch (error) {
            console.error('Fehler beim Hinzufügen der Konfiguration:', error);
        }
    };

    const handleDeleteConfig = async (configId: string) => {
        try {
            const response = await fetch(`/api/captive-portal/${configId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setConfigs(configs.filter(config => config.id !== configId));
            }
        } catch (error) {
            console.error('Fehler beim Löschen der Konfiguration:', error);
        }
    };

    const handleStartEditing = (config: CaptivePortalConfig) => {
        setEditingConfigId(config.id);
        setEditingConfig(config);
    };

    const handleSaveEdit = async (configId: string) => {
        if (!editingConfig) return;

        try {
            const response = await fetch(`/api/captive-portal/${configId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingConfig),
            });

            if (response.ok) {
                const updatedConfig = await response.json();
                setConfigs(configs.map(config => 
                    config.id === configId ? updatedConfig : config
                ));
                setEditingConfigId(null);
                setEditingConfig(null);
            }
        } catch (error) {
            console.error('Fehler beim Speichern der Konfiguration:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingConfigId(null);
        setEditingConfig(null);
    };

    const getNodeName = (nodeId: string) => {
        const findNode = (nodes: TreeNode[], id: string): TreeNode | null => {
            for (const node of nodes) {
                if (node.id === id) return node;
                if (node.children) {
                    const found = findNode(node.children, id);
                    if (found) return found;
                }
            }
            return null;
        };
        
        return findNode(initialNodes, nodeId)?.name || 'Unbekannt';
    };

    const isInherited = (config: CaptivePortalConfig) => {
        return selectedNode && config.nodeId !== selectedNode.id;
    };

    return (
        <div className="flex h-full">
            {/* Struktur-Lasche */}
            <div className="w-80 bg-white shadow-lg">
                <div className="p-4 border-b">
                    <h1 className="text-2xl font-bold text-gray-900">Struktur</h1>
                </div>
                <div className="p-4 overflow-y-auto h-[calc(100vh-8rem)]">
                    <Tree 
                        initialNodes={initialNodes} 
                        onNodeSelect={handleNodeSelect}
                    />
                </div>
            </div>

            {/* Hauptinhalt */}
            <div className="flex-1 p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Captive Portal</h1>
                    <p className="text-gray-600">
                        Konfigurieren Sie die Captive Portal Einstellungen für verschiedene Bereiche. 
                        Konfigurationen werden von übergeordneten Nodes vererbt.
                    </p>
                </div>

                {selectedNode ? (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Captive Portal für: {selectedNode.name}
                            </h2>

                            {/* Neues Portal hinzufügen */}
                            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Neues Portal hinzufügen</h3>
                                <form onSubmit={handleAddConfig} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Portal Name
                                            </label>
                                            <input
                                                type="text"
                                                value={newConfig.portalName}
                                                onChange={(e) => setNewConfig({...newConfig, portalName: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Weiterleitungs-URL
                                            </label>
                                            <input
                                                type="url"
                                                value={newConfig.redirectUrl}
                                                onChange={(e) => setNewConfig({...newConfig, redirectUrl: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Session Timeout (Sekunden)
                                            </label>
                                            <input
                                                type="number"
                                                value={newConfig.sessionTimeout}
                                                onChange={(e) => setNewConfig({...newConfig, sessionTimeout: parseInt(e.target.value)})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                min="300"
                                                max="86400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Max. Bandbreite (MB)
                                            </label>
                                            <input
                                                type="number"
                                                value={newConfig.maxBandwidth}
                                                onChange={(e) => setNewConfig({...newConfig, maxBandwidth: parseInt(e.target.value)})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                min="1"
                                                max="10000"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Willkommensnachricht
                                        </label>
                                        <textarea
                                            value={newConfig.welcomeMessage}
                                            onChange={(e) => setNewConfig({...newConfig, welcomeMessage: e.target.value})}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nutzungsbedingungen
                                        </label>
                                        <textarea
                                            value={newConfig.termsOfService}
                                            onChange={(e) => setNewConfig({...newConfig, termsOfService: e.target.value})}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={newConfig.isActive}
                                            onChange={(e) => setNewConfig({...newConfig, isActive: e.target.checked})}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">
                                            Portal aktiv
                                        </label>
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Portal hinzufügen
                                    </button>
                                </form>
                            </div>

                            {/* Bestehende Portale */}
                            <div className="bg-white rounded-lg shadow-md">
                                <div className="px-6 py-4 border-b">
                                    <h3 className="text-lg font-medium text-gray-900">Verfügbare Portale</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Zeigt alle Portale an, die für diesen Node verfügbar sind (eigene + vererbte)
                                    </p>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {configs.length === 0 ? (
                                        <div className="px-6 py-4 text-gray-500 text-center">
                                            Keine Portale verfügbar
                                        </div>
                                    ) : (
                                        configs.map((config) => (
                                            <div key={config.id} className="px-6 py-4">
                                                {editingConfigId === config.id ? (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Portal Name
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={editingConfig?.portalName || ''}
                                                                    onChange={(e) => setEditingConfig(editingConfig ? {...editingConfig, portalName: e.target.value} : null)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Weiterleitungs-URL
                                                                </label>
                                                                <input
                                                                    type="url"
                                                                    value={editingConfig?.redirectUrl || ''}
                                                                    onChange={(e) => setEditingConfig(editingConfig ? {...editingConfig, redirectUrl: e.target.value} : null)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleSaveEdit(config.id)}
                                                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                                            >
                                                                Speichern
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                                                            >
                                                                Abbrechen
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <h4 className="text-lg font-medium text-gray-900">
                                                                    {config.portalName}
                                                                </h4>
                                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                                    config.isActive 
                                                                        ? 'bg-green-100 text-green-800' 
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {config.isActive ? 'Aktiv' : 'Inaktiv'}
                                                                </span>
                                                                {isInherited(config) && (
                                                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                                        Vererbt von {getNodeName(config.nodeId)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-1">
                                                                Weiterleitung: {config.redirectUrl}
                                                            </p>
                                                            <p className="text-sm text-gray-600 mb-1">
                                                                Timeout: {config.sessionTimeout}s | Bandbreite: {config.maxBandwidth}MB
                                                            </p>
                                                            {config.welcomeMessage && (
                                                                <p className="text-sm text-gray-600 mb-1">
                                                                    Willkommen: {config.welcomeMessage.substring(0, 100)}...
                                                                </p>
                                                            )}
                                                            {config.termsOfService && (
                                                                <p className="text-sm text-gray-600 mb-1">
                                                                    Nutzungsbedingungen: {config.termsOfService.substring(0, 100)}...
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            {!isInherited(config) && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleStartEditing(config)}
                                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                                    >
                                                                        Bearbeiten
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteConfig(config.id)}
                                                                        className="text-red-600 hover:text-red-800 text-sm"
                                                                    >
                                                                        Löschen
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 mt-8">
                        Bitte wählen Sie einen Knoten aus der Struktur aus
                    </div>
                )}
            </div>
        </div>
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
        const serializedNodes = nodes.map((node: any) => ({
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