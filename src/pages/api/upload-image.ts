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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image, filename, type } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Prüfe ob es eine Data URL ist
        if (!image.startsWith('data:image/')) {
            // Wenn es bereits eine URL ist, gib sie zurück
            return res.status(200).json({ url: image });
        }

        // Extrahiere MIME-Type und Base64-Daten
        const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (!matches) {
            return res.status(400).json({ error: 'Invalid image format' });
        }

        const mimeType = matches[1];
        const base64Data = matches[2];

        // Bestimme das Upload-Verzeichnis basierend auf dem Typ
        const uploadType = type === 'logo' ? 'logos' : 'backgrounds';
        const uploadsDir = join(process.cwd(), 'uploads', uploadType);
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Generiere eindeutigen Dateinamen
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = mimeType === 'jpeg' ? 'jpg' : mimeType;
        const filePath = join(uploadsDir, `${timestamp}-${randomString}.${fileExtension}`);
        const relativePath = `/uploads/${uploadType}/${timestamp}-${randomString}.${fileExtension}`;

        // Konvertiere Base64 zu Buffer und speichere
        const buffer = Buffer.from(base64Data, 'base64');
        await writeFile(filePath, buffer);

        console.log(`[upload-image] File saved to: ${filePath}`);
        console.log(`[upload-image] Returning URL: ${relativePath}`);
        console.log(`[upload-image] Type: ${type}, UploadType: ${uploadType}`);

        // Gib die URL zurück
        return res.status(200).json({ url: relativePath });
    } catch (error: any) {
        console.error('Error uploading image:', error);
        return res.status(500).json({ error: 'Failed to upload image', details: error.message });
    }
}

