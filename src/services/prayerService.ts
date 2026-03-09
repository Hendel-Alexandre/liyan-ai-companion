import { api } from '@/lib/api';

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

async function fetchFromApi(params: { lat?: number; lon?: number; city?: string; country?: string }): Promise<PrayerTimesResult> {
    const data = await api.islamic.prayerTimes(params);
    return {
        timings: data.timings,
        hijri: {
            day: data.hijri?.day ?? '',
            month: data.hijri?.month ?? { en: '', ar: '', number: '' },
            year: data.hijri?.year ?? '',
        },
        date: todayStr(),
        location: data.location ?? 'Unknown',
    };
}

export async function fetchPrayerTimesByCoords(lat: number, lon: number): Promise<PrayerTimesResult> {
    const cached = loadCache();
    if (cached) return cached;
    const result = await fetchFromApi({ lat, lon });
    saveCache(result);
    return result;
}

export async function fetchPrayerTimesByCity(city: string, country: string): Promise<PrayerTimesResult> {
    const cached = loadCache();
    if (cached) return cached;
    const result = await fetchFromApi({ city, country });
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
