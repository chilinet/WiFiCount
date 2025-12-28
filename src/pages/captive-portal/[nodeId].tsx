import { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';
import { ReactElement } from 'react';
import type { NextPageWithLayout } from '@/types/next';

interface CaptivePortalPageProps {
    config: {
        logoUrl?: string;
        welcomeHeading?: string;
        welcomeText?: string;
        hintText?: string;
        backgroundColor?: string;
        backgroundImage?: string;
        portalBackgroundColor?: string;
        buttonColor?: string;
        buttonText?: string;
        buttonUrl?: string;
        termsLinkText?: string;
        termsLinkUrl?: string;
        headingColor?: string;
        welcomeTextColor?: string;
        hintTextColor?: string;
        buttonTextColor?: string;
    };
    nodeName: string;
}

const CaptivePortalPreview: NextPageWithLayout<CaptivePortalPageProps> = ({ config, nodeName }) => {
    // Funktion zum Abdunkeln einer Farbe für Hover-Effekt
    const darkenColor = (color: string, percent: number) => {
        if (!color) return '#000000';
        
        // Wenn es eine RGBA-Farbe ist
        if (color.startsWith('rgba')) {
            const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (match) {
                const r = Math.max(0, parseInt(match[1]) - (percent * 2.55));
                const g = Math.max(0, parseInt(match[2]) - (percent * 2.55));
                const b = Math.max(0, parseInt(match[3]) - (percent * 2.55));
                const a = match[4] ? parseFloat(match[4]) : 1;
                return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }
        
        // Wenn es eine Hex-Farbe ist
        if (color.startsWith('#')) {
            const num = parseInt(color.replace('#', ''), 16);
            const r = Math.max(0, (num >> 16) - (percent * 2.55));
            const g = Math.max(0, ((num >> 8) & 0x00FF) - (percent * 2.55));
            const b = Math.max(0, (num & 0x0000FF) - (percent * 2.55));
            return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
        }
        
        return color;
    };

    // Konvertiere relative Pfade zu absoluten URLs
    const getBackgroundImageUrl = () => {
        if (!config.backgroundImage) return '';
        if (config.backgroundImage.startsWith('http://') || config.backgroundImage.startsWith('https://') || config.backgroundImage.startsWith('data:')) {
            return config.backgroundImage;
        }
        if (config.backgroundImage.startsWith('/uploads/')) {
            return `/api${config.backgroundImage}`;
        }
        return config.backgroundImage;
    };

    const getLogoUrl = () => {
        if (!config.logoUrl) return 'https://chilinet.solutions/wp-content/uploads/2020/10/chilinetWhite.png';
        if (config.logoUrl.startsWith('http://') || config.logoUrl.startsWith('https://') || config.logoUrl.startsWith('data:')) {
            return config.logoUrl;
        }
        if (config.logoUrl.startsWith('/uploads/')) {
            return `/api${config.logoUrl}`;
        }
        return config.logoUrl;
    };

    const bodyStyle: React.CSSProperties = {
        background: config.backgroundImage 
            ? `url('${getBackgroundImageUrl()}') center/cover no-repeat, ${config.backgroundColor || '#000000'}`
            : config.backgroundColor || '#000000',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    };

    return (
        <div style={bodyStyle}>
            {/* Portal Content */}
            <div 
                className="text-center rounded-[18px] shadow-[0_16px_36px_rgba(0,0,0,.6)]"
                style={{
                    backgroundColor: config.portalBackgroundColor || '#111111',
                    width: 'min(95%, 480px)',
                    padding: '28px 22px'
                }}
            >
                {/* Logo */}
                {config.logoUrl && (
                    <div className="mb-6">
                        <img 
                            src={getLogoUrl()} 
                            alt="Logo" 
                            className="max-w-[200px] max-h-[80px] mx-auto object-contain" 
                        />
                    </div>
                )}

                {/* Welcome Heading */}
                {config.welcomeHeading && (
                    <h1 
                        className="text-2xl font-bold mb-4"
                        style={{
                            color: config.headingColor || '#ffffff'
                        }}
                    >
                        {config.welcomeHeading}
                    </h1>
                )}

                {/* Welcome Text */}
                {config.welcomeText && (
                    <p 
                        className="text-base mb-6"
                        style={{
                            color: config.welcomeTextColor || '#ffffff'
                        }}
                    >
                        {config.welcomeText}
                    </p>
                )}

                {/* Hint Text */}
                {config.hintText && (
                    <p 
                        className="text-sm mb-6"
                        style={{
                            color: config.hintTextColor || '#ffffff'
                        }}
                    >
                        {config.hintText}
                    </p>
                )}

                {/* Internet Button */}
                {config.buttonText && (
                    <form method="post" action={config.buttonUrl || '#'}>
                        <button
                            type="submit"
                            className="btn-main w-full py-[14px] px-4 rounded-full border-none font-bold text-base cursor-pointer shadow-[0_10px_20px_rgba(0,0,0,.7)] transition-all duration-100 active:scale-[0.98]"
                            style={{
                                backgroundColor: config.buttonColor || '#ff9800',
                                color: config.buttonTextColor || '#000000'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = darkenColor(config.buttonColor || '#ff9800', 10);
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = config.buttonColor || '#ff9800';
                            }}
                        >
                            {config.buttonText}
                        </button>
                    </form>
                )}

                {/* Terms Link */}
                {config.termsLinkText && (
                    <div className="mt-6">
                        <a 
                            href={config.termsLinkUrl || '#'} 
                            className="text-sm underline hover:opacity-80"
                            style={{
                                color: config.welcomeTextColor || '#ffffff',
                                opacity: 0.8
                            }}
                        >
                            {config.termsLinkText}
                        </a>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <p 
                        className="text-xs text-center"
                        style={{
                            color: config.welcomeTextColor || '#ffffff',
                            opacity: 0.6
                        }}
                    >
                        Chilinet Made with ❤️ in Germany
                    </p>
                </div>
            </div>
        </div>
    );
};

// Kein Layout für diese Seite - Vollbild-Vorschau
CaptivePortalPreview.getLayout = function getLayout(page: ReactElement) {
    return page;
};

export default CaptivePortalPreview;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { nodeId } = context.params!;

    if (!nodeId || typeof nodeId !== 'string') {
        return {
            notFound: true,
        };
    }

    try {
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
                        updatedAt: true
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
            const aIndex = ancestorIds.indexOf(a.nodeId || '');
            const bIndex = ancestorIds.indexOf(b.nodeId || '');
            if (aIndex !== bIndex) return aIndex - bIndex;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        // Die gültige Konfiguration für diesen Node ist die letzte in der Liste
        const effectiveConfig = sortedConfigs.length > 0 ? sortedConfigs[sortedConfigs.length - 1] : null;

        // Hole Node-Name
        const node = await prisma.treeNode.findUnique({
            where: { id: nodeId },
            select: { name: true }
        });

        if (!node) {
            return {
                notFound: true,
            };
        }

        // Wenn keine Konfiguration gefunden wurde, verwende Standardwerte
        const config = effectiveConfig ? {
            logoUrl: effectiveConfig.logoUrl || 'https://chilinet.solutions/wp-content/uploads/2020/10/chilinetWhite.png',
            welcomeHeading: effectiveConfig.welcomeHeading || 'Willkommen im Gäste-WLAN',
            welcomeText: effectiveConfig.welcomeText || 'Sie sind nur noch einen Klick vom Internetzugang entfernt.',
            hintText: effectiveConfig.hintText || 'Mit der Nutzung des WLANs erklären Sie sich mit unseren Nutzungsbedingungen einverstanden.',
            backgroundColor: effectiveConfig.backgroundColor || '#000000',
            backgroundImage: effectiveConfig.backgroundImage || '',
            portalBackgroundColor: effectiveConfig.portalBackgroundColor || '#111111',
            buttonColor: effectiveConfig.buttonColor || '#ff9800',
            buttonText: effectiveConfig.buttonText || 'Internet',
            buttonUrl: effectiveConfig.redirectUrl || '#',
            termsLinkText: effectiveConfig.termsLinkText || 'Nutzungsbedingungen anzeigen',
            termsLinkUrl: '#',
            headingColor: (effectiveConfig as any).headingColor || '#ffffff',
            welcomeTextColor: (effectiveConfig as any).welcomeTextColor || '#ffffff',
            hintTextColor: (effectiveConfig as any).hintTextColor || '#ffffff',
            buttonTextColor: (effectiveConfig as any).buttonTextColor || '#000000'
        } : {
            logoUrl: 'https://chilinet.solutions/wp-content/uploads/2020/10/chilinetWhite.png',
            welcomeHeading: 'Willkommen im Gäste-WLAN',
            welcomeText: 'Sie sind nur noch einen Klick vom Internetzugang entfernt.',
            hintText: 'Mit der Nutzung des WLANs erklären Sie sich mit unseren Nutzungsbedingungen einverstanden.',
            backgroundColor: '#000000',
            backgroundImage: '',
            portalBackgroundColor: '#111111',
            buttonColor: '#ff9800',
            buttonText: 'Internet',
            buttonUrl: '#',
            termsLinkText: 'Nutzungsbedingungen anzeigen',
            termsLinkUrl: '#',
            headingColor: '#ffffff',
            welcomeTextColor: '#ffffff',
            hintTextColor: '#ffffff',
            buttonTextColor: '#000000'
        };

        return {
            props: {
                config,
                nodeName: node.name
            }
        };
    } catch (error) {
        console.error('Error fetching captive portal config:', error);
        return {
            notFound: true,
        };
    }
};

