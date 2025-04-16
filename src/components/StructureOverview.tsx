import { useState } from 'react';
import { TreeNode } from '@/types/tree';
import { 
    ChevronRightIcon, 
    ChevronDownIcon,
    BuildingOfficeIcon, // Für STANDORT
    UserGroupIcon, // Für KUNDE
    FolderIcon, // Für BEREICH
    HomeIcon // Für ROOT
} from '@heroicons/react/24/outline';

const getCategoryIcon = (category: string) => {
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

const StructureOverview: React.FC = () => {
    const [structure, setStructure] = useState<TreeNode[]>([]);
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Strukturübersicht</h2>
            <div className="space-y-2">
                {structure.map((node) => (
                    <div key={node.id} className="ml-4">
                        <div
                            className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100`}
                            onClick={() => setSelectedNode(node)}
                        >
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedNodes((prev) => ({
                                        ...prev,
                                        [node.id]: !prev[node.id],
                                    }));
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                {expandedNodes[node.id] ? (
                                    <ChevronDownIcon className="h-5 w-5" />
                                ) : (
                                    <ChevronRightIcon className="h-5 w-5" />
                                )}
                            </button>

                            {getCategoryIcon(node.category)}

                            <span className="flex-1 text-gray-700">
                                {node.name}
                            </span>
                        </div>

                        {expandedNodes[node.id] && node.children && node.children.length > 0 && (
                            <div className="ml-4">
                                {node.children.map((child) => (
                                    <div key={child.id} className="flex items-center space-x-2 p-2">
                                        {getCategoryIcon(child.category)}
                                        <span className="text-gray-700">{child.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StructureOverview; 