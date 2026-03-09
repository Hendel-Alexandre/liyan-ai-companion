import { api } from '@/lib/api';
import { RecognitionResult } from './types';

export async function recognizeQuran(_audioBlob?: Blob): Promise<RecognitionResult> {
    return { found: false };
}

export async function recognizeQuranFromText(transcript: string): Promise<RecognitionResult> {
    try {
        const data = await api.islamic.quranRecognition(transcript);
        return {
            found: data.found ?? false,
            surahNumber: data.surah_number,
            ayahNumber: data.ayah_number,
            arabic: data.arabic,
            transliteration: data.transliteration,
            translation: data.translation,
            confidence: data.match_confidence,
        };
    } catch {
        return { found: false };
    }
}
