import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Config ID is required' });
    }

    if (req.method === 'GET') {
        try {
            let config;
            try {
                config = await prisma.captivePortalConfig.findUnique({
                    where: { id }
                });
            } catch (error: any) {
                // Falls die neuen Farbfelder noch nicht in der DB existieren, verwende select
                if (error.code === 'P2022' && error.meta?.column?.includes('headingColor')) {
                    // Abfrage ohne die neuen Farbfelder
                    config = await prisma.captivePortalConfig.findUnique({
                        where: { id },
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

            if (!config) {
                return res.status(404).json({ error: 'Config not found' });
            }

            // Konvertiere Date-Objekte zu ISO-Strings und füge Standardwerte für fehlende Felder hinzu
            const serializedConfig = {
                ...config,
                headingColor: (config as any).headingColor ?? '#ffffff',
                welcomeTextColor: (config as any).welcomeTextColor ?? '#ffffff',
                hintTextColor: (config as any).hintTextColor ?? '#ffffff',
                buttonTextColor: (config as any).buttonTextColor ?? '#000000',
                createdAt: config.createdAt.toISOString(),
                updatedAt: config.updatedAt.toISOString()
            };

            res.status(200).json(serializedConfig);
        } catch (error) {
            console.error('Error fetching captive portal config:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { 
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

            // Debug: Log backgroundImage length
            if (backgroundImage !== undefined) {
                console.log(`[PUT /api/captive-portal/${id}] backgroundImage received, length: ${backgroundImage?.length || 0}, type: ${typeof backgroundImage}`);
            }

            // Erstelle update data object
            const updateData: any = {
                portalName,
                welcomeMessage: welcomeMessage || '',
                termsOfService: termsOfService || '',
                redirectUrl: redirectUrl || null,
                sessionTimeout: sessionTimeout || 3600,
                maxBandwidth: maxBandwidth || 1024,
                isActive: isActive !== undefined ? isActive : true,
                logoUrl: logoUrl !== undefined ? logoUrl : '',
                welcomeHeading: welcomeHeading !== undefined ? welcomeHeading : '',
                welcomeText: welcomeText !== undefined ? welcomeText : '',
                hintText: hintText !== undefined ? hintText : '',
                backgroundColor: backgroundColor !== undefined ? backgroundColor : '#000000',
                backgroundImage: backgroundImage !== undefined ? backgroundImage : '',
                buttonText: buttonText !== undefined ? buttonText : 'Internet',
                termsLinkText: termsLinkText !== undefined ? termsLinkText : '',
                headingColor: headingColor !== undefined ? headingColor : '#ffffff',
                welcomeTextColor: welcomeTextColor !== undefined ? welcomeTextColor : '#ffffff',
                hintTextColor: hintTextColor !== undefined ? hintTextColor : '#ffffff',
                buttonTextColor: buttonTextColor !== undefined ? buttonTextColor : '#000000'
            };

            // Füge neue Felder hinzu (werden ignoriert, wenn sie in der DB noch nicht existieren)
            // Diese werden nach der Migration automatisch verfügbar sein
            if (portalBackgroundColor !== undefined) {
                updateData.portalBackgroundColor = portalBackgroundColor;
            }
            if (buttonColor !== undefined) {
                updateData.buttonColor = buttonColor;
            }
            if (headingColor !== undefined) {
                updateData.headingColor = headingColor || '#ffffff';
            }
            if (welcomeTextColor !== undefined) {
                updateData.welcomeTextColor = welcomeTextColor || '#ffffff';
            }
            if (hintTextColor !== undefined) {
                updateData.hintTextColor = hintTextColor || '#ffffff';
            }
            if (buttonTextColor !== undefined) {
                updateData.buttonTextColor = buttonTextColor || '#000000';
            }

            // Debug: Log updateData
            console.log(`[PUT /api/captive-portal/${id}] Updating with backgroundImage length: ${updateData.backgroundImage?.length || 0}`);
            
            let updatedConfig;
            try {
                updatedConfig = await prisma.captivePortalConfig.update({
                    where: { id },
                    data: updateData
                });
                console.log(`[PUT /api/captive-portal/${id}] Update successful, saved backgroundImage length: ${(updatedConfig as any).backgroundImage?.length || 0}`);
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
                    delete updateData.portalBackgroundColor;
                    delete updateData.buttonColor;
                    delete updateData.headingColor;
                    delete updateData.welcomeTextColor;
                    delete updateData.hintTextColor;
                    delete updateData.buttonTextColor;
                    updatedConfig = await prisma.captivePortalConfig.update({
                        where: { id },
                        data: updateData
                    });
                } else {
                    throw error;
                }
            }

            // Konvertiere Date-Objekte zu ISO-Strings
            const serializedConfig = {
                ...updatedConfig,
                createdAt: updatedConfig.createdAt.toISOString(),
                updatedAt: updatedConfig.updatedAt.toISOString()
            };

            res.status(200).json(serializedConfig);
        } catch (error) {
            console.error('Error updating captive portal config:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else if (req.method === 'DELETE') {
        try {
            // Prüfe zuerst, ob der Datensatz existiert
            let existingConfig;
            try {
                existingConfig = await prisma.captivePortalConfig.findUnique({
                    where: { id }
                });
            } catch (error: any) {
                // Falls die neuen Farbfelder noch nicht in der DB existieren, verwende select
                if (error.code === 'P2022' && error.meta?.column?.includes('headingColor')) {
                    existingConfig = await prisma.captivePortalConfig.findUnique({
                        where: { id },
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

            if (!existingConfig) {
                return res.status(404).json({ error: 'Config not found' });
            }

            await prisma.captivePortalConfig.delete({
                where: { id }
            });

            res.status(204).end();
        } catch (error: any) {
            console.error('Error deleting captive portal config:', error);
            
            // Behandle spezifische Prisma-Fehler
            if (error.code === 'P2025') {
                // Record not found - bereits gelöscht oder existiert nicht
                return res.status(404).json({ error: 'Config not found or already deleted' });
            }
            
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 