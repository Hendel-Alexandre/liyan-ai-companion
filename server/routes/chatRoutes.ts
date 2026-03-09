import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth.js';
import pool from '../db.js';

const router = Router();

const SYSTEM_PROMPT = `You are Liyan AI, a calm, knowledgeable, and compassionate Islamic companion. You help Muslims with questions about prayer, Quran, duas, Islamic history, fiqh, and spiritual guidance.

Conduct rules:
- Answer warmly, clearly, and concisely (2–5 sentences for simple questions)
- Cite Quran (Surah Name, chapter:verse) or hadith source when relevant
- Acknowledge scholarly differences on debated matters; do not give one-sided fatwas
- Never invent, fabricate, or confuse Quran verses or hadith — if unsure, say so honestly
- Never engage in takfir
- Decline gently but firmly: political extremism, explicit content, hate speech, sectarian attacks
- Never be romantic or flirtatious
- Always encourage consulting a qualified local scholar for personal legal rulings
- Begin responses directly — no preamble like "Certainly!" or "Great question!"`;

type Role = 'user' | 'assistant';
type HistoryMsg = { role: Role; content: string };

async function askClaude(message: string, history: HistoryMsg[]): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');
    const messages = [...history.slice(-8), { role: 'user', content: message }];
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 700, system: SYSTEM_PROMPT, messages }),
        signal: AbortSignal.timeout(18000),
    });
    if (!res.ok) {
        const err: any = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Claude ${res.status}`);
    }
    const data: any = await res.json();
    return data.content?.[0]?.text || 'No response.';
}

async function askOpenAI(message: string, history: HistoryMsg[]): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not set');
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-8),
        { role: 'user', content: message },
    ];
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 700, messages }),
        signal: AbortSignal.timeout(18000),
    });
    if (!res.ok) {
        const err: any = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `OpenAI ${res.status}`);
    }
    const data: any = await res.json();
    return data.choices?.[0]?.message?.content || 'No response.';
}

async function askGemini(message: string, history: HistoryMsg[]): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');
    const contents = [
        ...history.slice(-8).map((m: HistoryMsg) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        })),
        { role: 'user', parts: [{ text: message }] },
    ];
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents,
                generationConfig: { maxOutputTokens: 700 },
            }),
            signal: AbortSignal.timeout(18000),
        }
    );
    if (!res.ok) {
        const err: any = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Gemini ${res.status}`);
    }
    const data: any = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
}

type ProviderFn = (msg: string, hist: HistoryMsg[]) => Promise<string>;
const PROVIDERS: Record<string, ProviderFn> = {
    claude: askClaude, openai: askOpenAI, gemini: askGemini,
};

router.post('/completion', requireAuth, async (req: Request, res: Response) => {
    const { message, history = [], primary_provider = 'claude' } = req.body;
    if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
    }

    const order = [primary_provider, ...Object.keys(PROVIDERS).filter(p => p !== primary_provider)];
    const errors: string[] = [];

    for (const providerName of order) {
        const fn = PROVIDERS[providerName];
        if (!fn) continue;
        try {
            const text = await fn(message, history);
            res.json({ text, provider_used: providerName });
            return;
        } catch (err: any) {
            const msg = err?.message || String(err);
            console.warn(`[chat] ${providerName} failed: ${msg}`);
            errors.push(`${providerName}: ${msg}`);
        }
    }

    res.status(502).json({ error: 'All AI providers failed', details: errors });
});

router.get('/conversations', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    try {
        const result = await pool.query(
            `SELECT * FROM conversations WHERE user_id = $1 ORDER BY last_message_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('[chat/conversations GET]', err);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

router.post('/conversations', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const { title = 'New conversation' } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *`,
            [userId, title]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[chat/conversations POST]', err);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

router.patch('/conversations/:id', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const { id } = req.params;
    const { title, provider_last_used } = req.body;
    try {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;
        if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
        if (provider_last_used !== undefined) { fields.push(`provider_last_used = $${idx++}`); values.push(provider_last_used); }
        fields.push(`last_message_at = NOW()`);
        fields.push(`updated_at = NOW()`);
        values.push(id, userId);
        if (fields.length > 2) {
            await pool.query(
                `UPDATE conversations SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1}`,
                values
            );
        }
        res.json({ ok: true });
    } catch (err) {
        console.error('[chat/conversations PATCH]', err);
        res.status(500).json({ error: 'Failed to update conversation' });
    }
});

router.delete('/conversations/:id', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const { id } = req.params;
    try {
        await pool.query(`DELETE FROM conversations WHERE id = $1 AND user_id = $2`, [id, userId]);
        res.json({ ok: true });
    } catch (err) {
        console.error('[chat/conversations DELETE]', err);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});

router.delete('/conversations', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    try {
        await pool.query(`DELETE FROM conversations WHERE user_id = $1`, [userId]);
        res.json({ ok: true });
    } catch (err) {
        console.error('[chat/conversations DELETE all]', err);
        res.status(500).json({ error: 'Failed to clear conversations' });
    }
});

router.get('/conversations/:id/messages', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM messages WHERE conversation_id = $1 AND user_id = $2 ORDER BY created_at ASC`,
            [id, userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('[chat/messages GET]', err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

router.post('/conversations/:id/messages', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const { id } = req.params;
    const { role, content, provider_used, metadata_json } = req.body;
    if (!role || !content) {
        res.status(400).json({ error: 'role and content are required' });
        return;
    }
    try {
        const result = await pool.query(
            `INSERT INTO messages (conversation_id, user_id, role, content, provider_used, metadata_json)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id, userId, role, content, provider_used || null, metadata_json || {}]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[chat/messages POST]', err);
        res.status(500).json({ error: 'Failed to insert message' });
    }
});

export default router;
