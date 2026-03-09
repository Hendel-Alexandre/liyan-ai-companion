import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const today = new Date().toISOString().split('T')[0];

        // Check cache
        const { data: cached } = await supabase
            .from('daily_dua_cache')
            .select('*')
            .eq('cache_date', today)
            .maybeSingle();

        if (cached) {
            return new Response(JSON.stringify(cached), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Day-seeded selection
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const dua = DUAS[dayOfYear % DUAS.length];

        // Cache it
        const { data: inserted, error: insertErr } = await supabase
            .from('daily_dua_cache')
            .insert({ cache_date: today, ...dua })
            .select('*')
            .single();

        const result = insertErr ? { cache_date: today, ...dua } : inserted;

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
