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
    onNodeSelect?: (node: TreeNode) => void;
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

const DashboardTree: React.FC<DashboardTreeProps> = ({ nodes, onNodeSelect }) => {
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

    const buildTree = (parentId: string | null = null): TreeNode[] => {
        return nodes
            .filter((node) => node.parentId === parentId)
            .map((node) => ({
                ...node,
                children: buildTree(node.id),
            }));
    };

    const tree = buildTree();

    const handleNodeClick = (node: TreeNode) => {
        setSelectedNode(node);
        if (onNodeSelect) {
            onNodeSelect(node);
        }
    };

    const TreeNodeComponent: React.FC<{ node: TreeNode; level: number }> = ({ node, level }) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes[node.id];
        const isSelected = selectedNode?.id === node.id;

        return (
            <div className="ml-4">
                <div
                    className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                        isSelected ? 'bg-blue-100' : ''
                    }`}
                    style={{ marginLeft: `${level * 1}rem` }}
                    onClick={() => handleNodeClick(node)}
                >
                    {hasChildren && (
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
                            {isExpanded ? (
                                <ChevronDownIcon className="h-5 w-5" />
                            ) : (
                                <ChevronRightIcon className="h-5 w-5" />
                            )}
                        </button>
                    )}
                    {!hasChildren && <div className="w-5" />}

                    {getCategoryIcon(node.category)}

                    <span className={`flex-1 text-gray-700 ${isSelected ? 'font-semibold' : ''}`}>
                        {node.name}
                    </span>
                </div>

                {isExpanded && hasChildren && (
                    <div>
                        {node.children.map((child) => (
                            <TreeNodeComponent key={child.id} node={child} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-2">
            {tree.map((node) => (
                <TreeNodeComponent key={node.id} node={node} level={0} />
            ))}
        </div>
    );
};

export default DashboardTree; 