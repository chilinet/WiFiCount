import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

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
            
            // Hole alle Captive Portal Konfigurationen für diese Nodes aus der Datenbank
            let configs;
            try {
                configs = await prisma.captivePortalConfig.findMany({
                    where: {
                        nodeId: {
                            in: ancestorIds
                        }
                    },
                    include: {
                        node: {
                            select: {
                                name: true,
                                category: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                });
            } catch (error: any) {
                // Falls die neuen Farbfelder noch nicht in der DB existieren, verwende select
                if (error.code === 'P2022' && error.meta?.column?.includes('headingColor')) {
                    // Abfrage ohne die neuen Farbfelder
                    configs = await prisma.captivePortalConfig.findMany({
                        where: {
                            nodeId: {
                                in: ancestorIds
                            }
                        },
                        select: {
                            id: true,
                            nodeId: true,
                            portalName: true,
                            welcomeMessage: true,
                            termsOfService: true,
                            redirectUrl: true,
                            sessionTimeout: true,
                            maxBandwidth: true,
                            isActive: true,
                            logoUrl: true,
                            welcomeHeading: true,
                            welcomeText: true,
                            hintText: true,
                            backgroundColor: true,
                            backgroundImage: true,
                            portalBackgroundColor: true,
                            buttonColor: true,
                            buttonText: true,
                            termsLinkText: true,
                            description: true,
                            createdAt: true,
                            updatedAt: true,
                            node: {
                                select: {
                                    name: true,
                                    category: true
                                }
                            }
                        } as any,
                        orderBy: {
                            createdAt: 'asc'
                        }
                    });
                } else {
                    throw error;
                }
            }

            // Sortiere nach Node-Position in der Hierarchie
            const sortedConfigs = configs.sort((a, b) => {
                const aIndex = ancestorIds.indexOf(a.nodeId);
                const bIndex = ancestorIds.indexOf(b.nodeId);
                if (aIndex !== bIndex) return aIndex - bIndex;
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });

            // Konvertiere Date-Objekte zu ISO-Strings und stelle sicher, dass backgroundImage korrekt zurückgegeben wird
            const serializedConfigs = sortedConfigs.map(config => ({
                ...config,
                backgroundImage: (config as any).backgroundImage ?? '',
                headingColor: (config as any).headingColor ?? '#ffffff',
                welcomeTextColor: (config as any).welcomeTextColor ?? '#ffffff',
                hintTextColor: (config as any).hintTextColor ?? '#ffffff',
                buttonTextColor: (config as any).buttonTextColor ?? '#000000',
                createdAt: config.createdAt.toISOString(),
                updatedAt: config.updatedAt.toISOString()
            }));

            res.status(200).json(serializedConfigs);
        } catch (error: any) {
            console.error('Error fetching captive portal configs:', error);
            if (error.code === 'P2021') {
                return res.status(500).json({ 
                    error: 'Table CaptivePortalConfig does not exist. Please run the SQL migration: create_captive_portal_config_table.sql' 
                });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    } else if (req.method === 'POST') {
        try {
            const { 
                nodeId, 
                portalName, 
                welcomeMessage, 
                termsOfService, 
                redirectUrl, 
                sessionTimeout, 
                maxBandwidth, 
                isActive,
                logoUrl,
                welcomeHeading,
                welcomeText,
                hintText,
                backgroundColor,
                backgroundImage,
                portalBackgroundColor,
                buttonColor,
                buttonText,
                termsLinkText,
                headingColor,
                welcomeTextColor,
                hintTextColor,
                buttonTextColor
            } = req.body;

            if (!nodeId || !portalName) {
                return res.status(400).json({ error: 'Node ID and portal name are required' });
            }

            // Prüfe, ob bereits eine Konfiguration für diesen Node existiert
            let existingConfig;
            try {
                existingConfig = await prisma.captivePortalConfig.findFirst({
                    where: {
                        nodeId: nodeId
                    }
                });
            } catch (error: any) {
                // Falls die neuen Farbfelder noch nicht in der DB existieren, verwende select
                if (error.code === 'P2022' && error.meta?.column?.includes('headingColor')) {
                    existingConfig = await prisma.captivePortalConfig.findFirst({
                        where: {
                            nodeId: nodeId
                        },
                        select: {
                            id: true,
                            nodeId: true,
                            portalName: true,
                            welcomeMessage: true,
                            termsOfService: true,
                            redirectUrl: true,
                            sessionTimeout: true,
                            maxBandwidth: true,
                            isActive: true,
                            logoUrl: true,
                            welcomeHeading: true,
                            welcomeText: true,
                            hintText: true,
                            backgroundColor: true,
                            backgroundImage: true,
                            portalBackgroundColor: true,
                            buttonColor: true,
                            buttonText: true,
                            termsLinkText: true,
                            description: true,
                            createdAt: true,
                            updatedAt: true
                        } as any
                    });
                } else {
                    throw error;
                }
            }

            // Debug: Log backgroundImage
            if (backgroundImage !== undefined) {
                console.log(`[POST /api/captive-portal] backgroundImage received, length: ${backgroundImage?.length || 0}, type: ${typeof backgroundImage}`);
            }

            // Erstelle update/create data object
            const data: any = {
                portalName,
                welcomeMessage: welcomeMessage || '',
                termsOfService: termsOfService || '',
                redirectUrl: redirectUrl || null,
                sessionTimeout: sessionTimeout || 3600,
                maxBandwidth: maxBandwidth || 1024,
                isActive: isActive !== undefined ? isActive : true,
                logoUrl: logoUrl || '',
                welcomeHeading: welcomeHeading || '',
                welcomeText: welcomeText || '',
                hintText: hintText || '',
                backgroundColor: backgroundColor || '#000000',
                backgroundImage: backgroundImage !== undefined ? backgroundImage : '',
                buttonText: buttonText || 'Internet',
                termsLinkText: termsLinkText || '',
                headingColor: headingColor || '#ffffff',
                welcomeTextColor: welcomeTextColor || '#ffffff',
                hintTextColor: hintTextColor || '#ffffff',
                buttonTextColor: buttonTextColor || '#000000'
            };

            // Füge neue Felder hinzu (werden ignoriert, wenn sie in der DB noch nicht existieren)
            // Diese werden nach der Migration automatisch verfügbar sein
            if (portalBackgroundColor !== undefined) {
                data.portalBackgroundColor = portalBackgroundColor || '#111111';
            }
            if (buttonColor !== undefined) {
                data.buttonColor = buttonColor || '#ff9800';
            }
            if (headingColor !== undefined) {
                data.headingColor = headingColor || '#ffffff';
            }
            if (welcomeTextColor !== undefined) {
                data.welcomeTextColor = welcomeTextColor || '#ffffff';
            }
            if (hintTextColor !== undefined) {
                data.hintTextColor = hintTextColor || '#ffffff';
            }
            if (buttonTextColor !== undefined) {
                data.buttonTextColor = buttonTextColor || '#000000';
            }

            // Debug: Log data before save
            console.log(`[POST /api/captive-portal] Saving with backgroundImage length: ${data.backgroundImage?.length || 0}, existingConfig: ${existingConfig ? 'yes' : 'no'}`);

            // Erstelle oder aktualisiere Konfiguration in der Datenbank
            let newConfig;
            try {
                if (existingConfig) {
                    // Aktualisiere bestehende Konfiguration
                    newConfig = await prisma.captivePortalConfig.update({
                        where: { id: existingConfig.id },
                        data: data
                    });
                } else {
                    // Erstelle neue Konfiguration
                    newConfig = await prisma.captivePortalConfig.create({
                        data: {
                            ...data,
                            node: {
                                connect: { id: nodeId }
                            }
                        }
                    });
                }
                console.log(`[POST /api/captive-portal] Save successful, saved backgroundImage length: ${(newConfig as any).backgroundImage?.length || 0}`);
            } catch (error: any) {
                // Falls die neuen Felder noch nicht in der DB existieren, versuche ohne sie
                if (error.code === 'P2000' || error.code === 'P2022' || error.message?.includes('Unknown argument') || error.message?.includes('too long')) {
                    // Falls backgroundImage zu lang ist, könnte die Spalte noch VARCHAR sein
                    if (error.code === 'P2000' && error.meta?.column_name === 'backgroundImage') {
                        console.error('backgroundImage column is too small. Please run: mysql -u root -P 8889 -p wificnt < fix_background_image_column.sql');
                        return res.status(500).json({ 
                            error: 'backgroundImage column is too small. Please run the SQL migration to change it to TEXT type.',
                            details: error.message
                        });
                    }
                    // Versuche ohne die neuen Felder
                    delete data.portalBackgroundColor;
                    delete data.buttonColor;
                    delete data.headingColor;
                    delete data.welcomeTextColor;
                    delete data.hintTextColor;
                    delete data.buttonTextColor;
                    if (existingConfig) {
                        newConfig = await prisma.captivePortalConfig.update({
                            where: { id: existingConfig.id },
                            data: data
                        });
                    } else {
                        newConfig = await prisma.captivePortalConfig.create({
                            data: {
                                ...data,
                                node: {
                                    connect: { id: nodeId }
                                }
                            }
                        });
                    }
                } else if (error.code === 'P2002') {
                    // Unique constraint error - versuche Update statt Create
                    if (existingConfig) {
                        newConfig = await prisma.captivePortalConfig.update({
                            where: { id: existingConfig.id },
                            data: data
                        });
                    } else {
                        // Versuche, die bestehende Konfiguration mit diesem Namen zu finden und zu aktualisieren
                        let configWithSameName;
                        try {
                            configWithSameName = await prisma.captivePortalConfig.findFirst({
                                where: { portalName: portalName }
                            });
                        } catch (error: any) {
                            // Falls die neuen Farbfelder noch nicht in der DB existieren, verwende select
                            if (error.code === 'P2022' && error.meta?.column?.includes('headingColor')) {
                                configWithSameName = await prisma.captivePortalConfig.findFirst({
                                    where: { portalName: portalName },
                                    select: {
                                        id: true,
                                        nodeId: true,
                                        portalName: true,
                                        welcomeMessage: true,
                                        termsOfService: true,
                                        redirectUrl: true,
                                        sessionTimeout: true,
                                        maxBandwidth: true,
                                        isActive: true,
                                        logoUrl: true,
                                        welcomeHeading: true,
                                        welcomeText: true,
                                        hintText: true,
                                        backgroundColor: true,
                                        backgroundImage: true,
                                        portalBackgroundColor: true,
                                        buttonColor: true,
                                        buttonText: true,
                                        termsLinkText: true,
                                        description: true,
                                        createdAt: true,
                                        updatedAt: true
                                    } as any
                                });
                            } else {
                                throw error;
                            }
                        }
                        if (configWithSameName && configWithSameName.nodeId === nodeId) {
                            newConfig = await prisma.captivePortalConfig.update({
                                where: { id: configWithSameName.id },
                                data: data
                            });
                        } else {
                            throw error;
                        }
                    }
                } else {
                    throw error;
                }
            }

            // Konvertiere Date-Objekte zu ISO-Strings
            const serializedConfig = {
                ...newConfig,
                createdAt: newConfig.createdAt.toISOString(),
                updatedAt: newConfig.updatedAt.toISOString()
            };

            res.status(201).json(serializedConfig);
        } catch (error: any) {
            console.error('Error creating captive portal config:', error);
            if (error.code === 'P2021') {
                return res.status(500).json({ 
                    error: 'Table CaptivePortalConfig does not exist. Please run the SQL migration: create_captive_portal_config_table.sql' 
                });
            }
            if (error.code === 'P2003') {
                return res.status(400).json({ 
                    error: 'Invalid nodeId. The specified node does not exist.' 
                });
            }
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 