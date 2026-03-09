import { RecognitionResult } from './types';

/** Simulates a Quran recognition API call with a 2-second delay */
export async function recognizeQuran(audioBlob?: Blob): Promise<RecognitionResult> {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 2200));

    // Mock: 70% chance of match, 30% no match (for demo)
    const matched = Math.random() > 0.3;

    if (!matched) {
        return { found: false };
    }

    // Return a mock match
    const MOCK_MATCHES: RecognitionResult[] = [
        {
            found: true,
            surahName: 'Al-Fatiha',
            surahNumber: 1,
            ayahNumber: 1,
            reciter: 'Sheikh Mishary al-Afasy',
            arabic: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ',
            transliteration: 'Bismillāhi r-raḥmāni r-raḥīm',
            translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
            confidence: 0.91,
        },
        {
            found: true,
            surahName: 'Al-Ikhlas',
            surahNumber: 112,
            ayahNumber: 1,
            reciter: 'Sheikh Abdul Rahman Al-Sudais',
            arabic: 'قُلۡ هُوَ ٱللَّهُ أَحَدٌ',
            transliteration: 'Qul huwallāhu aḥad',
            translation: 'Say: He is Allah, [who is] One',
            confidence: 0.87,
        },
        {
            found: true,
            surahName: 'Al-Baqarah',
            surahNumber: 2,
            ayahNumber: 255,
            reciter: "Sheikh Sa'd al-Ghamdi",
            arabic: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلۡحَيُّ ٱلۡقَيُّومُ',
            transliteration: 'Allāhu lā ilāha illā huwal-ḥayyul-qayyūm',
            translation: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.',
            confidence: 0.94,
        },
    ];

    return MOCK_MATCHES[Math.floor(Math.random() * MOCK_MATCHES.length)];
}

/**
 * Future: swap this mock implementation for a real API call, e.g.:
 * const formData = new FormData();
 * formData.append('audio', audioBlob);
 * const res = await fetch('https://api.quran-recognition.com/identify', {
 *   method: 'POST', body: formData, headers: { 'Authorization': `Bearer ${API_KEY}` }
 * });
 */
