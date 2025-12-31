import { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';
import { ReactElement, useEffect } from 'react';
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
    urlParams: {
        ga_ssid?: string;
        ga_ap_mac?: string;
        ga_nas_id?: string;
        ga_srvr?: string;
        ga_cmac?: string;
        ga_orig_url?: string;
        ga_Qv?: string;
        c_timeout?: string;
        ga_error_code?: string;
    };
    radiusApiUrl?: string;
}

const CaptivePortalAuth: NextPageWithLayout<CaptivePortalPageProps> = ({ config, nodeName, urlParams, radiusApiUrl }) => {
    // JavaScript Funktionen für Login-Request einbinden
    useEffect(() => {
        // Speichere radiusApiUrl in einer Closure, damit sie in der Funktion verfügbar ist
        const apiUrl = radiusApiUrl;
        
        // Funktion zum Auslesen von URL-Parametern
        (window as any).getUrlVars = function() {
            const vars: Record<string, string> = {};
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.forEach((value, key) => {
                vars[key] = value;
            });
            return vars;
        };

        // Login-Request Funktion
        (window as any).sendcnLoginrequest = function() {
            const vars = (window as any).getUrlVars();
            
            // Alle URL-Parameter extrahieren
            const ga_ssid = vars["ga_ssid"] || '';
            const ga_ap_mac = vars["ga_ap_mac"] || '';
            const ga_cmac = vars["ga_cmac"] || '';
            const ga_nas_id = vars["ga_nas_id"] || '';
            const ga_srvr = vars["ga_srvr"] || '';
            const ga_Qv = vars["ga_Qv"] || '';
            const ga_orig_url = vars["ga_orig_url"] || '';

            console.log('sendcnLoginrequest');
            console.log('radiusApiUrl from closure:', apiUrl);
            
            // MAC-Adresse aus ga_cmac extrahieren (nur ga_cmac, kein Fallback auf ga_ap_mac)
            if (!ga_cmac || ga_cmac.trim() === '') {
                console.error('ga_cmac Parameter fehlt oder ist leer');
                const resultElement = document.getElementById("Result");
                if (resultElement) {
                    resultElement.innerHTML = 'Fehler: ga_cmac Parameter fehlt';
                }
                return;
            }

            // Konvertiere von "-" zu ":" falls nötig
            const macAddress = ga_cmac.replace(/-/g, ':').toUpperCase();

            // Berechne Mitternacht des aktuellen Tages
            const now = new Date();
            const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            const validUntil = midnight.toISOString().slice(0, 19).replace('T', ' '); // Format: "2024-12-31 23:59:59"

            // API-URL zusammenstellen
            // Verwende die radiusApiUrl aus der Closure
            let finalApiUrl;
            if (apiUrl && apiUrl.trim() !== '') {
                // Entferne trailing slash falls vorhanden
                const baseUrl = apiUrl.trim().replace(/\/$/, '');
                finalApiUrl = `${baseUrl}/api/accesspoint/register`;
                console.log('Using RADIUS_API URL:', finalApiUrl);
            } else {
                finalApiUrl = '/api/accesspoint/register';
                console.warn('RADIUS_API not set, using local route:', finalApiUrl);
            }
            
            // Request Body
            const requestBody = {
                mac: macAddress,
                valid_until: validUntil,
                duration_hours: 4,
                ga_orig_url: ga_orig_url
            };

            console.log('API URL:', finalApiUrl);
            console.log('Request Body:', requestBody);

            const xhttp = new XMLHttpRequest();
            xhttp.open("POST", finalApiUrl, false);
            xhttp.setRequestHeader("Content-Type", "application/json");
            xhttp.send(JSON.stringify(requestBody));

            console.log('Response Status:', xhttp.status);
            console.log('Response:', xhttp.responseText);

            const resultElement = document.getElementById("Result");
            if (resultElement) {
                if (xhttp.status === 200 || xhttp.status === 201) {
                    try {
                        const response = JSON.parse(xhttp.responseText);
                        resultElement.innerHTML = response.message || 'Erfolgreich registriert';
                        
                        // Extrahiere username aus der Response (kann username, user, oder ein anderes Feld sein)
                        const username = response.username || response.user || response.mac || macAddress;
                        
                        // Konstruiere die Access Point Login URL
                        if (ga_srvr) {
                            // Entferne eckige Klammern von IPv6-Adressen falls vorhanden
                            let serverAddress = ga_srvr.replace(/[\[\]]/g, '');
                            
                            // Konstruiere die Base URL
                            const baseUrl = `http://${serverAddress}:880/cgi-bin/hotspot_login.cgi`;
                            
                            // Query-Parameter zusammenstellen
                            const queryParams: Record<string, string> = {
                                'ga_ssid': ga_ssid,
                                'ga_ap_mac': ga_ap_mac,
                                'ga_user': username,
                                'ga_pass': username, // ga_pass wird gleich username gesetzt
                                'ga_nas_id': ga_nas_id,
                                'ga_srvr': ga_srvr,
                                'ga_cmac': ga_cmac,
                                'ga_Qv': ga_Qv
                            };
                            
                            // URL mit Query-Parametern zusammenstellen
                            const queryString = Object.keys(queryParams)
                                .filter(key => queryParams[key]) // Nur Parameter mit Werten hinzufügen
                                .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key]))
                                .join('&');
                            
                            const hotspotLoginUrl = `${baseUrl}?${queryString}`;
                            
                            console.log('Hotspot Login URL:', hotspotLoginUrl);
                            
                            // Redirect zur Hotspot Login URL
                            setTimeout(() => {
                                window.location.href = hotspotLoginUrl;
                            }, 500); // Kurze Verzögerung, damit der Benutzer die Erfolgsmeldung sieht
                        } else {
                            // Fallback: Redirect zur ursprünglich angefragten URL oder zur URL aus der Response
                            const redirectUrl = response.redirect_url || ga_orig_url || '/';
                            if (redirectUrl && redirectUrl !== '#') {
                                setTimeout(() => {
                                    window.location.href = redirectUrl;
                                }, 1000);
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing response:', e);
                        // Falls die Response kein JSON ist, verwende den Text direkt
                        resultElement.innerHTML = 'Erfolgreich registriert';
                        
                        // Versuche trotzdem die Hotspot Login URL zu konstruieren
                        if (ga_srvr) {
                            let serverAddress = ga_srvr.replace(/[\[\]]/g, '');
                            const baseUrl = `http://${serverAddress}:880/cgi-bin/hotspot_login.cgi`;
                            const macAddressForUser = macAddress.replace(/:/g, '-');
                            const queryParams: Record<string, string> = {
                                'ga_ssid': ga_ssid,
                                'ga_ap_mac': ga_ap_mac,
                                'ga_user': macAddressForUser,
                                'ga_pass': macAddressForUser,
                                'ga_nas_id': ga_nas_id,
                                'ga_srvr': ga_srvr,
                                'ga_cmac': ga_cmac,
                                'ga_Qv': ga_Qv
                            };
                            const queryString = Object.keys(queryParams)
                                .filter(key => queryParams[key])
                                .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key]))
                                .join('&');
                            const hotspotLoginUrl = `${baseUrl}?${queryString}`;
                            
                            setTimeout(() => {
                                window.location.href = hotspotLoginUrl;
                            }, 500);
                        } else {
                            const redirectUrl = ga_orig_url || '/';
                            if (redirectUrl && redirectUrl !== '#') {
                                setTimeout(() => {
                                    window.location.href = redirectUrl;
                                }, 1000);
                            }
                        }
                    }
                } else {
                    resultElement.innerHTML = `Fehler: ${xhttp.status} - ${xhttp.responseText}`;
                }
            }
        };
    }, [radiusApiUrl]);

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
                    <div>
                        <button
                            type="button"
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    (window as any).sendcnLoginrequest();
                                }
                            }}
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
                        <div id="Result" className="mt-2 text-sm text-center" style={{ color: config.welcomeTextColor || '#ffffff' }}></div>
                    </div>
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
CaptivePortalAuth.getLayout = function getLayout(page: ReactElement) {
    return page;
};

