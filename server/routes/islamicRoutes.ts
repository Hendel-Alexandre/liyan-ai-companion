import { Router, Request, Response } from 'express';
import pool from '../db.js';

const router = Router();

const FALLBACK_AYAHS = [
    { surah_number: 2, ayah_number: 286, arabic_text: 'لَا يُكَلِّفُ ٱللَّهُ نَفۡسًا إِلَّا وُسۡعَهَا', translation: 'Allah does not burden a soul beyond that it can bear.', reference_label: 'Al-Baqarah 2:286' },
    { surah_number: 94, ayah_number: 6, arabic_text: 'إِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرًا', translation: 'Indeed, with hardship will be ease.', reference_label: 'Al-Inshirah 94:6' },
    { surah_number: 13, ayah_number: 28, arabic_text: 'أَلَا بِذِكۡرِ ٱللَّهِ تَطۡمَئِنُّ ٱلۡقُلُوبُ', translation: 'Verily, in the remembrance of Allah do hearts find rest.', reference_label: "Ar-Ra'd 13:28" },
    { surah_number: 57, ayah_number: 4, arabic_text: 'وَهُوَ مَعَكُمۡ أَيۡنَ مَا كُنتُمۡ', translation: 'And He is with you wherever you are.', reference_label: 'Al-Hadid 57:4' },
    { surah_number: 65, ayah_number: 3, arabic_text: 'وَمَن يَتَوَكَّلۡ عَلَى ٱللَّهِ فَهُوَ حَسۡبُهُۥٓ', translation: 'Whoever relies upon Allah — then He is sufficient for him.', reference_label: 'Al-Talaq 65:3' },
];

const DUAS = [
    { title: 'Morning Dua', arabic_text: 'أَصۡبَحۡنَا وَأَصۡبَحَ ٱلۡمُلۡكُ لِلَّهِ وَٱلۡحَمۡدُ لِلَّهِ', transliteration: 'Aṣbaḥnā wa-aṣbaḥal-mulku lillāhi walḥamdu lillāh', translation: 'We have entered the morning and the dominion belongs to Allah, and all praise is for Allah.', source_label: 'Abu Dawud 5076' },
    { title: 'Upon Waking', arabic_text: 'ٱلۡحَمۡدُ لِلَّهِ ٱلَّذِي أَحۡيَانَا بَعۡدَ مَا أَمَاتَنَا وَإِلَيۡهِ ٱلنُّشُورُ', transliteration: 'Alḥamdu lillāhilladhī aḥyānā baʿda mā amātanā wa-ilayhin-nushūr', translation: 'All praise is for Allah who gave us life after causing us to die.', source_label: 'Bukhari 6312' },
    { title: 'For Anxiety', arabic_text: 'ٱللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ ٱلۡهَمِّ وَٱلۡحَزَنِ', transliteration: 'Allāhumma innī aʿūdhu bika minal-hammi walḥazan', translation: 'O Allah, I seek refuge in You from worry and grief.', source_label: 'Bukhari 6369' },
    { title: 'In Hardship', arabic_text: 'إِنَّا لِلَّهِ وَإِنَّآ إِلَيۡهِ رَٰجِعُونَ', transliteration: 'Innā lillāhi wa-innā ilayhi rājiʿūn', translation: 'Indeed we belong to Allah, and indeed to Him we will return.', source_label: 'Al-Baqarah 2:156' },
    { title: 'Before Sleeping', arabic_text: 'بِاسۡمِكَ ٱللَّهُمَّ أَمُوتُ وَأَحۡيَا', transliteration: 'Bismika Allāhumma amūtu wa-aḥyā', translation: 'In Your name, O Allah, I die and I live.', source_label: 'Bukhari 6324' },
    { title: 'Seeking Forgiveness', arabic_text: 'أَسۡتَغۡفِرُ ٱللَّهَ الۡعَظِيمَ', transliteration: 'Astaghfirullāhal-ʿaẓīm', translation: 'I seek forgiveness from Allah, the Magnificent.', source_label: 'Tirmidhi 3577' },
    { title: 'Prayer for Knowledge', arabic_text: 'رَّبِّ زِدۡنِي عِلۡمًا', transliteration: 'Rabbi zidnī ʿilmā', translation: 'My Lord, increase me in knowledge.', source_label: 'Ta Ha 20:114' },
    { title: 'Dua al-Istikhara', arabic_text: 'ٱللَّهُمَّ إِنِّي أَسۡتَخِيرُكَ بِعِلۡمِكَ', transliteration: 'Allāhumma innī astakhīruka biʿilmik', translation: 'O Allah, I seek Your counsel through Your knowledge.', source_label: 'Bukhari 6382' },
    { title: 'Dua for Travel', arabic_text: 'سُبۡحَٰنَ ٱلَّذِي سَخَّرَ لَنَا هَٰذَا', transliteration: 'Subḥānalladhī sakhkhara lanā hādhā', translation: 'Glory be to the One who has subjected this to us.', source_label: 'Az-Zukhruf 43:13' },
];

