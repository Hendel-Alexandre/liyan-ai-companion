// ─── Shared data types across all services ───

export interface Ayah {
    surahName: string;
    surahNumber: number;
    ayahNumber: number;
    arabic: string;
    transliteration: string;
    translation: string;
    reference: string; // e.g. "Al-Baqarah 2:286"
}

export interface Dua {
    id: string;
    title: string;
    arabic: string;
    transliteration: string;
    translation: string;
    reference?: string;
    occasion?: string;
}

export interface QuizQuestion {
    id: string;
    prompt: string;
    subtitle?: string;
    choices: string[];
    correctIndex: number;
    explanation?: string;
    category: string;
}

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizResult {
    questions: QuizQuestion[];
    answers: (number | null)[];
    score: number;
    total: number;
}

export interface RecognitionResult {
    found: boolean;
    surahName?: string;
    surahNumber?: number;
    ayahNumber?: number;
    reciter?: string;
    arabic?: string;
    transliteration?: string;
    translation?: string;
    confidence?: number;
}

export interface ReciteItem {
    id: string;
    type: 'surah' | 'dua';
    title: string;
    arabicTitle: string;
    surahNumber?: number;
    verses: ReciteVerse[];
    description?: string;
}

export interface ReciteVerse {
    number: number;
    arabic: string;
    transliteration: string;
    translation: string;
    audioUrl?: string;
}

export interface PrayerCategory {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    steps?: PrayerStep[];
}

export interface PrayerStep {
    number: number;
    title: string;
    arabic?: string;
    transliteration?: string;
    description: string;
}

export type SaveableType = 'ayah' | 'dua' | 'chat' | 'recitation' | 'prayer' | 'recognition';