export default CaptivePortalAuth;

export const getServerSideProps: GetServerSideProps = async (context) => {
    // Sammle alle URL-Parameter
    const urlParams: Record<string, string> = {};
    Object.entries(context.query).forEach(([key, value]) => {
        if (typeof value === 'string') {
            urlParams[key] = value;
        } else if (Array.isArray(value) && value.length > 0) {
            urlParams[key] = value[0];
        }
    });

    const { ga_ap_mac } = context.query;

    // Prüfe ob ga_ap_mac Parameter vorhanden ist
    if (!ga_ap_mac || typeof ga_ap_mac !== 'string') {
        console.error('ga_ap_mac Parameter fehlt oder ist kein String:', ga_ap_mac);
        // Verwende Standardwerte wenn Parameter fehlt (für Tests)
        return {
            props: {
                config: {
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
                },
                nodeName: 'Unbekannt',
                urlParams: {
                    ga_ssid: urlParams.ga_ssid || '',
                    ga_ap_mac: urlParams.ga_ap_mac || '',
                    ga_nas_id: urlParams.ga_nas_id || '',
                    ga_srvr: urlParams.ga_srvr || '',
                    ga_cmac: urlParams.ga_cmac || '',
                    ga_orig_url: urlParams.ga_orig_url || '',
                    ga_Qv: urlParams.ga_Qv || '',
                    c_timeout: urlParams.c_timeout || '',
                    ga_error_code: urlParams.ga_error_code || ''
                }
            }
        };
    }

    try {
        // Konvertiere MAC-Adresse von "-" zu ":"
        // z.B. "BC-A9-93-5F-AC-2C" -> "BC:A9:93:5F:AC:2C"
        const macAddress = ga_cmac.replace(/-/g, ':').toUpperCase();
        console.log(`Suche Device mit MAC-Adresse: ${macAddress}`);

        // Finde Device über macAddress
        const device = await prisma.device.findFirst({
            where: {
                macAddress: macAddress
            },
            include: {
                area: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!device || !device.area) {
            console.error(`Device mit MAC-Adresse ${macAddress} nicht gefunden`);
            // Verwende Standardwerte wenn Device nicht gefunden wird
            return {
                props: {
                    config: {
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
                    },
                    nodeName: 'Unbekannt',
                    urlParams: {
                        ga_ssid: urlParams.ga_ssid || '',
                        ga_ap_mac: urlParams.ga_ap_mac || '',
                        ga_nas_id: urlParams.ga_nas_id || '',
                        ga_srvr: urlParams.ga_srvr || '',
                        ga_cmac: urlParams.ga_cmac || '',
                        ga_orig_url: urlParams.ga_orig_url || '',
                        ga_Qv: urlParams.ga_Qv || '',
                        c_timeout: urlParams.c_timeout || '',
                        ga_error_code: urlParams.ga_error_code || ''
                    }
                }
            };
        }

        const nodeId = device.area.id;

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

        // Hole RADIUS_API URL aus Umgebungsvariablen
        const radiusApiUrl = process.env.RADIUS_API || process.env.NEXT_PUBLIC_RADIUS_API || '';
        console.log('[getServerSideProps] RADIUS_API from env:', process.env.RADIUS_API);
        console.log('[getServerSideProps] NEXT_PUBLIC_RADIUS_API from env:', process.env.NEXT_PUBLIC_RADIUS_API);
        console.log('[getServerSideProps] Final radiusApiUrl:', radiusApiUrl);

        return {
            props: {
                config,
                nodeName: device.area.name,
                urlParams: {
                    ga_ssid: urlParams.ga_ssid || '',
                    ga_ap_mac: urlParams.ga_ap_mac || '',
                    ga_nas_id: urlParams.ga_nas_id || '',
                    ga_srvr: urlParams.ga_srvr || '',
                    ga_cmac: urlParams.ga_cmac || '',
                    ga_orig_url: urlParams.ga_orig_url || '',
                    ga_Qv: urlParams.ga_Qv || '',
                    c_timeout: urlParams.c_timeout || '',
                    ga_error_code: urlParams.ga_error_code || ''
                },
                radiusApiUrl
            }
        };
    } catch (error) {
        console.error('Error fetching captive portal config:', error);
        
        // Hole RADIUS_API URL aus Umgebungsvariablen
        const radiusApiUrl = process.env.RADIUS_API || process.env.NEXT_PUBLIC_RADIUS_API || '';
        
        // Bei Fehler Standardwerte verwenden statt 404
        return {
            props: {
                config: {
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
                },
                nodeName: 'Fehler',
                urlParams: {
                    ga_ssid: urlParams.ga_ssid || '',
                    ga_ap_mac: urlParams.ga_ap_mac || '',
                    ga_nas_id: urlParams.ga_nas_id || '',
                    ga_srvr: urlParams.ga_srvr || '',
                    ga_cmac: urlParams.ga_cmac || '',
                    ga_orig_url: urlParams.ga_orig_url || '',
                    ga_Qv: urlParams.ga_Qv || '',
                    c_timeout: urlParams.c_timeout || '',
                    ga_error_code: urlParams.ga_error_code || ''
                },
                radiusApiUrl
            }
        };
    }
};