const VERSE_CORPUS = [
    { surah_number: 1, ayah_number: 1, surah_name_en: 'Al-Fatiha', arabic: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ', transliteration: 'Bismillahi r-rahmani r-raheem', translation: 'In the name of Allah, the Most Gracious, the Most Merciful' },
    { surah_number: 2, ayah_number: 255, surah_name_en: 'Al-Baqarah', arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', transliteration: 'Allahu la ilaha illa huwal hayyul qayyum', translation: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.' },
    { surah_number: 112, ayah_number: 1, surah_name_en: 'Al-Ikhlas', arabic: 'قُلۡ هُوَ ٱللَّهُ أَحَدٌ', transliteration: 'Qul huwallahu ahad', translation: 'Say: He is Allah, who is One' },
    { surah_number: 114, ayah_number: 1, surah_name_en: 'An-Nas', arabic: 'قُلۡ أَعُوذُ بِرَبِّ ٱلنَّاسِ', transliteration: 'Qul audhu bi-rabbin-nas', translation: 'Say: I seek refuge in the Lord of mankind' },
    { surah_number: 113, ayah_number: 1, surah_name_en: 'Al-Falaq', arabic: 'قُلۡ أَعُوذُ بِرَبِّ ٱلۡفَلَقِ', transliteration: 'Qul audhu bi-rabbil-falaq', translation: 'Say: I seek refuge in the Lord of daybreak' },
];

function dayIndex() {
    const start = new Date(new Date().getFullYear(), 0, 0);
    return Math.floor((Date.now() - start.getTime()) / 86400000);
}

function similarity(a: string, b: string): number {
    const s1 = a.toLowerCase().replace(/[^\w\s]/g, '');
    const s2 = b.toLowerCase().replace(/[^\w\s]/g, '');
    const words1 = new Set(s1.split(/\s+/));
    const words2 = s2.split(/\s+/);
    const matches = words2.filter((w: string) => words1.has(w)).length;
    return matches / Math.max(words1.size, words2.length, 1);
}

router.get('/daily-ayah', async (req: Request, res: Response) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const cached = await pool.query(
            `SELECT * FROM daily_ayah_cache WHERE cache_date = $1`, [today]
        );
        if (cached.rows[0]) {
            res.json(cached.rows[0]);
            return;
        }

        const pool2 = FALLBACK_AYAHS[dayIndex() % FALLBACK_AYAHS.length];
        let ayahData = { ...pool2 };

        try {
            const apiRes = await fetch(
                `https://api.alquran.cloud/v1/ayah/${pool2.surah_number}:${pool2.ayah_number}/en.sahih`,
                { signal: AbortSignal.timeout(5000) }
            );
            if (apiRes.ok) {
                const json: any = await apiRes.json();
                const a = json?.data;
                if (a) {
                    ayahData = {
                        surah_number: a.surah?.number ?? pool2.surah_number,
                        ayah_number: a.numberInSurah ?? pool2.ayah_number,
                        arabic_text: pool2.arabic_text,
                        translation: a.text ?? pool2.translation,
                        reference_label: `${a.surah?.englishName ?? ''} ${a.surah?.number ?? ''}:${a.numberInSurah ?? ''}`,
                    };
                }
            }
        } catch (e) {
            console.warn('[daily-ayah] API fetch failed, using fallback');
        }

        try {
            const inserted = await pool.query(
                `INSERT INTO daily_ayah_cache (cache_date, surah_number, ayah_number, arabic_text, translation, reference_label)
                 VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (cache_date) DO NOTHING RETURNING *`,
                [today, ayahData.surah_number, ayahData.ayah_number, ayahData.arabic_text, ayahData.translation, ayahData.reference_label]
            );
            res.json(inserted.rows[0] || { cache_date: today, ...ayahData });
        } catch {
            res.json({ cache_date: today, ...ayahData });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/daily-dua', async (req: Request, res: Response) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const cached = await pool.query(
            `SELECT * FROM daily_dua_cache WHERE cache_date = $1`, [today]
        );
        if (cached.rows[0]) {
            res.json(cached.rows[0]);
            return;
        }

        const dua = DUAS[dayIndex() % DUAS.length];
        try {
            const inserted = await pool.query(
                `INSERT INTO daily_dua_cache (cache_date, title, arabic_text, transliteration, translation, source_label)
                 VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (cache_date) DO NOTHING RETURNING *`,
                [today, dua.title, dua.arabic_text, dua.transliteration, dua.translation, dua.source_label]
            );
            res.json(inserted.rows[0] || { cache_date: today, ...dua });
        } catch {
            res.json({ cache_date: today, ...dua });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/prayer-times', async (req: Request, res: Response) => {
    const { lat, lon, city, country } = req.query as Record<string, string>;
    try {
        let aladhanUrl: string;
        if (lat && lon) {
            aladhanUrl = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`;
        } else if (city && country) {
            aladhanUrl = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`;
        } else {
            aladhanUrl = 'https://api.aladhan.com/v1/timingsByCity?city=Mecca&country=SA&method=2';
        }

        const apiRes = await fetch(aladhanUrl, { signal: AbortSignal.timeout(10000) });
        if (!apiRes.ok) throw new Error(`Aladhan API error ${apiRes.status}`);

        const json: any = await apiRes.json();
        const { timings, date } = json.data;

        res.json({
            timings: {
                Fajr: timings.Fajr, Sunrise: timings.Sunrise, Dhuhr: timings.Dhuhr,
                Asr: timings.Asr, Maghrib: timings.Maghrib, Isha: timings.Isha, Midnight: timings.Midnight,
            },
            hijri: date.hijri,
            gregorian: date.gregorian,
            location: city && country ? `${city}, ${country}` : lat && lon ? `${Number(lat).toFixed(2)}, ${Number(lon).toFixed(2)}` : 'Mecca',
        });
    } catch (err: any) {
        res.status(502).json({ error: err.message });
    }
});

router.post('/quran-recognition', async (req: Request, res: Response) => {
    const { transcript } = req.body;
    if (!transcript) {
        res.status(400).json({ found: false, error: 'No transcript' });
        return;
    }

    let bestMatch: any = null;
    let bestScore = 0;

    for (const verse of VERSE_CORPUS) {
        const score = Math.max(
            similarity(transcript, verse.transliteration),
            similarity(transcript, verse.arabic),
            similarity(transcript, verse.translation)
        );
        if (score > bestScore) { bestScore = score; bestMatch = verse; }
    }

    const found = bestScore > 0.2;
    res.json({
        found,
        match_confidence: bestScore,
        ...(found ? {
            surah_number: bestMatch.surah_number,
            ayah_number: bestMatch.ayah_number,
            surah_name_en: bestMatch.surah_name_en,
            arabic: bestMatch.arabic,
            transliteration: bestMatch.transliteration,
            translation: bestMatch.translation,
        } : {}),
    });
});

export default router;
