import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

// In-Memory Storage für Captive Portal Konfigurationen
let captivePortalConfigs: any[] = [];
let nextId = 1;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const { nodeId } = req.query;
            
            if (!nodeId || typeof nodeId !== 'string') {
                return res.status(400).json({ error: 'Node ID is required' });
            }

            // Finde alle übergeordneten Nodes (inklusive Root)
            const getAncestorIds = async (nodeId: string): Promise<string[]> => {
                const ancestors: string[] = [];
                let currentNodeId = nodeId;
                
                while (currentNodeId) {
                    ancestors.push(currentNodeId);
                    const node = await prisma.treeNode.findUnique({
                        where: { id: currentNodeId },
                        select: { parentId: true }
                    });
                    
                    if (!node || !node.parentId) {
                        break;
                    }
                    currentNodeId = node.parentId;
                }
                
                return ancestors.reverse(); // Von Root zu aktueller Node
            };

            const ancestorIds = await getAncestorIds(nodeId);
            
            // Hole alle Captive Portal Konfigurationen für diese Nodes aus dem In-Memory Storage
            const configs = captivePortalConfigs.filter(config => 
                ancestorIds.includes(config.nodeId)
            ).sort((a, b) => {
                // Sortiere nach Node-Position in der Hierarchie
                const aIndex = ancestorIds.indexOf(a.nodeId);
                const bIndex = ancestorIds.indexOf(b.nodeId);
                if (aIndex !== bIndex) return aIndex - bIndex;
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });

            res.status(200).json(configs);
        } catch (error) {
            console.error('Error fetching captive portal configs:', error);
            res.status(200).json([]);
        }
    } else if (req.method === 'POST') {
        try {
            const { nodeId, portalName, welcomeMessage, termsOfService, redirectUrl, sessionTimeout, maxBandwidth, isActive } = req.body;

            if (!nodeId || !portalName || !redirectUrl) {
                return res.status(400).json({ error: 'Node ID, portal name and redirect URL are required' });
            }

            // Erstelle neue Konfiguration im In-Memory Storage
            const newConfig = {
                id: `config_${nextId++}`,
                nodeId,
                portalName,
                welcomeMessage: welcomeMessage || '',
                termsOfService: termsOfService || '',
                redirectUrl,
                sessionTimeout: sessionTimeout || 3600,
                maxBandwidth: maxBandwidth || 1024,
                isActive: isActive !== undefined ? isActive : true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            captivePortalConfigs.push(newConfig);

            res.status(201).json(newConfig);
        } catch (error) {
            console.error('Error creating captive portal config:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 