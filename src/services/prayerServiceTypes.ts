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
