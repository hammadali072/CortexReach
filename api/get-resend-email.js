// api/get-resend-email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Email ID is required' });
    }

    try {
        const { data, error } = await resend.emails.get(id);

        if (error) {
            console.error('[Resend API Error]:', error);
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ success: true, email: data });
    } catch (err) {
        console.error('[get-resend-email] unexpected error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
