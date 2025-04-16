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

interface DashboardTreeProps {
    nodes: TreeNode[];
    onNodeSelect: (node: TreeNode) => void;
}

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

export default function DashboardTree({ nodes, onNodeSelect }: DashboardTreeProps) {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    const toggleNode = (nodeId: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    };

    const renderNode = (node: TreeNode) => {
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div key={node.id} className="ml-4">
                <div 
                    className="flex items-center py-1 hover:bg-gray-100 cursor-pointer"
                    onClick={() => onNodeSelect(node)}
                >
                    {hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleNode(node.id);
                            }}
                            className="mr-2 text-gray-500 hover:text-gray-700"
                        >
                            {isExpanded ? '▼' : '▶'}
                        </button>
                    )}
                    <span className="text-sm">
                        {node.name} ({node.category})
                    </span>
                </div>
                {isExpanded && hasChildren && (
                    <div className="ml-4">
                        {node.children?.map(child => renderNode(child))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            {nodes.map(node => renderNode(node))}
        </div>
    );
} 