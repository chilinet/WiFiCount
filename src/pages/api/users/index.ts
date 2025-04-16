import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

type UserRole = 'SuperAdmin' | 'CustomerAdmin' | 'User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const users = await prisma.user.findMany({
                orderBy: {
                    name: 'asc'
                }
            });
            return res.status(200).json(users);
        } catch (error) {
            console.error('Fehler beim Laden der Benutzer:', error);
            return res.status(500).json({ error: 'Fehler beim Laden der Benutzer' });
        }
    } else if (req.method === 'POST') {
        try {
            const { name, email, password, role } = req.body;

            // Überprüfe, ob die E-Mail bereits existiert
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Diese E-Mail-Adresse ist bereits registriert' });
            }

            // Hashe das Passwort
            const hashedPassword = await hash(password, 12);

            // Erstelle den Benutzer
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: role || 'USER'
                }
            });

            return res.status(201).json(user);
        } catch (error) {
            console.error('Fehler beim Erstellen des Benutzers:', error);
            return res.status(500).json({ error: 'Interner Serverfehler' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 