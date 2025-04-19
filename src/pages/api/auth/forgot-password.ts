import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Return success even if user not found for security
            return res.status(200).json({ message: 'If an account exists, you will receive an email with instructions' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Save reset token to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        // Create reset link
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

        // Configure email transport
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Send email
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: user.email,
            subject: 'CHILINET - Passwort zurücksetzen',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Passwort zurücksetzen</h2>
                    <p>Hallo,</p>
                    <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts für Ihr CHILINET-Konto gestellt.</p>
                    <p>Klicken Sie auf den folgenden Link, um ein neues Passwort zu erstellen:</p>
                    <p style="margin: 20px 0;">
                        <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                            Passwort zurücksetzen
                        </a>
                    </p>
                    <p>Dieser Link ist 24 Stunden gültig.</p>
                    <p>Falls Sie keine Zurücksetzung Ihres Passworts angefordert haben, können Sie diese E-Mail ignorieren.</p>
                    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 0.9em; color: #666;">
                        Dies ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht auf diese Nachricht.
                    </p>
                </div>
            `,
        });

        res.status(200).json({ message: 'If an account exists, you will receive an email with instructions' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
    }
} 