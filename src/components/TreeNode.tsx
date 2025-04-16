import { useState } from 'react';
import { TreeNode, NodeCategory } from '@/types/tree';
import { 
    ChevronRightIcon, 
    ChevronDownIcon, 
    PlusIcon, 
    PencilIcon, 
    XMarkIcon,
    BuildingOfficeIcon, // Für STANDORT
    UserGroupIcon, // Für KUNDE
    FolderIcon, // Für BEREICH
    HomeIcon // Für ROOT
} from '@heroicons/react/24/outline';

interface TreeNodeProps {
    node: TreeNode;
    onSelect: (node: TreeNode) => void;
    onUpdate: (nodeId: string, updates: { name: string; category: NodeCategory }) => Promise<void>;
    onDelete: (nodeId: string) => Promise<void>;
    onCreate: (parentId: string | null, name: string, category: NodeCategory) => Promise<void>;
    onEditStart: (node: TreeNode) => void;
    onEditSubmit: () => void;
    onAddSubmit: () => void;
}

export default function TreeNodeComponent({
    node,
    onSelect,
    onUpdate,
    onDelete,
    onCreate,
    onEditStart,
    onEditSubmit,
    onAddSubmit
}: TreeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(node.name);
    const [isAdding, setIsAdding] = useState(false);
    const [newChildName, setNewChildName] = useState('');
    const [newChildCategory, setNewChildCategory] = useState<NodeCategory>('KUNDE');

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (node.children && node.children.length > 0) {
            alert('Dieser Node kann nicht gelöscht werden, da er Kinder hat.');
            return;
        }

        if (window.confirm(`Möchten Sie wirklich den Node '${node.name}' löschen?`)) {
            await onDelete(node.id);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdate(node.id, { name: newName, category: node.category });
        setIsEditing(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await onCreate(node.id, newChildName, newChildCategory);
        setNewChildName('');
        setIsAdding(false);
    };

    const getCategoryIcon = (category: NodeCategory) => {
        switch (category) {
            case 'ROOT':
                return <HomeIcon className="h-5 w-5 text-gray-500" />;
            case 'KUNDE':
                return <UserGroupIcon className="h-5 w-5 text-blue-500" />;
            case 'STANDORT':
                return <BuildingOfficeIcon className="h-5 w-5 text-green-500" />;
            case 'BEREICH':
                return <FolderIcon className="h-5 w-5 text-yellow-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="ml-4">
            <div
                className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100`}
                onClick={() => onSelect(node)}
            >
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                >
                    {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>

                {getCategoryIcon(node.category)}

                {isEditing ? (
                    <form onSubmit={handleUpdate} className="flex-1">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-2 py-1 border rounded-md"
                            autoFocus
                        />
                    </form>
                ) : (
                    <span className="flex-1 text-gray-700">
                        {node.name}
                    </span>
                )}

                <div className="flex items-center space-x-2">
                    {!isEditing && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAdding(true);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <PlusIcon className="h-5 w-5" />
                            </button>
                            {(!node.children || node.children.length === 0) && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {isAdding && (
                <div className="ml-8 mt-2">
                    <form onSubmit={handleCreate} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={newChildName}
                            onChange={(e) => setNewChildName(e.target.value)}
                            placeholder="Neuer Node Name"
                            className="flex-1 px-2 py-1 border rounded-md"
                            autoFocus
                        />
                        <select
                            value={newChildCategory}
                            onChange={(e) => setNewChildCategory(e.target.value as NodeCategory)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="KUNDE">Kunde</option>
                            <option value="STANDORT">Standort</option>
                            <option value="BEREICH">Bereich</option>
                        </select>
                        <button
                            type="submit"
                            className="px-2 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Hinzufügen
                        </button>
                    </form>
                </div>
            )}

            {isExpanded && node.children && node.children.length > 0 && (
                <div className="ml-4">
                    {node.children.map((child) => (
                        <TreeNodeComponent
                            key={child.id}
                            node={child}
                            onSelect={onSelect}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onCreate={onCreate}
                            onEditStart={onEditStart}
                            onEditSubmit={onEditSubmit}
                            onAddSubmit={onAddSubmit}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 