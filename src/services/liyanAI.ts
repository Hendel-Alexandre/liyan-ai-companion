import { api } from '@/lib/api';

export interface AskResult {
    text: string;
    providerUsed: string;
}

export async function askLiyan(
    message: string,
    history: { role: 'user' | 'assistant'; content: string }[] = [],
): Promise<AskResult> {
    const data = await api.chat.completion(message, history);
    return {
        text: data.text ?? 'I could not generate a response.',
        providerUsed: data.provider_used ?? 'unknown',
    };
}

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
