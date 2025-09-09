import { NextApiRequest, NextApiResponse } from 'next';

// Importiere das In-Memory Storage aus dem Haupt-Endpunkt
// Da Next.js API-Routen isoliert sind, müssen wir das Storage anders handhaben
let captivePortalConfigs: any[] = [];
let nextId = 1;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Config ID is required' });
    }

    if (req.method === 'GET') {
        try {
            const config = captivePortalConfigs.find(c => c.id === id);

            if (!config) {
                return res.status(404).json({ error: 'Config not found' });
            }

            res.status(200).json(config);
        } catch (error) {
            console.error('Error fetching captive portal config:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { portalName, welcomeMessage, termsOfService, redirectUrl, sessionTimeout, maxBandwidth, isActive } = req.body;

            const configIndex = captivePortalConfigs.findIndex(c => c.id === id);
            if (configIndex === -1) {
                return res.status(404).json({ error: 'Config not found' });
            }

            const updatedConfig = {
                ...captivePortalConfigs[configIndex],
                portalName,
                welcomeMessage: welcomeMessage || '',
                termsOfService: termsOfService || '',
                redirectUrl,
                sessionTimeout: sessionTimeout || 3600,
                maxBandwidth: maxBandwidth || 1024,
                isActive: isActive !== undefined ? isActive : true,
                updatedAt: new Date().toISOString()
            };

            captivePortalConfigs[configIndex] = updatedConfig;

            res.status(200).json(updatedConfig);
        } catch (error) {
            console.error('Error updating captive portal config:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const configIndex = captivePortalConfigs.findIndex(c => c.id === id);
            if (configIndex === -1) {
                return res.status(404).json({ error: 'Config not found' });
            }

            captivePortalConfigs.splice(configIndex, 1);

            res.status(204).end();
        } catch (error) {
            console.error('Error deleting captive portal config:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 