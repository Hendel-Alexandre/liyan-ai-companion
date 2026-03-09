import { supabase } from '@/lib/supabaseClient';

export interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    Midnight: string;
}

export interface HijriDate {
    day: string;
    month: { en: string; ar: string; number: string };
    year: string;
}

export interface PrayerTimesResult {
    timings: PrayerTimes;
    hijri: HijriDate;
    date: string;
    location: string;
}





const CACHE_KEY = 'liyan_prayer_times';
const CONFIGURED = !!import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

function todayStr() { return new Date().toISOString().split('T')[0]; }

function loadCache(): PrayerTimesResult | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const cached: PrayerTimesResult = JSON.parse(raw);
        return cached.date === todayStr() ? cached : null;
    } catch { return null; }
}

function saveCache(data: PrayerTimesResult) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { }
}

async function invokeEdgeFunction(params: Record<string, string>): Promise<PrayerTimesResult> {
    const query = new URLSearchParams(params).toString();
    const { data, error } = await supabase.functions.invoke(`prayer-times?${query}`);
    if (error) throw new Error(error.message);

    const result: PrayerTimesResult = {
        timings: data.timings,
        hijri: {
            day: data.hijri?.day ?? '',
            month: data.hijri?.month ?? { en: '', ar: '', number: '' },
            year: data.hijri?.year ?? '',
        },
        date: todayStr(),
        location: data.location ?? 'Unknown',
    };
    return result;
}

async function directAladhan(params: Record<string, string>): Promise<PrayerTimesResult> {
    const isCity = params.city;
    const url = isCity
        ? `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(params.city)}&country=${encodeURIComponent(params.country ?? 'SA')}&method=2`
        : `https://api.aladhan.com/v1/timings?latitude=${params.lat}&longitude=${params.lon}&method=2`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Aladhan ${res.status}`);
    const json = await res.json() as any;
    const { timings, date } = json.data;
    return {
        timings, hijri: date.hijri, date: todayStr(),
        location: isCity ? `${params.city}, ${params.country ?? ''}` : `${Number(params.lat).toFixed(2)}, ${Number(params.lon).toFixed(2)}`,
    };
}

async function fetchWithFallback(params: Record<string, string>): Promise<PrayerTimesResult> {
    try {
        if (CONFIGURED) return await invokeEdgeFunction(params);
        return await directAladhan(params);
    } catch {
        return directAladhan(params);
    }
}

export async function fetchPrayerTimesByCoords(lat: number, lon: number): Promise<PrayerTimesResult> {
    const cached = loadCache();
    if (cached) return cached;
    const result = await fetchWithFallback({ lat: String(lat), lon: String(lon) });
    saveCache(result);
    return result;
}

export async function fetchPrayerTimesByCity(city: string, country: string): Promise<PrayerTimesResult> {
    const cached = loadCache();
    if (cached) return cached;
    const result = await fetchWithFallback({ city, country });
    saveCache(result);
    return result;
}

export async function fetchPrayerTimesAuto(): Promise<PrayerTimesResult> {
    const cached = loadCache();
    if (cached) return cached;

    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            fetchPrayerTimesByCity('Mecca', 'SA').then(resolve).catch(reject);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            pos => fetchPrayerTimesByCoords(pos.coords.latitude, pos.coords.longitude).then(resolve).catch(reject),
            () => fetchPrayerTimesByCity('Mecca', 'SA').then(resolve).catch(reject),
            { timeout: 8000 }
        );
    });
}

export function cleanTime(t: string): string { return t.split(' ')[0]; }

export function getNextPrayer(timings: PrayerTimes): { name: string; timeStr: string; minsUntil: number } {
    const now = new Date();
    const prayers: [string, string][] = [
        ['Fajr', timings.Fajr], ['Dhuhr', timings.Dhuhr],
        ['Asr', timings.Asr], ['Maghrib', timings.Maghrib], ['Isha', timings.Isha],
    ];
    for (const [name, rawTime] of prayers) {
        const [h, m] = cleanTime(rawTime).split(':').map(Number);
        const prayerDate = new Date(now);
        prayerDate.setHours(h, m, 0, 0);
        if (prayerDate > now) {
            return { name, timeStr: cleanTime(rawTime), minsUntil: Math.round((prayerDate.getTime() - now.getTime()) / 60000) };
        }
    }
    const [h, m] = cleanTime(timings.Fajr).split(':').map(Number);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(h, m, 0, 0);
    return { name: 'Fajr', timeStr: cleanTime(timings.Fajr), minsUntil: Math.round((tomorrow.getTime() - now.getTime()) / 60000) };
}
