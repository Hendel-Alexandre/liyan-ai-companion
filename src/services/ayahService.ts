import { api } from '@/lib/api';

export interface Ayah {
    surahName: string;
    surahNumber: number;
    ayahNumber: number;
    arabic: string;
    transliteration: string;
    translation: string;
    reference: string;
}

const AYAHS: Ayah[] = [
    { surahName: 'Al-Baqarah', surahNumber: 2, ayahNumber: 286, arabic: 'لَا يُكَلِّفُ ٱللَّهُ نَفۡسًا إِلَّا وُسۡعَهَا', transliteration: '', translation: 'Allah does not burden a soul beyond that it can bear.', reference: 'Al-Baqarah 2:286' },
    { surahName: 'Al-Inshirah', surahNumber: 94, ayahNumber: 6, arabic: 'إِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرًا', transliteration: '', translation: 'Indeed, with hardship will be ease.', reference: 'Al-Inshirah 94:6' },
    { surahName: "Ar-Ra'd", surahNumber: 13, ayahNumber: 28, arabic: 'أَلَا بِذِكۡرِ ٱللَّهِ تَطۡمَئِنُّ ٱلۡقُلُوبُ', transliteration: '', translation: 'Verily, in the remembrance of Allah do hearts find rest.', reference: "Ar-Ra'd 13:28" },
    { surahName: 'Al-Hadid', surahNumber: 57, ayahNumber: 4, arabic: 'وَهُوَ مَعَكُمۡ أَيۡنَ مَا كُنتُمۡ', transliteration: '', translation: 'And He is with you wherever you are.', reference: 'Al-Hadid 57:4' },
    { surahName: 'Al-Talaq', surahNumber: 65, ayahNumber: 3, arabic: 'وَمَن يَتَوَكَّلۡ عَلَى ٱللَّهِ فَهُوَ حَسۡبُهُۥٓ', transliteration: '', translation: 'Whoever relies upon Allah — then He is sufficient for him.', reference: 'Al-Talaq 65:3' },
];

function dayIndex() {
    const start = new Date(new Date().getFullYear(), 0, 0);
    return Math.floor((Date.now() - start.getTime()) / 86400000);
}

const CACHE_KEY = 'liyan_daily_ayah';

export async function getDailyAyah(): Promise<Ayah> {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
            const c = JSON.parse(raw);
            if (c.date === new Date().toISOString().split('T')[0]) return c.ayah;
        }
    } catch { }

    try {
        const data = await api.islamic.dailyAyah();
        const ayah: Ayah = {
            surahName: data.reference_label?.split(' ')[0] ?? '',
            surahNumber: data.surah_number,
            ayahNumber: data.ayah_number,
            arabic: data.arabic_text,
            transliteration: '',
            translation: data.translation,
            reference: data.reference_label,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify({ date: new Date().toISOString().split('T')[0], ayah }));
        return ayah;
    } catch {
        return AYAHS[dayIndex() % AYAHS.length];
    }
}

export function getDailyAyahSync(): Ayah {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
            const c = JSON.parse(raw);
            if (c.date === new Date().toISOString().split('T')[0]) return c.ayah;
        }
    } catch { }
    return AYAHS[dayIndex() % AYAHS.length];
}

export function getAllAyahs(): Ayah[] { return AYAHS; }
