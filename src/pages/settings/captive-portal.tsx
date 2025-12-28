import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Tree from '@/components/Tree';
import { prisma } from '@/lib/prisma';
import { TreeNode } from '@/types/tree';
import DevicePreview from '@/components/DevicePreview';

interface CaptivePortalConfig {
    id: string;
    nodeId: string;
    portalName: string;
    welcomeMessage: string;
    termsOfService: string;
    redirectUrl: string | null;
    sessionTimeout: number;
    maxBandwidth: number;
    isActive: boolean;
    logoUrl?: string | null;
    welcomeHeading?: string | null;
    welcomeText?: string | null;
    hintText?: string | null;
    backgroundColor?: string | null;
    backgroundImage?: string | null;
    portalBackgroundColor?: string | null;
    buttonColor?: string | null;
    buttonText?: string | null;
    termsLinkText?: string | null;
    headingColor?: string | null;
    welcomeTextColor?: string | null;
    hintTextColor?: string | null;
    buttonTextColor?: string | null;
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
        isActive: true,
        logoUrl: 'https://chilinet.solutions/wp-content/uploads/2020/10/chilinetWhite.png',
        welcomeHeading: 'Willkommen im Gäste-WLAN',
        welcomeText: 'Sie sind nur noch einen Klick vom Internetzugang entfernt.',
        hintText: 'Mit der Nutzung des WLANs erklären Sie sich mit unseren Nutzungsbedingungen einverstanden.',
        backgroundColor: '#000000',
        backgroundImage: '',
        portalBackgroundColor: '#111111',
        buttonColor: '#ff9800',
        buttonText: 'Internet',
        termsLinkText: 'Nutzungsbedingungen anzeigen',
        headingColor: '#ffffff',
        welcomeTextColor: '#ffffff',
        hintTextColor: '#ffffff',
        buttonTextColor: '#000000'
    });
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [backgroundImagePreview, setBackgroundImagePreview] = useState<string>('');
    const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
    const [editingConfig, setEditingConfig] = useState<CaptivePortalConfig | null>(null);
    const [displayedConfig, setDisplayedConfig] = useState<CaptivePortalConfig | null>(null);

    // Debug: Log backgroundImage changes
    useEffect(() => {
        console.log('newConfig.backgroundImage changed:', newConfig.backgroundImage);
    }, [newConfig.backgroundImage]);

    const handleNodeSelect = async (node: TreeNode) => {
        setSelectedNode(node);
        try {
            const response = await fetch(`/api/captive-portal?nodeId=${node.id}`);
            if (response.ok) {
                const data = await response.json();
                setConfigs(data);
                
                // Die API gibt Konfigurationen sortiert zurück: von Root zu aktueller Node
                // Die gültige Konfiguration für diesen Node ist die letzte in der Liste
                const effectiveConfig = data.length > 0 ? data[data.length - 1] : null;
                
                // Prüfe ob es eine direkt zugeordnete Konfiguration gibt
                const directConfig = data.find((config: CaptivePortalConfig) => config.nodeId === node.id);
                
                if (effectiveConfig) {
                    setDisplayedConfig(effectiveConfig);
                    
                    if (directConfig) {
                        // Es gibt eine direkt zugeordnete Konfiguration - lade diese ins Formular
                        const bgImage = directConfig.backgroundImage ?? '';
                        setNewConfig({
                            portalName: directConfig.portalName || '',
                            welcomeMessage: directConfig.welcomeMessage || '',
                            termsOfService: directConfig.termsOfService || '',
                            redirectUrl: directConfig.redirectUrl || '',
                            sessionTimeout: directConfig.sessionTimeout || 3600,
                            maxBandwidth: directConfig.maxBandwidth || 1024,
                            isActive: directConfig.isActive !== undefined ? directConfig.isActive : true,
                            logoUrl: directConfig.logoUrl || 'https://chilinet.solutions/wp-content/uploads/2020/10/chilinetWhite.png',
                            welcomeHeading: directConfig.welcomeHeading || 'Willkommen im Gäste-WLAN',
                            welcomeText: directConfig.welcomeText || 'Sie sind nur noch einen Klick vom Internetzugang entfernt.',
                            hintText: directConfig.hintText || 'Mit der Nutzung des WLANs erklären Sie sich mit unseren Nutzungsbedingungen einverstanden.',
                            backgroundColor: directConfig.backgroundColor || '#000000',
                            backgroundImage: bgImage,
                            portalBackgroundColor: directConfig.portalBackgroundColor || '#111111',
                            buttonColor: directConfig.buttonColor || '#ff9800',
                            buttonText: directConfig.buttonText || 'Internet',
                            termsLinkText: directConfig.termsLinkText || 'Nutzungsbedingungen anzeigen',
                            headingColor: directConfig.headingColor || '#ffffff',
                            welcomeTextColor: directConfig.welcomeTextColor || '#ffffff',
                            hintTextColor: directConfig.hintTextColor || '#ffffff',
                            buttonTextColor: directConfig.buttonTextColor || '#000000'
                        });
                        // Setze Preview für Data URLs (hochgeladene Bilder)
                        // Für URLs wird das Bild direkt angezeigt, Preview wird nicht benötigt
                        if (bgImage && bgImage.startsWith('data:')) {
                            setBackgroundImagePreview(bgImage);
                        } else {
                            setBackgroundImagePreview('');
                        }
                        setEditingConfigId(directConfig.id);
                    } else {
                        // Keine direkt zugeordnete Konfiguration - zeige vererbte Werte im Formular
                        const bgImage = effectiveConfig.backgroundImage ?? '';
                        setNewConfig({
                            portalName: effectiveConfig.portalName || '',
                            welcomeMessage: effectiveConfig.welcomeMessage || '',
                            termsOfService: effectiveConfig.termsOfService || '',
                            redirectUrl: effectiveConfig.redirectUrl || '',
                            sessionTimeout: effectiveConfig.sessionTimeout || 3600,
                            maxBandwidth: effectiveConfig.maxBandwidth || 1024,
                            isActive: effectiveConfig.isActive !== undefined ? effectiveConfig.isActive : true,
                            logoUrl: effectiveConfig.logoUrl || 'https://chilinet.solutions/wp-content/uploads/2020/10/chilinetWhite.png',
                            welcomeHeading: effectiveConfig.welcomeHeading || 'Willkommen im Gäste-WLAN',
                            welcomeText: effectiveConfig.welcomeText || 'Sie sind nur noch einen Klick vom Internetzugang entfernt.',
                            hintText: effectiveConfig.hintText || 'Mit der Nutzung des WLANs erklären Sie sich mit unseren Nutzungsbedingungen einverstanden.',
                            backgroundColor: effectiveConfig.backgroundColor || '#000000',
                            backgroundImage: bgImage,
                            portalBackgroundColor: effectiveConfig.portalBackgroundColor || '#111111',
                            buttonColor: effectiveConfig.buttonColor || '#ff9800',
                            buttonText: effectiveConfig.buttonText || 'Internet',
                            termsLinkText: effectiveConfig.termsLinkText || 'Nutzungsbedingungen anzeigen',
                            headingColor: effectiveConfig.headingColor || '#ffffff',
                            welcomeTextColor: effectiveConfig.welcomeTextColor || '#ffffff',
                            hintTextColor: effectiveConfig.hintTextColor || '#ffffff',
                            buttonTextColor: effectiveConfig.buttonTextColor || '#000000'
                        });
                        // Setze Preview für Data URLs (hochgeladene Bilder)
                        // Für URLs wird das Bild direkt angezeigt, Preview wird nicht benötigt
                        if (bgImage && bgImage.startsWith('data:')) {
                            setBackgroundImagePreview(bgImage);
                        } else {
                            setBackgroundImagePreview('');
                        }
                        setEditingConfigId(null); // Keine ID = neue Konfiguration wird erstellt
                    }
                } else {
                    setDisplayedConfig(null);
                    // Keine Konfiguration vorhanden - Standardwerte
                    setNewConfig({
                        portalName: '',
                        welcomeMessage: '',
                        termsOfService: '',
                        redirectUrl: '',
                        sessionTimeout: 3600,
                        maxBandwidth: 1024,
                        isActive: true,
                        logoUrl: 'https://chilinet.solutions/wp-content/uploads/2020/10/chilinetWhite.png',
                        welcomeHeading: 'Willkommen im Gäste-WLAN',
                        welcomeText: 'Sie sind nur noch einen Klick vom Internetzugang entfernt.',
                        hintText: 'Mit der Nutzung des WLANs erklären Sie sich mit unseren Nutzungsbedingungen einverstanden.',
                        backgroundColor: '#000000',
                        backgroundImage: '',
                        portalBackgroundColor: '#111111',
                        buttonColor: '#ff9800',
                        buttonText: 'Internet',
                        termsLinkText: 'Nutzungsbedingungen anzeigen',
                        headingColor: '#ffffff',
                        welcomeTextColor: '#ffffff',
                        hintTextColor: '#ffffff',
                        buttonTextColor: '#000000'
                    });
                    setEditingConfigId(null);
                }
            } else {
                const errorData = await response.json();
                console.error('API Error:', errorData);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Captive Portal Konfigurationen:', error);
        }
    };

    const handleConfigSelect = (config: CaptivePortalConfig) => {
        setDisplayedConfig(config);
    };

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedNode) return;

        try {
            let response;
            // Stelle sicher, dass backgroundImage immer gesetzt ist
            const configToSave = {
                ...newConfig,
                backgroundImage: newConfig.backgroundImage || '',
                nodeId: selectedNode.id,
            };
            
            // Debug: Log what we're sending
            console.log('Saving config with backgroundImage length:', configToSave.backgroundImage?.length || 0, 'type:', typeof configToSave.backgroundImage);

            if (editingConfigId) {
                // Aktualisiere bestehende direkt zugeordnete Konfiguration
                response = await fetch(`/api/captive-portal/${editingConfigId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(configToSave),
                });
            } else {
                // Erstelle neue Konfiguration für diesen Node (überschreibt Vererbung)
                // Portal Name ist erforderlich
                if (!configToSave.portalName) {
                    configToSave.portalName = selectedNode.name;
                }
                response = await fetch('/api/captive-portal', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(configToSave),
                });
            }

            if (response.ok) {
                // Lade die Konfigurationen neu
                const refreshResponse = await fetch(`/api/captive-portal?nodeId=${selectedNode.id}`);
                if (refreshResponse.ok) {
                    const refreshedData = await refreshResponse.json();
                    setConfigs(refreshedData);
                    const effectiveConfig = refreshedData.length > 0 ? refreshedData[refreshedData.length - 1] : null;
                    if (effectiveConfig) {
                        setDisplayedConfig(effectiveConfig);
                        // Setze editingConfigId auf die ID der direkt zugeordneten Konfiguration
                        const directConfig = refreshedData.find((config: CaptivePortalConfig) => config.nodeId === selectedNode.id);
                        if (directConfig) {
                            setEditingConfigId(directConfig.id);
                            // Aktualisiere das Formular mit der neuen Konfiguration
                            const bgImage = directConfig.backgroundImage ?? '';
                            setNewConfig({
                                portalName: directConfig.portalName || '',
                                welcomeMessage: directConfig.welcomeMessage || '',
                                termsOfService: directConfig.termsOfService || '',
                                redirectUrl: directConfig.redirectUrl || '',
                                sessionTimeout: directConfig.sessionTimeout || 3600,
                                maxBandwidth: directConfig.maxBandwidth || 1024,
                                isActive: directConfig.isActive !== undefined ? directConfig.isActive : true,
                                logoUrl: directConfig.logoUrl || 'https://chilinet.solutions/wp-content/uploads/2020/10/chilinetWhite.png',
                                welcomeHeading: directConfig.welcomeHeading || 'Willkommen im Gäste-WLAN',
                                welcomeText: directConfig.welcomeText || 'Sie sind nur noch einen Klick vom Internetzugang entfernt.',
                                hintText: directConfig.hintText || 'Mit der Nutzung des WLANs erklären Sie sich mit unseren Nutzungsbedingungen einverstanden.',
                                backgroundColor: directConfig.backgroundColor || '#000000',
                                backgroundImage: bgImage,
                                portalBackgroundColor: directConfig.portalBackgroundColor || '#111111',
                                buttonColor: directConfig.buttonColor || '#ff9800',
                                buttonText: directConfig.buttonText || 'Internet',
                                termsLinkText: directConfig.termsLinkText || 'Nutzungsbedingungen anzeigen',
                                headingColor: directConfig.headingColor || '#ffffff',
                            welcomeTextColor: directConfig.welcomeTextColor || '#ffffff',
                            hintTextColor: directConfig.hintTextColor || '#ffffff',
                            buttonTextColor: directConfig.buttonTextColor || '#000000'
                            });
                            // Setze Preview für Data URLs (hochgeladene Bilder)
                            // Für URLs wird das Bild direkt angezeigt, Preview wird nicht benötigt
                            if (bgImage && bgImage.startsWith('data:')) {
                                setBackgroundImagePreview(bgImage);
                            } else {
                                setBackgroundImagePreview('');
                            }
                        }
                    }
                }
                setLogoPreview('');
                setBackgroundImagePreview('');
            }
        } catch (error) {
            console.error('Fehler beim Speichern der Konfiguration:', error);
        }
    };

    const handleDeleteConfig = async (configId: string) => {
        try {
            const response = await fetch(`/api/captive-portal/${configId}`, {
                method: 'DELETE',
            });

            if (response.ok || response.status === 204) {
                // Lade die Konfigurationen neu, um die aktuelle gültige Konfiguration zu erhalten
                if (selectedNode) {
                    const refreshResponse = await fetch(`/api/captive-portal?nodeId=${selectedNode.id}`);
                    if (refreshResponse.ok) {
                        const refreshedData = await refreshResponse.json();
                        setConfigs(refreshedData);
                        // Die gültige Konfiguration ist die letzte in der Liste
                        const effectiveConfig = refreshedData.length > 0 ? refreshedData[refreshedData.length - 1] : null;
                        if (effectiveConfig) {
                            setDisplayedConfig(effectiveConfig);
                            // Lade die vererbte oder direkte Konfiguration ins Formular
                            const directConfig = refreshedData.find((config: CaptivePortalConfig) => config.nodeId === selectedNode.id);
                            if (directConfig) {
                                const bgImage = directConfig.backgroundImage ?? '';
                                setNewConfig({
                                    portalName: directConfig.portalName || '',
                                    welcomeMessage: directConfig.welcomeMessage || '',
                                    termsOfService: directConfig.termsOfService || '',
                                    redirectUrl: directConfig.redirectUrl || '',
                                    sessionTimeout: directConfig.sessionTimeout || 3600,
                                    maxBandwidth: directConfig.maxBandwidth || 1024,
                                    isActive: directConfig.isActive !== undefined ? directConfig.isActive : true,
                                    logoUrl: directConfig.logoUrl || 'https://chilinet.solutions/wp-content/uploads/2020/10/chilinetWhite.png',
                                    welcomeHeading: directConfig.welcomeHeading || 'Willkommen im Gäste-WLAN',
                                    welcomeText: directConfig.welcomeText || 'Sie sind nur noch einen Klick vom Internetzugang entfernt.',
                                    hintText: directConfig.hintText || 'Mit der Nutzung des WLANs erklären Sie sich mit unseren Nutzungsbedingungen einverstanden.',
                                    backgroundColor: directConfig.backgroundColor || '#000000',
                                    backgroundImage: bgImage,
                                    portalBackgroundColor: directConfig.portalBackgroundColor || '#111111',
                                    buttonColor: directConfig.buttonColor || '#ff9800',
                                    buttonText: directConfig.buttonText || 'Internet',
                                    termsLinkText: directConfig.termsLinkText || 'Nutzungsbedingungen anzeigen',
                                    headingColor: directConfig.headingColor || '#ffffff',
                            welcomeTextColor: directConfig.welcomeTextColor || '#ffffff',
                            hintTextColor: directConfig.hintTextColor || '#ffffff',
                            buttonTextColor: directConfig.buttonTextColor || '#000000'
                                });
                                setEditingConfigId(directConfig.id);
                            } else {
                                // Keine direkte Konfiguration mehr - zeige vererbte Werte
                                const bgImage = effectiveConfig.backgroundImage ?? '';
                                setNewConfig({
                                    portalName: effectiveConfig.portalName || '',
                                    welcomeMessage: effectiveConfig.welcomeMessage || '',
                                    termsOfService: effectiveConfig.termsOfService || '',
                                    redirectUrl: effectiveConfig.redirectUrl || '',
                                    sessionTimeout: effectiveConfig.sessionTimeout || 3600,
                                    maxBandwidth: effectiveConfig.maxBandwidth || 1024,
                                    isActive: effectiveConfig.isActive !== undefined ? effectiveConfig.isActive : true,
                                    logoUrl: effectiveConfig.logoUrl || 'https://chilinet.solutions/wp-content/uploads/2020/10/chilinetWhite.png',
                                    welcomeHeading: effectiveConfig.welcomeHeading || 'Willkommen im Gäste-WLAN',
                                    welcomeText: effectiveConfig.welcomeText || 'Sie sind nur noch einen Klick vom Internetzugang entfernt.',
                                    hintText: effectiveConfig.hintText || 'Mit der Nutzung des WLANs erklären Sie sich mit unseren Nutzungsbedingungen einverstanden.',
                                    backgroundColor: effectiveConfig.backgroundColor || '#000000',
                                    backgroundImage: bgImage,
                                    portalBackgroundColor: effectiveConfig.portalBackgroundColor || '#111111',
                                    buttonColor: effectiveConfig.buttonColor || '#ff9800',
                                    buttonText: effectiveConfig.buttonText || 'Internet',
                                    termsLinkText: effectiveConfig.termsLinkText || 'Nutzungsbedingungen anzeigen',
                                    headingColor: effectiveConfig.headingColor || '#ffffff',
                            welcomeTextColor: effectiveConfig.welcomeTextColor || '#ffffff',
                            hintTextColor: effectiveConfig.hintTextColor || '#ffffff',
                            buttonTextColor: effectiveConfig.buttonTextColor || '#000000'
                                });
                                setEditingConfigId(null);
                            }
                        } else {
                            setDisplayedConfig(null);
                            // Keine Konfiguration mehr vorhanden - Standardwerte
                            setNewConfig({
                                portalName: '',
                                welcomeMessage: '',
                                termsOfService: '',
                                redirectUrl: '',
                                sessionTimeout: 3600,
                                maxBandwidth: 1024,
                                isActive: true,
                                logoUrl: 'https://chilinet.solutions/wp-content/uploads/2020/10/chilinetWhite.png',
                                welcomeHeading: 'Willkommen im Gäste-WLAN',
                                welcomeText: 'Sie sind nur noch einen Klick vom Internetzugang entfernt.',
                                hintText: 'Mit der Nutzung des WLANs erklären Sie sich mit unseren Nutzungsbedingungen einverstanden.',
                                backgroundColor: '#000000',
                                backgroundImage: '',
                                portalBackgroundColor: '#111111',
                                buttonColor: '#ff9800',
                                buttonText: 'Internet',
                                termsLinkText: 'Nutzungsbedingungen anzeigen',
                                headingColor: '#ffffff',
                        welcomeTextColor: '#ffffff',
                        hintTextColor: '#ffffff',
                        buttonTextColor: '#000000'
                            });
                            setEditingConfigId(null);
                        }
                    }
                }
            } else if (response.status === 404) {
                // Konfiguration wurde bereits gelöscht oder existiert nicht
                const errorData = await response.json();
                alert('Die Konfiguration wurde bereits gelöscht oder existiert nicht.');
                // Lade die Konfigurationen trotzdem neu
                if (selectedNode) {
                    const refreshResponse = await fetch(`/api/captive-portal?nodeId=${selectedNode.id}`);
                    if (refreshResponse.ok) {
                        const refreshedData = await refreshResponse.json();
                        setConfigs(refreshedData);
                        const effectiveConfig = refreshedData.length > 0 ? refreshedData[refreshedData.length - 1] : null;
                        if (effectiveConfig) {
                            setDisplayedConfig(effectiveConfig);
                        } else {
                            setDisplayedConfig(null);
                        }
                    }
                }
            } else {
                const errorData = await response.json();
                alert('Fehler beim Löschen: ' + (errorData.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Fehler beim Löschen der Konfiguration:', error);
            alert('Fehler beim Löschen der Konfiguration');
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
                // Lade die Konfigurationen neu, um die aktuelle gültige Konfiguration zu erhalten
                if (selectedNode) {
                    const refreshResponse = await fetch(`/api/captive-portal?nodeId=${selectedNode.id}`);
                    if (refreshResponse.ok) {
                        const refreshedData = await refreshResponse.json();
                        setConfigs(refreshedData);
                        // Die gültige Konfiguration ist die letzte in der Liste
                        const effectiveConfig = refreshedData.length > 0 ? refreshedData[refreshedData.length - 1] : null;
                        if (effectiveConfig) {
                            setDisplayedConfig(effectiveConfig);
                        }
                    }
                }
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
            {/* Linke Seite: Struktur */}
            <div className="w-1/3 p-4 border-r overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Struktur</h2>
                <Tree
                    initialNodes={initialNodes}
                    onNodeSelect={handleNodeSelect}
                    readOnly={true}
                />
            </div>

            {/* Mitte: Einstellungen */}
            <div className="w-1/3 p-4 border-r overflow-y-auto">
                {selectedNode ? (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">
                                Captive Portal für {selectedNode.name}
                            </h2>
                            {selectedNode && (
                                <a
                                    href={`/captive-portal/${selectedNode.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    title="Vorschau in neuem Fenster öffnen"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Vorschau öffnen
                                </a>
                            )}
                        </div>

                        {/* Captive Portal Konfiguration */}
                        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {editingConfigId ? 'Captive Portal Konfiguration bearbeiten' : 'Captive Portal Konfiguration'}
                                    {displayedConfig && !editingConfigId && (
                                        <span className="ml-2 text-sm text-blue-600 font-normal">
                                            (Vererbt von {getNodeName(displayedConfig.nodeId)} - Änderungen erstellen neue Konfiguration)
                                        </span>
                                    )}
                                </h3>
                                {displayedConfig && !editingConfigId && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                        <p className="text-sm text-blue-800">
                                            <strong>Hinweis:</strong> Die aktuell angezeigten Werte werden von einem übergeordneten Node vererbt. 
                                            Wenn Sie Änderungen vornehmen und speichern, wird eine neue Konfiguration für diesen Node erstellt, 
                                            die die Vererbung überschreibt.
                                        </p>
                                    </div>
                                )}
                                <form onSubmit={handleSaveConfig} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Portal Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newConfig.portalName}
                                            onChange={(e) => setNewConfig({...newConfig, portalName: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder={displayedConfig && !editingConfigId ? displayedConfig.portalName : 'Portal Name'}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Logo
                                        </label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={newConfig.logoUrl}
                                                onChange={(e) => {
                                                    setNewConfig({...newConfig, logoUrl: e.target.value});
                                                    setLogoPreview(''); // Lösche Preview wenn URL geändert wird
                                                }}
                                                placeholder="Logo URL"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            {(newConfig.logoUrl || logoPreview) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setNewConfig({...newConfig, logoUrl: ''});
                                                        setLogoPreview('');
                                                    }}
                                                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    title="Logo löschen"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    // Zeige sofort eine Preview
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        const dataUrl = event.target?.result as string;
                                                        setLogoPreview(dataUrl);
                                                    };
                                                    reader.readAsDataURL(file);

                                                    // Lade das Logo auf den Server hoch
                                                    try {
                                                        // Konvertiere zu Base64 für den Upload
                                                        const base64Reader = new FileReader();
                                                        base64Reader.onload = async (event) => {
                                                            const base64 = event.target?.result as string;
                                                            const response = await fetch('/api/upload-image', {
                                                                method: 'POST',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                },
                                                                body: JSON.stringify({ image: base64, filename: file.name, type: 'logo' }),
                                                            });

                                                            if (response.ok) {
                                                                const data = await response.json();
                                                                console.log('Logo uploaded, received URL:', data.url);
                                                                // Verwende funktionalen State-Update, um sicherzustellen, dass wir den neuesten State haben
                                                                setNewConfig(prev => ({...prev, logoUrl: data.url}));
                                                                // Lösche die Preview, da wir jetzt die Server-URL haben
                                                                setLogoPreview('');
                                                            } else {
                                                                const error = await response.json();
                                                                console.error('Error uploading logo:', error);
                                                                alert('Fehler beim Hochladen des Logos: ' + (error.error || 'Unbekannter Fehler'));
                                                            }
                                                        };
                                                        base64Reader.readAsDataURL(file);
                                                    } catch (error) {
                                                        console.error('Error uploading logo:', error);
                                                        alert('Fehler beim Hochladen des Logos');
                                                    }
                                                }
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {(logoPreview || newConfig.logoUrl) && (
                                            <div className="mt-2 relative">
                                                <img 
                                                    src={
                                                        logoPreview 
                                                            ? logoPreview 
                                                            : newConfig.logoUrl?.startsWith('/uploads/')
                                                            ? `/api${newConfig.logoUrl}`
                                                            : newConfig.logoUrl
                                                    } 
                                                    alt="Logo Preview" 
                                                    className="h-20 object-contain" 
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hintergrundfarbe (Hex oder RGBA)
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={(() => {
                                                    const val = newConfig.backgroundColor || '#000000';
                                                    if (val.startsWith('rgba') || val.startsWith('rgb')) {
                                                        const match = val.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                                                        if (match) {
                                                            const r = parseInt(match[1]).toString(16).padStart(2, '0');
                                                            const g = parseInt(match[2]).toString(16).padStart(2, '0');
                                                            const b = parseInt(match[3]).toString(16).padStart(2, '0');
                                                            return `#${r}${g}${b}`;
                                                        }
                                                    }
                                                    return val.substring(0, 7);
                                                })()}
                                                onChange={(e) => {
                                                    const currentValue = newConfig.backgroundColor || '';
                                                    if (currentValue.startsWith('rgba')) {
                                                        const rgbaMatch = currentValue.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
                                                        if (rgbaMatch) {
                                                            const alpha = rgbaMatch[4] || '1';
                                                            const hex = e.target.value;
                                                            const r = parseInt(hex.slice(1, 3), 16);
                                                            const g = parseInt(hex.slice(3, 5), 16);
                                                            const b = parseInt(hex.slice(5, 7), 16);
                                                            setNewConfig({...newConfig, backgroundColor: `rgba(${r}, ${g}, ${b}, ${alpha})`});
                                                        } else {
                                                            setNewConfig({...newConfig, backgroundColor: e.target.value});
                                                        }
                                                    } else {
                                                        setNewConfig({...newConfig, backgroundColor: e.target.value});
                                                    }
                                                }}
                                                className="h-10 w-20 border border-gray-300 rounded"
                                            />
                                            <input
                                                type="text"
                                                value={newConfig.backgroundColor}
                                                onChange={(e) => setNewConfig({...newConfig, backgroundColor: e.target.value})}
                                                placeholder="#000000 oder rgba(0, 0, 0, 0.5)"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        {newConfig.backgroundColor && (newConfig.backgroundColor.startsWith('rgba') || newConfig.backgroundColor.startsWith('rgb')) && (
                                            <div className="mt-2">
                                                <label className="block text-xs text-gray-600 mb-1">
                                                    Transparenz (Alpha): {(() => {
                                                        const match = newConfig.backgroundColor.match(/rgba?\([^,]+,\s*[^,]+,\s*[^,]+,\s*([\d.]+)\)/);
                                                        return match ? (parseFloat(match[1]) * 100).toFixed(0) + '%' : '100%';
                                                    })()}
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.01"
                                                    value={(() => {
                                                        const match = newConfig.backgroundColor.match(/rgba?\([^,]+,\s*[^,]+,\s*[^,]+,\s*([\d.]+)\)/);
                                                        return match ? parseFloat(match[1]) : 1;
                                                    })()}
                                                    onChange={(e) => {
                                                        const alpha = parseFloat(e.target.value);
                                                        const match = newConfig.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                                                        if (match) {
                                                            setNewConfig({...newConfig, backgroundColor: `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`});
                                                        }
                                                    }}
                                                    className="w-full"
                                                />
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Unterstützt Hex (#000000) oder RGBA (rgba(0, 0, 0, 0.5)) für Transparenz
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hintergrundbild (optional)
                                        </label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={newConfig.backgroundImage || ''}
                                                onChange={(e) => {
                                                    setNewConfig(prev => ({...prev, backgroundImage: e.target.value}));
                                                    setBackgroundImagePreview(''); // Lösche Preview wenn URL geändert wird
                                                }}
                                                placeholder="Hintergrundbild URL"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            {(newConfig.backgroundImage || backgroundImagePreview) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setNewConfig(prev => ({...prev, backgroundImage: ''}));
                                                        setBackgroundImagePreview('');
                                                    }}
                                                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    title="Hintergrundbild löschen"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    // Komprimiere das Bild, bevor es hochgeladen wird
                                                    const compressImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<string> => {
                                                        return new Promise((resolve, reject) => {
                                                            const reader = new FileReader();
                                                            reader.onload = (e) => {
                                                                const img = new Image();
                                                                img.onload = () => {
                                                                    const canvas = document.createElement('canvas');
                                                                    let width = img.width;
                                                                    let height = img.height;

                                                                    // Berechne neue Größe, wenn nötig
                                                                    if (width > maxWidth || height > maxHeight) {
                                                                        if (width > height) {
                                                                            height = Math.round((height * maxWidth) / width);
                                                                            width = maxWidth;
                                                                        } else {
                                                                            width = Math.round((width * maxHeight) / height);
                                                                            height = maxHeight;
                                                                        }
                                                                    }

                                                                    canvas.width = width;
                                                                    canvas.height = height;
                                                                    const ctx = canvas.getContext('2d');
                                                                    if (!ctx) {
                                                                        reject(new Error('Could not get canvas context'));
                                                                        return;
                                                                    }
                                                                    ctx.drawImage(img, 0, 0, width, height);
                                                                    canvas.toBlob((blob) => {
                                                                        if (!blob) {
                                                                            reject(new Error('Could not create blob'));
                                                                            return;
                                                                        }
                                                                        const reader = new FileReader();
                                                                        reader.onload = () => resolve(reader.result as string);
                                                                        reader.onerror = reject;
                                                                        reader.readAsDataURL(blob);
                                                                    }, 'image/jpeg', quality);
                                                                };
                                                                img.onerror = reject;
                                                                img.src = e.target?.result as string;
                                                            };
                                                            reader.onerror = reject;
                                                            reader.readAsDataURL(file);
                                                        });
                                                    };

                                                    try {
                                                        // Komprimiere das Bild
                                                        console.log('Compressing image, original size:', file.size, 'bytes');
                                                        const compressedBase64 = await compressImage(file);
                                                        console.log('Compressed image, base64 length:', compressedBase64?.length || 0);
                                                        
                                                        // Zeige sofort eine Preview
                                                        setBackgroundImagePreview(compressedBase64);

                                                        // Lade das komprimierte Bild auf den Server hoch
                                                        const response = await fetch('/api/upload-background', {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                            },
                                                            body: JSON.stringify({ image: compressedBase64, filename: file.name }),
                                                        });

                                                        console.log('Upload response status:', response.status);
                                                        
                                                        if (response.ok) {
                                                            const data = await response.json();
                                                            console.log('Background image uploaded, received URL:', data.url);
                                                            console.log('Response data:', JSON.stringify(data));
                                                            
                                                            if (!data.url) {
                                                                console.error('No URL in response!', data);
                                                                alert('Fehler: Keine URL in der Antwort erhalten');
                                                                return;
                                                            }
                                                            
                                                            // Verwende funktionalen State-Update, um sicherzustellen, dass wir den neuesten State haben
                                                            setNewConfig(prev => {
                                                                const updated = {...prev, backgroundImage: data.url};
                                                                console.log('Updated config with backgroundImage:', updated.backgroundImage);
                                                                console.log('Full updated config:', updated);
                                                                return updated;
                                                            });
                                                            
                                                            // Lösche die Preview nach kurzer Verzögerung
                                                            setTimeout(() => {
                                                                setBackgroundImagePreview('');
                                                            }, 100);
                                                        } else {
                                                            const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
                                                            console.error('Error uploading image:', error);
                                                            if (response.status === 413) {
                                                                alert('Fehler: Das Bild ist zu groß. Bitte wählen Sie ein kleineres Bild oder komprimieren Sie es vor dem Upload.');
                                                            } else {
                                                                alert('Fehler beim Hochladen des Bildes: ' + (error.error || 'Unbekannter Fehler'));
                                                            }
                                                        }
                                                    } catch (error) {
                                                        console.error('Error processing image:', error);
                                                        alert('Fehler beim Verarbeiten des Bildes: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
                                                    }
                                                }
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {(backgroundImagePreview || newConfig.backgroundImage) && (
                                            <div className="mt-2 relative">
                                                <img 
                                                    src={
                                                        backgroundImagePreview 
                                                            ? backgroundImagePreview 
                                                            : newConfig.backgroundImage?.startsWith('/uploads/')
                                                            ? `/api${newConfig.backgroundImage}`
                                                            : newConfig.backgroundImage
                                                    } 
                                                    alt="Hintergrundbild Preview" 
                                                    className="w-full h-32 object-cover rounded border border-gray-300" 
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Portal-Kachel Hintergrundfarbe (Hex oder RGBA)
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={(() => {
                                                    const val = newConfig.portalBackgroundColor || '#111111';
                                                    if (val.startsWith('rgba') || val.startsWith('rgb')) {
                                                        const match = val.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                                                        if (match) {
                                                            const r = parseInt(match[1]).toString(16).padStart(2, '0');
                                                            const g = parseInt(match[2]).toString(16).padStart(2, '0');
                                                            const b = parseInt(match[3]).toString(16).padStart(2, '0');
                                                            return `#${r}${g}${b}`;
                                                        }
                                                    }
                                                    return val.substring(0, 7);
                                                })()}
                                                onChange={(e) => {
                                                    const currentValue = newConfig.portalBackgroundColor || '';
                                                    if (currentValue.startsWith('rgba')) {
                                                        const rgbaMatch = currentValue.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
                                                        if (rgbaMatch) {
                                                            const alpha = rgbaMatch[4] || '1';
                                                            const hex = e.target.value;
                                                            const r = parseInt(hex.slice(1, 3), 16);
                                                            const g = parseInt(hex.slice(3, 5), 16);
                                                            const b = parseInt(hex.slice(5, 7), 16);
                                                            setNewConfig({...newConfig, portalBackgroundColor: `rgba(${r}, ${g}, ${b}, ${alpha})`});
                                                        } else {
                                                            setNewConfig({...newConfig, portalBackgroundColor: e.target.value});
                                                        }
                                                    } else {
                                                        setNewConfig({...newConfig, portalBackgroundColor: e.target.value});
                                                    }
                                                }}
                                                className="h-10 w-20 border border-gray-300 rounded"
                                            />
                                            <input
                                                type="text"
                                                value={newConfig.portalBackgroundColor}
                                                onChange={(e) => setNewConfig({...newConfig, portalBackgroundColor: e.target.value})}
                                                placeholder="#111111 oder rgba(17, 17, 17, 0.8)"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        {newConfig.portalBackgroundColor && (newConfig.portalBackgroundColor.startsWith('rgba') || newConfig.portalBackgroundColor.startsWith('rgb')) && (
                                            <div className="mt-2">
                                                <label className="block text-xs text-gray-600 mb-1">
                                                    Transparenz (Alpha): {(() => {
                                                        const match = newConfig.portalBackgroundColor.match(/rgba?\([^,]+,\s*[^,]+,\s*[^,]+,\s*([\d.]+)\)/);
                                                        return match ? (parseFloat(match[1]) * 100).toFixed(0) + '%' : '100%';
                                                    })()}
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.01"
                                                    value={(() => {
                                                        const match = newConfig.portalBackgroundColor.match(/rgba?\([^,]+,\s*[^,]+,\s*[^,]+,\s*([\d.]+)\)/);
                                                        return match ? parseFloat(match[1]) : 1;
                                                    })()}
                                                    onChange={(e) => {
                                                        const alpha = parseFloat(e.target.value);
                                                        const match = newConfig.portalBackgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                                                        if (match) {
                                                            setNewConfig({...newConfig, portalBackgroundColor: `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`});
                                                        }
                                                    }}
                                                    className="w-full"
                                                />
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Unterstützt Hex (#111111) oder RGBA (rgba(17, 17, 17, 0.8)) für Transparenz
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Willkommensüberschrift
                                        </label>
                                        <div className="flex gap-2 items-end">
                                            <input
                                                type="text"
                                                value={newConfig.welcomeHeading}
                                                onChange={(e) => setNewConfig(prev => ({...prev, welcomeHeading: e.target.value}))}
                                                placeholder="Willkommen im Gäste-WLAN"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="flex gap-2 items-center">
                                                <label className="text-xs text-gray-600 whitespace-nowrap">Schriftfarbe:</label>
                                                <input
                                                    type="color"
                                                    value={newConfig.headingColor}
                                                    onChange={(e) => setNewConfig(prev => ({...prev, headingColor: e.target.value}))}
                                                    className="h-10 w-16 border border-gray-300 rounded"
                                                    title="Schriftfarbe"
                                                />
                                                <input
                                                    type="text"
                                                    value={newConfig.headingColor}
                                                    onChange={(e) => setNewConfig(prev => ({...prev, headingColor: e.target.value}))}
                                                    placeholder="#ffffff"
                                                    className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Willkommenstext
                                        </label>
                                        <div className="flex gap-2 items-start">
                                            <textarea
                                                value={newConfig.welcomeText}
                                                onChange={(e) => setNewConfig(prev => ({...prev, welcomeText: e.target.value}))}
                                                placeholder="Sie sind nur noch einen Klick vom Internetzugang entfernt."
                                                rows={2}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="flex gap-2 items-center pt-2">
                                                <label className="text-xs text-gray-600 whitespace-nowrap">Schriftfarbe:</label>
                                                <input
                                                    type="color"
                                                    value={newConfig.welcomeTextColor}
                                                    onChange={(e) => setNewConfig(prev => ({...prev, welcomeTextColor: e.target.value}))}
                                                    className="h-10 w-16 border border-gray-300 rounded"
                                                    title="Schriftfarbe"
                                                />
                                                <input
                                                    type="text"
                                                    value={newConfig.welcomeTextColor}
                                                    onChange={(e) => setNewConfig(prev => ({...prev, welcomeTextColor: e.target.value}))}
                                                    placeholder="#ffffff"
                                                    className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hinweistext
                                        </label>
                                        <div className="flex gap-2 items-start">
                                            <textarea
                                                value={newConfig.hintText}
                                                onChange={(e) => setNewConfig(prev => ({...prev, hintText: e.target.value}))}
                                                placeholder="Mit der Nutzung des WLANs erklären Sie sich mit unseren Nutzungsbedingungen einverstanden."
                                                rows={2}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="flex gap-2 items-center pt-2">
                                                <label className="text-xs text-gray-600 whitespace-nowrap">Schriftfarbe:</label>
                                                <input
                                                    type="color"
                                                    value={newConfig.hintTextColor}
                                                    onChange={(e) => setNewConfig(prev => ({...prev, hintTextColor: e.target.value}))}
                                                    className="h-10 w-16 border border-gray-300 rounded"
                                                    title="Schriftfarbe"
                                                />
                                                <input
                                                    type="text"
                                                    value={newConfig.hintTextColor}
                                                    onChange={(e) => setNewConfig(prev => ({...prev, hintTextColor: e.target.value}))}
                                                    placeholder="#ffffff"
                                                    className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Button Text
                                        </label>
                                        <div className="flex gap-2 items-start">
                                            <input
                                                type="text"
                                                value={newConfig.buttonText}
                                                onChange={(e) => setNewConfig(prev => ({...prev, buttonText: e.target.value}))}
                                                placeholder="Internet"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-2 items-center">
                                                    <label className="text-xs text-gray-600 whitespace-nowrap">Hintergrund:</label>
                                                    <input
                                                        type="color"
                                                        value={newConfig.buttonColor}
                                                        onChange={(e) => setNewConfig(prev => ({...prev, buttonColor: e.target.value}))}
                                                        className="h-10 w-16 border border-gray-300 rounded"
                                                        title="Button Hintergrundfarbe"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={newConfig.buttonColor}
                                                        onChange={(e) => setNewConfig(prev => ({...prev, buttonColor: e.target.value}))}
                                                        placeholder="#ff9800"
                                                        className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <label className="text-xs text-gray-600 whitespace-nowrap">Schriftfarbe:</label>
                                                    <input
                                                        type="color"
                                                        value={newConfig.buttonTextColor}
                                                        onChange={(e) => setNewConfig(prev => ({...prev, buttonTextColor: e.target.value}))}
                                                        className="h-10 w-16 border border-gray-300 rounded"
                                                        title="Schriftfarbe"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={newConfig.buttonTextColor}
                                                        onChange={(e) => setNewConfig(prev => ({...prev, buttonTextColor: e.target.value}))}
                                                        placeholder="#000000"
                                                        className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Weiterleitungs-URL (optional)
                                        </label>
                                        <input
                                            type="url"
                                            value={newConfig.redirectUrl}
                                            onChange={(e) => setNewConfig({...newConfig, redirectUrl: e.target.value})}
                                            placeholder="https://example.com"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            Link Text (Nutzungsbedingungen)
                                        </label>
                                        <input
                                            type="text"
                                            value={newConfig.termsLinkText}
                                            onChange={(e) => setNewConfig({...newConfig, termsLinkText: e.target.value})}
                                            placeholder="Nutzungsbedingungen anzeigen"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Willkommensnachricht (für API)
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
                                            Nutzungsbedingungen (für API)
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
                                        {editingConfigId ? 'Konfiguration speichern' : 'Konfiguration erstellen'}
                                    </button>
                                    {editingConfigId && (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (confirm('Möchten Sie diese Konfiguration wirklich löschen?')) {
                                                    await handleDeleteConfig(editingConfigId);
                                                }
                                            }}
                                            className="ml-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            Löschen
                                        </button>
                                    )}
                                </form>
                        </div>
                        </>
                ) : (
                    <div className="text-gray-500">
                        Bitte wählen Sie einen Knoten aus, um die zugehörigen Captive Portal Konfigurationen anzuzeigen.
                    </div>
                )}
            </div>

            {/* Rechte Seite: Vorschau */}
            <div className="w-1/3 p-4 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Vorschau</h2>
                <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
                    {selectedNode ? (
                        <DevicePreview
                            logoUrl={
                                logoPreview 
                                    ? logoPreview 
                                    : newConfig.logoUrl?.startsWith('/uploads/')
                                    ? `/api${newConfig.logoUrl}`
                                    : newConfig.logoUrl
                            }
                            welcomeHeading={newConfig.welcomeHeading}
                            welcomeText={newConfig.welcomeText}
                            hintText={newConfig.hintText}
                            backgroundColor={newConfig.backgroundColor}
                            backgroundImage={backgroundImagePreview || newConfig.backgroundImage}
                            portalBackgroundColor={newConfig.portalBackgroundColor}
                            buttonColor={newConfig.buttonColor}
                            buttonText={newConfig.buttonText}
                            buttonUrl={newConfig.redirectUrl}
                            termsLinkText={newConfig.termsLinkText}
                            termsLinkUrl="#"
                            headingColor={newConfig.headingColor}
                            welcomeTextColor={newConfig.welcomeTextColor}
                            hintTextColor={newConfig.hintTextColor}
                            buttonTextColor={newConfig.buttonTextColor}
                        />
                    ) : (
                        <div className="text-gray-500 text-center py-8">
                            Bitte wählen Sie einen Knoten aus, um die Vorschau zu sehen.
                        </div>
                    )}
                </div>
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