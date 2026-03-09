import { supabase } from '@/lib/supabaseClient';
import type { Dua } from './types';

const DUAS: Dua[] = [
    { id: 'morning', title: 'Morning Dua', arabic: 'أَصۡبَحۡنَا وَأَصۡبَحَ ٱلۡمُلۡكُ لِلَّهِ', transliteration: 'Aṣbaḥnā wa-aṣbaḥal-mulku lillāh', translation: 'We have entered the morning and the dominion belongs to Allah.', reference: 'Abu Dawud 5076', occasion: 'Morning' },
    { id: 'waking', title: 'Upon Waking', arabic: 'ٱلۡحَمۡدُ لِلَّهِ ٱلَّذِي أَحۡيَانَا', transliteration: 'Alḥamdu lillāhilladhī aḥyānā', translation: 'All praise is for Allah who gave us life after causing us to die.', reference: 'Bukhari 6312', occasion: 'Morning' },
    { id: 'anxiety', title: 'For Anxiety', arabic: 'ٱللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ ٱلۡهَمِّ وَٱلۡحَزَنِ', transliteration: 'Allāhumma innī aʿūdhu bika minal-hammi walḥazan', translation: 'O Allah, I seek refuge in You from worry and grief.', reference: 'Bukhari 6369', occasion: 'Distress' },
    { id: 'hardship', title: 'In Hardship', arabic: 'إِنَّا لِلَّهِ وَإِنَّآ إِلَيۡهِ رَٰجِعُونَ', transliteration: 'Innā lillāhi wa-innā ilayhi rājiʿūn', translation: 'Indeed we belong to Allah, and indeed to Him we will return.', reference: 'Al-Baqarah 2:156', occasion: 'Difficulty' },
    { id: 'sleep', title: 'Before Sleeping', arabic: 'بِاسۡمِكَ ٱللَّهُمَّ أَمُوتُ وَأَحۡيَا', transliteration: 'Bismika Allāhumma amūtu wa-aḥyā', translation: 'In Your name, O Allah, I die and I live.', reference: 'Bukhari 6324', occasion: 'Night' },
    { id: 'forgiveness', title: 'Seeking Forgiveness', arabic: 'أَسۡتَغۡفِرُ ٱللَّهَ الۡعَظِيمَ', transliteration: 'Astaghfirullāhal-ʿaẓīm', translation: 'I seek forgiveness from Allah, the Magnificent.', reference: 'Tirmidhi 3577', occasion: 'Repentance' },
    { id: 'knowledge', title: 'Prayer for Knowledge', arabic: 'رَّبِّ زِدۡنِي عِلۡمًا', transliteration: 'Rabbi zidnī ʿilmā', translation: 'My Lord, increase me in knowledge.', reference: 'Ta Ha 20:114', occasion: 'Learning' },
];

const CACHE_KEY = 'liyan_daily_dua';

function dayIndex() {
    const start = new Date(new Date().getFullYear(), 0, 0);
    return Math.floor((Date.now() - start.getTime()) / 86400000);
}

const CONFIGURED = !!import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

export async function getDailyDua(): Promise<Dua> {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
            const c = JSON.parse(raw);
            if (c.date === new Date().toISOString().split('T')[0]) return c.dua;
        }
    } catch { }

    if (!CONFIGURED) return DUAS[dayIndex() % DUAS.length];

    try {
        const { data, error } = await supabase.functions.invoke('daily-dua');
        if (error || !data) throw new Error('edge fn failed');
        const dua: Dua = {
            id: 'daily',
            title: data.title,
            arabic: data.arabic_text,
            transliteration: data.transliteration ?? '',
            translation: data.translation,
            reference: data.source_label,
            occasion: '',
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify({ date: new Date().toISOString().split('T')[0], dua }));
        return dua;
    } catch {
        return DUAS[dayIndex() % DUAS.length];
    }
}

export function getDailyDuaSync(): Dua {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
            const c = JSON.parse(raw);
            if (c.date === new Date().toISOString().split('T')[0]) return c.dua;
        }
    } catch { }
    return DUAS[dayIndex() % DUAS.length];
}

export function getAllDuas(): Dua[] { return DUAS; }
export function getDuaById(id: string): Dua | undefined { return DUAS.find(d => d.id === id); }
