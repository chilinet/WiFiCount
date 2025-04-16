import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Tree from '@/components/Tree';
import { prisma } from '@/lib/prisma';
import { TreeNode, NodeCategory } from '@/types/tree';

interface StructurePageProps {
    initialNodes: TreeNode[];
}

export default function StructurePage({ initialNodes = [] }: StructurePageProps) {
    const [nodes, setNodes] = useState<TreeNode[]>(Array.isArray(initialNodes) ? initialNodes : []);
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNodes = async () => {
            try {
                const response = await fetch('/api/nodes');
                if (response.ok) {
                    const data = await response.json();
                    // Die Nodes sind bereits flach, wir müssen sie nur als Array setzen
                    setNodes(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Fehler beim Laden der Nodes:', error);
                setNodes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNodes();
    }, []);

    const handleNodeSelect = (node: TreeNode) => {
        console.log('Node selected:', node);
        setSelectedNode(node);
    };

    const handleNodeUpdate = async (nodeId: string, updates: { name: string; category: NodeCategory }) => {
        console.log('Updating node:', { nodeId, updates });
        try {
            const response = await fetch(`/api/nodes/${nodeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            console.log('Update response:', response);

            if (response.ok) {
                const updatedNode = await response.json();
                console.log('Updated node:', updatedNode);
                setNodes(nodes.map(node => 
                    node.id === nodeId ? updatedNode : node
                ));
                if (selectedNode?.id === nodeId) {
                    setSelectedNode(updatedNode);
                }
            } else {
                console.error('Failed to update node:', await response.text());
            }
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Nodes:', error);
        }
    };

    const handleNodeDelete = async (nodeId: string) => {
        console.log('Deleting node:', nodeId);
        try {
            // Finde den Node im Baum
            const nodeToDelete = nodes.find(node => node.id === nodeId);
            if (!nodeToDelete) {
                console.error('Node nicht gefunden:', nodeId);
                return;
            }

            // Überprüfe, ob der Node Kinder hat
            if (nodeToDelete.children && nodeToDelete.children.length > 0) {
                alert('Dieser Node kann nicht gelöscht werden, da er Kinder hat.');
                return;
            }

            const response = await fetch(`/api/nodes/${nodeId}`, {
                method: 'DELETE',
            });

            console.log('Delete response:', response);

            if (response.ok) {
                setNodes(nodes.filter(node => node.id !== nodeId));
                if (selectedNode?.id === nodeId) {
                    setSelectedNode(null);
                }
            } else {
                console.error('Failed to delete node:', await response.text());
            }
        } catch (error) {
            console.error('Fehler beim Löschen des Nodes:', error);
        }
    };

    const handleNodeCreate = async (parentId: string | null, name: string, category: NodeCategory) => {
        console.log('Creating node with:', { parentId, name, category });
        try {
            const response = await fetch('/api/nodes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    category,
                    parentId
                }),
            });

            console.log('Create response:', response);

            if (response.ok) {
                const newNode = await response.json();
                console.log('Created node:', newNode);
                
                // Lade die Nodes neu, um die aktualisierte Struktur zu erhalten
                const fetchResponse = await fetch('/api/nodes');
                console.log('Fetch response:', fetchResponse);
                
                if (fetchResponse.ok) {
                    const updatedNodes = await fetchResponse.json();
                    console.log('Updated nodes:', updatedNodes);
                    setNodes(Array.isArray(updatedNodes) ? updatedNodes : []);
                }
            } else {
                console.error('Failed to create node:', await response.text());
            }
        } catch (error) {
            console.error('Fehler beim Erstellen des Nodes:', error);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Strukturverwaltung</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <Tree
                            initialNodes={nodes}
                            onNodeSelect={handleNodeSelect}
                            onNodeUpdate={handleNodeUpdate}
                            onNodeDelete={handleNodeDelete}
                            onNodeCreate={handleNodeCreate}
                        />
                    </div>
                    <div>
                        {selectedNode ? (
                            <div className="border rounded-lg p-4">
                                <h2 className="text-lg font-medium mb-4">Node Details</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedNode.name}
                                            onChange={(e) => handleNodeUpdate(selectedNode.id, {
                                                name: e.target.value,
                                                category: selectedNode.category
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Kategorie
                                        </label>
                                        <select
                                            value={selectedNode.category}
                                            onChange={(e) => handleNodeUpdate(selectedNode.id, {
                                                name: selectedNode.name,
                                                category: e.target.value as NodeCategory
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            {selectedNode.parentId === null ? (
                                                <option value="ROOT">Root</option>
                                            ) : (
                                                <>
                                                    <option value="KUNDE">Kunde</option>
                                                    <option value="STANDORT">Standort</option>
                                                    <option value="BEREICH">Bereich</option>
                                                </>
                                            )}
                                        </select>
                                    </div>

                                </div>
                            </div>
                        ) : (
                            <div className="border rounded-lg p-4">
                                <p className="text-gray-500">Wählen Sie einen Node aus, um Details anzuzeigen.</p>
                            </div>
                        )}
                    </div>
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
        const serializedNodes = nodes.map((node: any) => ({
            ...node,
            createdAt: node.createdAt.toISOString(),
            updatedAt: node.updatedAt.toISOString(),
            children: []
        }));

        return {
            props: {
                initialNodes: serializedNodes
            }
        };
    } catch (error) {
        console.error('Fehler beim Laden der Nodes:', error);
        return {
            props: {
                initialNodes: []
            }
        };
    }
} 