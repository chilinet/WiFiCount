import { NextApiRequest, NextApiResponse } from 'next';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { path: filePath } = req.query;

        if (!filePath || !Array.isArray(filePath)) {
            return res.status(400).json({ error: 'Invalid file path' });
        }

        const fullPath = join(process.cwd(), 'uploads', 'backgrounds', ...filePath);

        // Sicherheitsprüfung: Stelle sicher, dass der Pfad innerhalb des uploads-Verzeichnisses liegt
        const normalizedPath = join(process.cwd(), 'uploads', 'backgrounds');
        if (!fullPath.startsWith(normalizedPath)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!existsSync(fullPath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = await readFile(fullPath);
        const ext = filePath[filePath.length - 1].split('.').pop()?.toLowerCase();

        // Setze Content-Type basierend auf Dateierweiterung
        const contentType = ext === 'jpg' || ext === 'jpeg' 
            ? 'image/jpeg' 
            : ext === 'png' 
            ? 'image/png' 
            : ext === 'gif' 
            ? 'image/gif' 
            : ext === 'webp' 
            ? 'image/webp' 
            : 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.status(200).send(file);
    } catch (error: any) {
        console.error('Error serving background image:', error);
        return res.status(500).json({ error: 'Failed to serve image', details: error.message });
    }
}

