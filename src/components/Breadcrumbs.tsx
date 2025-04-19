import { TreeNode } from '@/types/tree';

interface BreadcrumbsProps {
    node: TreeNode | null;
    nodes: TreeNode[];
}

export default function Breadcrumbs({ node, nodes }: BreadcrumbsProps) {
    if (!node) return null;

    const getNodePath = (nodeId: string): TreeNode[] => {
        const path: TreeNode[] = [];
        let currentId = nodeId;

        while (currentId) {
            const currentNode = nodes.find(n => n.id === currentId);
            if (currentNode) {
                path.unshift(currentNode);
                currentId = currentNode.parentId || '';
            } else {
                break;
            }
        }

        return path;
    };

    const path = getNodePath(node.id);

    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                {path.map((node, index) => (
                    <li key={node.id} className="flex items-center">
                        {index > 0 && (
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                            </svg>
                        )}
                        <span className={`ml-2 text-sm font-medium ${index === path.length - 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                            {node.name}
                        </span>
                    </li>
                ))}
            </ol>
        </nav>
    );
} 