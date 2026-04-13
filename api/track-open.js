// api/track-open.js
// ─────────────────────────────────────────────────────────────────────────────
// Pixel-based open tracking endpoint
// Returns a 1x1 transparent GIF and records the open in Firebase.
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
}

const db = getDatabase();

// 1x1 transparent GIF
const PIXEL_GIF = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
);

// ── Known bot/scanner user-agent substrings ───────────────────────────────────
// Email security scanners, link checkers, and prefetch engines that
// automatically load images when processing email for delivery/spam checks.
const BOT_UA_PATTERNS = [
    // Email security scanners
    'barracuda', 'mimecast', 'proofpoint', 'ironport', 'messagelabs',
    'symantec', 'sophos', 'trend micro', 'cisco', 'forcepoint', 'fireeye',
    // Generic crawlers
    'spider', 'crawler', 'bot/', 'bot;', 'slurp', 'bingbot', 'googlebot',
    'facebookexternalhit',
    // Email client prefetch agents
    'yahoo pipes', 'feedburner', 'preview',
    // ESP infrastructure
    'resend', 'sendgrid', 'mailgun', 'postmarkapp',
    // Link safety checkers
    'safebrowsing', 'phishtank', 'urlscan', 'checkhost', 'validator',
    // Headless browsers used by scanners
    'headlesschrome', 'phantomjs', 'puppeteer', 'selenium',
];

const isBot = (userAgent) => {
    if (!userAgent) return true; // no UA = almost certainly a prefetcher
    const ua = userAgent.toLowerCase();
    return BOT_UA_PATTERNS.some(pattern => ua.includes(pattern));
};

// Resend's delivery pipeline and security scanners fire within 0–15 seconds.
// Real humans take at least 30 seconds between receiving and opening an email.
const MIN_OPEN_DELAY_MS = 1000; // 1 second for testing, normally 30s+ for production

const incrementStat = async (path, delta = 1) => {
    try {
        const ref = db.ref(path);
        const snap = await ref.get();
        const current = snap.exists() ? (snap.val() || 0) : 0;
        await ref.set(current + delta);
    } catch (err) {
        console.warn(`[track-open] Failed to increment stat at ${path}:`, err);
    }
};

export default async function handler(req, res) {
    // Always respond with the pixel immediately — never make the email client wait
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).end(PIXEL_GIF);

    const { sendId } = req.query;
    if (!sendId) return;

    const userAgent = req.headers['user-agent'] || '';
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';

    // 1. Filter known bots by user-agent string
    if (isBot(userAgent)) {
        console.log(`[track-open] Bot blocked — sendId: ${sendId} | UA: ${userAgent.slice(0, 80)}`);
        return;
    }

    try {
        const sendRef = db.ref(`email_sends/${sendId}`);
        const snap = await sendRef.get();

        if (!snap.exists()) {
            console.warn(`[track-open] No record — sendId: ${sendId}`);
            return;
        }

        const rec = snap.val();
        const now = Date.now();

        // 2. Filter opens that arrive too soon after sending
        const timeSinceSent = now - (rec.sentAt || 0);
        if (timeSinceSent < MIN_OPEN_DELAY_MS) {
            console.log(
                `[track-open] Too fast (${(timeSinceSent / 1000).toFixed(1)}s) — ` +
                `sendId: ${sendId} | UA: ${userAgent.slice(0, 60)}`
            );
            return;
        }

        const isFirstOpen = !rec.opened;

        await sendRef.update({
            opened: true,
            openCount: (rec.openCount || 0) + 1,
            firstOpenAt: isFirstOpen ? now : rec.firstOpenAt,
            lastOpenAt: now,
            lastOpenUA: userAgent.slice(0, 120),
            lastOpenIP: ip.split(',')[0].trim(),
        });

        if (isFirstOpen) {
            await db.ref(`leads/${rec.leadId}`).update({ status: 'opened' });
            await incrementStat(`projects/${rec.projectId}/stats/totalOpened`, 1);
            if (rec.campaignId) {
                await incrementStat(`campaigns/${rec.campaignId}/totalOpened`, 1);
            }
            console.log(
                `[track-open] ✓ First open — sendId: ${sendId} | ` +
                `lead: ${rec.leadId} | ${(timeSinceSent / 1000).toFixed(0)}s after send`
            );
        } else {
            console.log(`[track-open] Repeat open — sendId: ${sendId} | count: ${(rec.openCount || 0) + 1}`);
        }

    } catch (err) {
        console.error(`[track-open] Error — sendId: ${sendId}:`, err);
    }
}