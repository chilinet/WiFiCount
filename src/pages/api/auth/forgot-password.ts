import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('[forgot-password] Request received:', {
        method: req.method,
        url: req.url,
        body: req.body ? { email: req.body.email ? '***' : 'missing' } : 'no body'
    });

    if (req.method !== 'POST') {
        console.log('[forgot-password] Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;
        console.log('[forgot-password] Processing request for email:', email ? '***' : 'missing');

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        // Find user
        console.log('[forgot-password] Searching for user with email:', email);
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
            }
        });

        console.log('[forgot-password] User found:', user ? { id: user.id, email: user.email ? '***' : 'null' } : 'not found');

        if (!user || !user.email) {
            // Return success even if user not found for security
            console.log('[forgot-password] User not found or email missing - returning early');
            return res.status(200).json({ message: 'If an account exists, you will receive an email with instructions' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Save reset token to database
        console.log('[forgot-password] Saving reset token to database');
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });
        console.log('[forgot-password] Reset token saved successfully');

        // Create reset link
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
        console.log('[forgot-password] Reset URL created:', resetUrl.replace(resetToken, '***'));

        // Check if SMTP configuration is available
        console.log('[forgot-password] Checking SMTP configuration:', {
            SMTP_HOST: !!process.env.SMTP_HOST,
            SMTP_USER: !!process.env.SMTP_USER,
            SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
            SMTP_FROM: !!process.env.SMTP_FROM,
            SMTP_PORT: process.env.SMTP_PORT,
            SMTP_SECURE: process.env.SMTP_SECURE,
        });

        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.SMTP_FROM) {
            console.error('[forgot-password] SMTP configuration missing:', {
                SMTP_HOST: !!process.env.SMTP_HOST,
                SMTP_USER: !!process.env.SMTP_USER,
                SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
                SMTP_FROM: !!process.env.SMTP_FROM,
            });
            // Still save the token, but log the error
            console.error('[forgot-password] E-Mail konnte nicht versendet werden: SMTP-Konfiguration fehlt');
            // Return success to user (security best practice)
            return res.status(200).json({ 
                message: 'If an account exists, you will receive an email with instructions',
                warning: 'SMTP configuration missing - email not sent'
            });
        }

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

        // Verify transporter configuration
        try {
            await transporter.verify();
            console.log('[forgot-password] SMTP connection verified');
        } catch (verifyError) {
            console.error('[forgot-password] SMTP verification failed:', verifyError);
            // Still save the token, but log the error
            return res.status(200).json({ 
                message: 'If an account exists, you will receive an email with instructions',
                warning: 'SMTP verification failed - email not sent'
            });
        }

        // Send email
        try {
            const mailInfo = await transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: user.email, // Now TypeScript knows this is a non-null string
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
            console.log('[forgot-password] E-Mail erfolgreich versendet:', mailInfo.messageId);
        } catch (mailError) {
            console.error('[forgot-password] Fehler beim Versenden der E-Mail:', mailError);
            // Still return success to user (security best practice)
            // But log the error for debugging
        }

        res.status(200).json({ message: 'If an account exists, you will receive an email with instructions' });
    } catch (error) {
        console.error('[forgot-password] Password reset error:', error);
        res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
    }
} 