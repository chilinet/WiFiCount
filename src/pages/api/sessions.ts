import { NextApiRequest, NextApiResponse } from 'next';

interface SessionData {
    username: string;
    client_mac: string;
    client_ip: string;
    ap_ip: string;
    ap_bssid_ssid: string;
    ap_bssid: string;
    ssid: string;
    acctsessionid: string;
    acctstarttime: string;
    last_update: string;
    session_time_seconds: string;
    bytes_rx: number;
    bytes_tx: number;
    bytes_total: number;
}

interface SessionsResponse {
    success: boolean;
    count: number;
    ap_mac: string[];
    ap_mac_count: number;
    data: SessionData[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SessionsResponse | { error: string }>) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { ap_mac } = req.query;

        if (!ap_mac || typeof ap_mac !== 'string') {
            return res.status(400).json({ error: 'ap_mac Parameter ist erforderlich' });
        }

        // Externen API-Endpoint aufrufen - verwende RADIUS_API
        const radiusApiUrl = process.env.RADIUS_API || process.env.NEXT_PUBLIC_RADIUS_API || 'http://localhost:3001';
        const baseUrl = radiusApiUrl.trim().replace(/\/$/, ''); // Entferne trailing slash
        const url = `${baseUrl}/api/sessions?ap_mac=${encodeURIComponent(ap_mac)}`;
        
        console.log('[sessions API] RADIUS_API URL:', baseUrl);
        console.log('[sessions API] Request URL:', url);
        
        const response = await fetch(url, {
            headers: process.env.NEXT_PUBLIC_API_KEY ? {
                'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
            } : undefined
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Fehler beim Laden der Sessions:', error);
        return res.status(500).json({ error: 'Fehler beim Laden der Sessions' });
    }
}

