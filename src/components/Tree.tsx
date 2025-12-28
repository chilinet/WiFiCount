import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { TreeNode, NodeCategory } from '@/types/tree';
import TreeNodeComponent from './TreeNode';
// import NodeDetails from './NodeDetails';
import { treeService } from '../services/treeService';
import { ChevronRightIcon, ChevronDownIcon, PlusIcon, PencilIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

type TreeProps = {
    initialNodes: TreeNode[];
    onNodeSelect?: (node: TreeNode) => void;
    onNodeUpdate?: (nodeId: string, updates: { name: string; category: NodeCategory }) => void;
    onNodeDelete?: (nodeId: string) => void;
    onNodeCreate?: (parentId: string | null, name: string, category: NodeCategory) => Promise<void>;
    readOnly?: boolean;
};

export interface TreeRef {
    loadTree: () => Promise<void>;
}

// Hilfsfunktion zum Konvertieren eines verschachtelten Baums in ein flaches Array
const flattenTree = (node: TreeNode): TreeNode[] => {
    const flatNodes: TreeNode[] = [node];
    if (node.children) {
        node.children.forEach(child => {
            flatNodes.push(...flattenTree(child));
        });
    }
    return flatNodes;
};

// Hilfsfunktion zum Sortieren eines TreeNode und seiner Kinder
const sortTreeNodeByName = (node: TreeNode): TreeNode => {
    return {
    ...node,
    children: [...(node.children ?? [])]
        .sort((a, b) => a.name.localeCompare(b.name, 'de'))
        .map(child => sortTreeNodeByName(child))
    };
};

const Tree = forwardRef<TreeRef, TreeProps>(({ 
    initialNodes = [], 
    onNodeSelect, 
    onNodeUpdate, 
    onNodeDelete,
    onNodeCreate,
    readOnly = false
}, ref) => {
    const [nodes, setNodes] = useState<TreeNode[]>(Array.isArray(initialNodes) ? initialNodes : []);
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [newNodeParentId, setNewNodeParentId] = useState<string | null>(null);
    const [newNodeName, setNewNodeName] = useState('');
    const [newNodeCategory, setNewNodeCategory] = useState<NodeCategory>('KUNDE');

    useEffect(() => {
        if (Array.isArray(initialNodes)) {
            setNodes(initialNodes);
        }
    }, [initialNodes]);

    const loadTree = async () => {
        try {
            console.log('Loading tree...');
            const response = await fetch('/api/nodes');
            if (!response.ok) {
                throw new Error('Failed to load nodes');
            }
            const loadedNodes = await response.json();
            console.log('Loaded nodes:', loadedNodes);
            
            // Die Nodes sind bereits flach, wir können sie direkt setzen
            setNodes(Array.isArray(loadedNodes) ? loadedNodes : []);
        } catch (error) {
            console.error('Error loading nodes:', error);
        }
    };

    useImperativeHandle(ref, () => ({
        loadTree
    }));

    useEffect(() => {
        loadTree();
    }, []);

    const handleNodeSelect = (node: TreeNode) => {
        setSelectedNode(node);
        if (onNodeSelect) {
            onNodeSelect(node);
        }
    };

    const handleNodeDelete = async (nodeId: string) => {
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

        if (onNodeDelete) {
            await onNodeDelete(nodeId);
        }
    };

    const handleNodeUpdate = async (nodeId: string, updates: { name: string; category: NodeCategory }) => {
        try {
            await treeService.updateNode(nodeId, updates.name, updates.category);
            await loadTree();
            if (selectedNode && selectedNode.id === nodeId) {
                setSelectedNode({
                    ...selectedNode,
                    ...updates
                });
            }
        } catch (error) {
            console.error('Error updating node:', error);
        }
    };

    const handleNodeCreate = async (parentId: string | null) => {
        console.log('Creating node in Tree component:', { parentId, newNodeName, newNodeCategory });
        if (onNodeCreate && newNodeName.trim()) {
            await onNodeCreate(parentId, newNodeName.trim(), newNodeCategory);
            setNewNodeName('');
            setNewNodeParentId(null);
        }
    };

    const toggleNode = (nodeId: string) => {
        const newExpandedNodes = new Set(expandedNodes);
        if (newExpandedNodes.has(nodeId)) {
            newExpandedNodes.delete(nodeId);
        } else {
            newExpandedNodes.add(nodeId);
        }
        setExpandedNodes(newExpandedNodes);
    };

    const handleEditStart = (node: TreeNode) => {
        setEditingNodeId(node.id);
    };

    const handleEditSubmit = () => {
        if (editingNodeId && onNodeUpdate) {
            onNodeUpdate(editingNodeId, {
                name: nodes.find(n => n.id === editingNodeId)?.name || '',
                category: nodes.find(n => n.id === editingNodeId)?.category as NodeCategory || 'KUNDE'
            });
        }
        setEditingNodeId(null);
    };

    const handleAddStart = (parentId: string) => {
        setNewNodeParentId(parentId);
        setNewNodeName('');
        setNewNodeCategory('KUNDE');
    };

    const handleAddSubmit = () => {
        if (newNodeParentId && onNodeCreate) {
            onNodeCreate(newNodeParentId, newNodeName, newNodeCategory);
            setNewNodeName('');
            setNewNodeParentId(null);
        }
    };

    const buildTree = (parentId: string | null = null): TreeNode[] => {
        return nodes
            .filter((node) => node.parentId === parentId)
            .map((node) => ({
                ...node,
                children: buildTree(node.id),
            }));
    };

    console.log('buildTree:', buildTree());
    console.log('nodes:', nodes);
    const tree = buildTree();

    if (!tree.length) {
        return (
            <div className="p-4">
                <p className="text-gray-500">Keine Nodes vorhanden</p>
                {!readOnly && (
                    <button
                        onClick={() => onNodeCreate?.(null, 'Neue Wurzel', 'ROOT')}
                        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Wurzelknoten erstellen
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="border rounded-lg p-4">
            {tree.map((node) => (
                <TreeNodeComponent
                    key={node.id}
                    node={node}
                    onSelect={handleNodeSelect}
                    onUpdate={handleNodeUpdate}
                    onDelete={handleNodeDelete}
                    onCreate={onNodeCreate || (async (parentId: string | null, name: string, category: NodeCategory) => Promise.resolve())}
                    onEditStart={handleEditStart}
                    onEditSubmit={handleEditSubmit}
                    onAddSubmit={handleAddSubmit}
                    readOnly={readOnly}
                />
            ))}
        </div>
    );
});

Tree.displayName = 'Tree';

export default Tree; 