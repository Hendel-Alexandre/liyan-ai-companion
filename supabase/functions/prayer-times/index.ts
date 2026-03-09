import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const url = new URL(req.url);
        const lat = url.searchParams.get('lat');
        const lon = url.searchParams.get('lon');
        const city = url.searchParams.get('city');
        const country = url.searchParams.get('country');

        let aladhanUrl: string;
        if (lat && lon) {
            aladhanUrl = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`;
        } else if (city && country) {
            aladhanUrl = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`;
        } else {
            // Default to Mecca
            aladhanUrl = 'https://api.aladhan.com/v1/timingsByCity?city=Mecca&country=SA&method=2';
        }

        const res = await fetch(aladhanUrl, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) throw new Error(`Aladhan API error ${res.status}`);

        const json: any = await res.json();
        const { timings, date } = json.data;

        const result = {
            timings: {
                Fajr: timings.Fajr,
                Sunrise: timings.Sunrise,
                Dhuhr: timings.Dhuhr,
                Asr: timings.Asr,
                Maghrib: timings.Maghrib,
                Isha: timings.Isha,
                Midnight: timings.Midnight,
            },
            hijri: date.hijri,
            gregorian: date.gregorian,
            location: city && country ? `${city}, ${country}` : lat && lon ? `${Number(lat).toFixed(2)}, ${Number(lon).toFixed(2)}` : 'Mecca',
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
