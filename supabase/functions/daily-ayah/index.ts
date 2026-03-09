import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Curated ayah pool for fallback (day-seeded)
const FALLBACK_POOL = [
    { surah_number: 2, ayah_number: 286, arabic_text: 'لَا يُكَلِّفُ ٱللَّهُ نَفۡسًا إِلَّا وُسۡعَهَا', translation: 'Allah does not burden a soul beyond that it can bear.', reference_label: 'Al-Baqarah 2:286' },
    { surah_number: 94, ayah_number: 6, arabic_text: 'إِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرًا', translation: 'Indeed, with hardship will be ease.', reference_label: 'Al-Inshirah 94:6' },
    { surah_number: 13, ayah_number: 28, arabic_text: 'أَلَا بِذِكۡرِ ٱللَّهِ تَطۡمَئِنُّ ٱلۡقُلُوبُ', translation: 'Verily, in the remembrance of Allah do hearts find rest.', reference_label: "Ar-Ra'd 13:28" },
    { surah_number: 57, ayah_number: 4, arabic_text: 'وَهُوَ مَعَكُمۡ أَيۡنَ مَا كُنتُمۡ', translation: 'And He is with you wherever you are.', reference_label: 'Al-Hadid 57:4' },
    { surah_number: 65, ayah_number: 3, arabic_text: 'وَمَن يَتَوَكَّلۡ عَلَى ٱللَّهِ فَهُوَ حَسۡبُهُۥٓ', translation: 'Whoever relies upon Allah — then He is sufficient for him.', reference_label: 'Al-Talaq 65:3' },
];

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const today = new Date().toISOString().split('T')[0];

        // Check cache first
        const { data: cached } = await supabase
            .from('daily_ayah_cache')
            .select('*')
            .eq('cache_date', today)
            .maybeSingle();

        if (cached) {
            return new Response(JSON.stringify(cached), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Fetch from alquran.cloud API
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const pool = FALLBACK_POOL[dayOfYear % FALLBACK_POOL.length];

        let ayahData = pool;
        try {
            const apiRes = await fetch(
                `https://api.alquran.cloud/v1/ayah/${pool.surah_number}:${pool.ayah_number}/en.sahih`,
                { signal: AbortSignal.timeout(5000) }
            );
            if (apiRes.ok) {
                const json: any = await apiRes.json();
                const a = json?.data;
                if (a) {
                    ayahData = {
                        surah_number: a.surah?.number ?? pool.surah_number,
                        ayah_number: a.numberInSurah ?? pool.ayah_number,
                        arabic_text: pool.arabic_text,
                        translation: a.text ?? pool.translation,
                        reference_label: `${a.surah?.englishName ?? ''} ${a.surah?.number ?? ''}:${a.numberInSurah ?? ''}`,
                    };
                }
            }
        } catch (e) {
            console.warn('[daily-ayah] API fetch failed, using fallback:', e);
        }

        // Insert to cache
        const { data: inserted, error: insertErr } = await supabase
            .from('daily_ayah_cache')
            .insert({ cache_date: today, ...ayahData })
            .select('*')
            .single();

        const result = insertErr ? { cache_date: today, ...ayahData } : inserted;

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
