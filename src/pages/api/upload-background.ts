import { NextApiRequest, NextApiResponse } from 'next';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '20mb',
        },
    },
};

// Legacy endpoint - uses upload-image with type='background'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('[upload-background] Received request');
    console.log('[upload-background] Body keys:', Object.keys(req.body));
    console.log('[upload-background] Image length:', req.body.image?.length || 0);
    
    // Füge type='background' zum Request hinzu und rufe upload-image auf
    const { image, filename } = req.body;
    req.body.type = 'background';
    
    console.log('[upload-background] Calling upload-image with type=background');
    
    // Importiere die generische Upload-Funktion
    const uploadImage = await import('./upload-image');
    return uploadImage.default(req, res);
}

