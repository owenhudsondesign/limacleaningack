/**
 * Contact Form API Endpoint
 * Handles form submissions and sends emails via Resend
 *
 * Deployment: This works as a serverless function on Vercel, Netlify, etc.
 *
 * Environment Variables Required:
 * - RESEND_API_KEY: Your Resend API key
 * - CONTACT_EMAIL: The email address to receive form submissions
 */

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { to, from, subject, replyTo, html } = req.body;

        // Validate required fields
        if (!subject || !html) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get API key and recipient from environment variables
        const apiKey = process.env.RESEND_API_KEY;
        const recipientEmail = process.env.CONTACT_EMAIL || to;

        if (!apiKey) {
            console.error('RESEND_API_KEY environment variable is not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Build email payload
        const emailPayload = {
            from: 'Lima Cleaning Service <noreply@mail.acksites.com>',
            to: [recipientEmail],
            subject: subject,
            html: html,
        };

        // Only add reply_to if provided
        if (replyTo) {
            emailPayload.reply_to = replyTo;
        }

        // Send email via Resend API
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Resend API error:', data);
            return res.status(response.status).json({
                error: 'Failed to send email',
                details: data.message || 'Unknown error'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            id: data.id
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
