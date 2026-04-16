// api/get-resend-emails.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Fetch the list of emails from Resend
        // We'll fetch the most recent 100 emails
        const { data, error } = await resend.emails.list({ limit: 100 });

        if (error) {
            console.error('[Resend API Error]:', error);
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ success: true, emails: data?.data || [] });
    } catch (err) {
        console.error('[get-resend-emails] unexpected error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
