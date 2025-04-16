import { useState, useEffect } from 'react';
import { TreeNode } from '../types/tree';

interface NodeDetailsProps {
    node: TreeNode | null;
    onEdit: (nodeId: string, newName: string, category: TreeNode['category']) => void;
}

export default function NodeDetails({ node, onEdit }: NodeDetailsProps) {
    const [editName, setEditName] = useState(node?.name || '');
    const [editCategory, setEditCategory] = useState<TreeNode['category']>(node?.category || 'Kunde');

    // Update the form when a new node is selected
    useEffect(() => {
        if (node) {
            setEditName(node.name);
            setEditCategory(node.category || 'Kunde');
        }
    }, [node]);

    if (!node) {
        return (
            <div className="p-6">
                <div className="text-gray-500 text-center">
                    Bitte wählen Sie einen Knoten aus
                </div>
            </div>
        );
    }

    const handleSave = () => {
        if (node) {
            onEdit(node.id, editName, editCategory || 'Kunde');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Knoten bearbeiten</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kategorie</label>
                    <select
                        value={editCategory || 'Kunde'}
                        onChange={(e) => setEditCategory(e.target.value as TreeNode['category'])}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="Kunde">Kunde</option>
                        <option value="Standort">Standort</option>
                        <option value="Abteilung">Abteilung</option>
                    </select>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Speichern
                    </button>
                </div>
            </div>
        </div>
    );
} 