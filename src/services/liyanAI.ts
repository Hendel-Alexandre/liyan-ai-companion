import { supabase } from '@/lib/supabaseClient';

export interface AskResult {
    text: string;
    providerUsed: string;
}

const SYSTEM_PROMPT_HINT = 'See chat-completion edge function for the full server-side prompt.';

const CONFIGURED = !!import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

/* ─── Main AI call via Supabase Edge Function ─── */
export async function askLiyan(
    message: string,
    history: { role: 'user' | 'assistant'; content: string }[] = [],
): Promise<AskResult> {
    if (!CONFIGURED) {
        return {
            text: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local, then restart the dev server.',
            providerUsed: 'none',
        };
    }

    const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
            message,
            history: history.slice(-8),
            primary_provider: import.meta.env.VITE_PRIMARY_AI_PROVIDER || 'claude',
        },
    });

    if (error) throw new Error(error.message || 'Edge function error');
    if (data?.error) throw new Error(data.error);

    return {
        text: data.text ?? 'I could not generate a response.',
        providerUsed: data.provider_used ?? 'unknown',
    };
}

/* ─── Text-to-Speech (browser native) ─── */
export function speakText(
    text: string,
    rate = 1.0,
    gender: 'feminine' | 'masculine' = 'feminine',
) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const applyVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const femNames = ['Samantha', 'Karen', 'Victoria', 'Fiona', 'Moira', 'Joanna', 'Salli', 'Aria'];
        const masNames = ['Daniel', 'Alex', 'Gordon', 'Bruce', 'Matthew', 'Brian', 'Liam'];
        const preferred = voices.find(v =>
            gender === 'feminine'
                ? femNames.some(n => v.name.includes(n))
                : masNames.some(n => v.name.includes(n)),
        ) ?? voices.find(v => v.lang.startsWith('en'));
        if (preferred) utterance.voice = preferred;
        window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) applyVoice();
    else {
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.onvoiceschanged = null;
            applyVoice();
        };
    }
}

/* ─── Speech-to-Text (browser native) ─── */
export function startVoiceInput(
    onTranscript: (text: string) => void,
    onEnd: () => void,
): () => void {
    const SR =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

    if (!SR) { onEnd(); return () => { }; }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e: any) => {
        const transcript = Array.from(e.results as any[])
            .map((r: any) => r[0].transcript)
            .join('');
        onTranscript(transcript);
    };
    recognition.onend = onEnd;
    recognition.onerror = onEnd;
    recognition.start();

    return () => recognition.stop();
}
