import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Simplified verse corpus for fuzzy matching (expand as needed)
const VERSE_CORPUS = [
    { surah_number: 1, ayah_number: 1, surah_name_en: 'Al-Fatiha', arabic: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ', transliteration: 'Bismillahi r-rahmani r-raheem', translation: 'In the name of Allah, the Most Gracious, the Most Merciful' },
    { surah_number: 2, ayah_number: 255, surah_name_en: 'Al-Baqarah', arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', transliteration: 'Allahu la ilaha illa huwal hayyul qayyum', translation: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.' },
    { surah_number: 112, ayah_number: 1, surah_name_en: 'Al-Ikhlas', arabic: 'قُلۡ هُوَ ٱللَّهُ أَحَدٌ', transliteration: 'Qul huwallahu ahad', translation: 'Say: He is Allah, who is One' },
    { surah_number: 114, ayah_number: 1, surah_name_en: 'An-Nas', arabic: 'قُلۡ أَعُوذُ بِرَبِّ ٱلنَّاسِ', transliteration: 'Qul audhu bi-rabbin-nas', translation: 'Say: I seek refuge in the Lord of mankind' },
    { surah_number: 113, ayah_number: 1, surah_name_en: 'Al-Falaq', arabic: 'قُلۡ أَعُوذُ بِرَبِّ ٱلۡفَلَقِ', transliteration: 'Qul audhu bi-rabbil-falaq', translation: 'Say: I seek refuge in the Lord of daybreak' },
];

function similarity(a: string, b: string): number {
    const s1 = a.toLowerCase().replace(/[^\w\s]/g, '');
    const s2 = b.toLowerCase().replace(/[^\w\s]/g, '');
    const words1 = new Set(s1.split(/\s+/));
    const words2 = s2.split(/\s+/);
    const matches = words2.filter(w => words1.has(w)).length;
    return matches / Math.max(words1.size, words2.length, 1);
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        // Auth
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

        const { transcript } = await req.json();
        if (!transcript) {
            return new Response(JSON.stringify({ found: false, error: 'No transcript' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Fuzzy match against corpus
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
        const result = {
            found,
            match_confidence: bestScore,
            ...(found ? {
                surah_number: bestMatch!.surah_number,
                ayah_number: bestMatch!.ayah_number,
                surah_name_en: bestMatch!.surah_name_en,
                arabic: bestMatch!.arabic,
                transliteration: bestMatch!.transliteration,
                translation: bestMatch!.translation,
            } : {}),
        };

        // Store result in DB
        await supabase.from('quran_recognition_results').insert({
            user_id: user.id,
            transcript,
            match_confidence: bestScore,
            surah_number: found ? bestMatch!.surah_number : null,
            ayah_number: found ? bestMatch!.ayah_number : null,
            payload_json: result,
        });

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
