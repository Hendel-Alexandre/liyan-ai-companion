import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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

// ── Claude ────────────────────────────────────────────────
async function askClaude(message: string, history: HistoryMsg[]): Promise<string> {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
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

// ── OpenAI ────────────────────────────────────────────────
async function askOpenAI(message: string, history: HistoryMsg[]): Promise<string> {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
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

// ── Gemini ────────────────────────────────────────────────
async function askGemini(message: string, history: HistoryMsg[]): Promise<string> {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');
    const contents = [
        ...history.slice(-8).map(m => ({
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

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        // Authenticate
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!,
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const { message, history = [], primary_provider = 'claude' } = await req.json();

        const order = [primary_provider, ...Object.keys(PROVIDERS).filter(p => p !== primary_provider)];
        const errors: string[] = [];

        for (const providerName of order) {
            const fn = PROVIDERS[providerName];
            if (!fn) continue;
            try {
                const text = await fn(message, history);
                const result = { text, provider_used: providerName, user_id: user.id };
                return new Response(JSON.stringify(result), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            } catch (err: any) {
                const msg = err?.message || String(err);
                console.warn(`[chat-completion] ${providerName} failed: ${msg}`);
                errors.push(`${providerName}: ${msg}`);
            }
        }

        return new Response(
            JSON.stringify({ error: 'All AI providers failed', details: errors }),
            { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
