import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

type UserRole = 'SUPERADMIN' | 'ADMIN' | 'USER';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Ungültige Benutzer-ID' });
    }

    if (req.method === 'GET') {
        try {
            const user = await prisma.user.findUnique({
                where: { id: id as string }
            });

            if (!user) {
                return res.status(404).json({ error: 'Benutzer nicht gefunden' });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error('Fehler beim Abrufen des Benutzers:', error);
            res.status(500).json({ error: 'Fehler beim Abrufen des Benutzers' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { email, name, password, role } = req.body;

            // Überprüfen, ob der Benutzer existiert
            const existingUser = await prisma.user.findUnique({
                where: { id: id as string }
            });

            if (!existingUser) {
                return res.status(404).json({ error: 'Benutzer nicht gefunden' });
            }

            // Überprüfen, ob die neue E-Mail bereits existiert
            if (email && email !== existingUser.email) {
                const emailExists = await prisma.user.findUnique({
                    where: { email }
                });

                if (emailExists) {
                    return res.status(400).json({ error: 'E-Mail bereits vergeben' });
                }
            }

            // Überprüfen, ob die Rolle gültig ist
            if (role && !['SUPERADMIN', 'ADMIN', 'USER'].includes(role)) {
                return res.status(400).json({ error: 'Ungültige Rolle' });
            }

            // Daten für das Update vorbereiten
            const updateData: any = {
                email: email || existingUser.email,
                name: name || existingUser.name,
                role: role || existingUser.role
            };

            // Wenn ein neues Passwort angegeben wurde, hashen
            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }

            const updatedUser = await prisma.user.update({
                where: { id: id as string },
                data: updateData
            });

            res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Benutzers:', error);
            res.status(500).json({ error: 'Fehler beim Aktualisieren des Benutzers' });
        }
    } else if (req.method === 'DELETE') {
        try {
            await prisma.user.delete({
                where: { id: id as string }
            });

            res.status(204).end();
        } catch (error) {
            console.error('Fehler beim Löschen des Benutzers:', error);
            res.status(500).json({ error: 'Fehler beim Löschen des Benutzers' });
        }
    } else if (req.method === 'PATCH') {
        try {
            const { nodeId, role } = req.body;

            // Überprüfe, ob der ausgewählte Knoten existiert und vom Typ KUNDE ist
            if (nodeId) {
                const node = await prisma.treeNode.findUnique({
                    where: { id: nodeId },
                    select: { category: true }
                });

                if (!node || node.category !== 'KUNDE') {
                    return res.status(400).json({ error: 'Ungültiger Kundenknoten ausgewählt' });
                }
            }

            // Überprüfen, ob die Rolle gültig ist
            if (role && !['SUPERADMIN', 'ADMIN', 'USER'].includes(role)) {
                return res.status(400).json({ error: 'Ungültige Rolle' });
            }

            const updateData: any = {
                nodeId: nodeId || null
            };

            if (role) {
                updateData.role = role;
            }

            const updatedUser = await prisma.user.update({
                where: { id },
                data: updateData
            });

            return res.json(updatedUser);
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Benutzers:', error);
            return res.status(500).json({ error: 'Interner Serverfehler' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'PATCH']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 