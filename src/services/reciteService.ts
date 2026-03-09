import { ReciteItem } from './types';

/* ─────────────────────────────────────────────────────────
   Audio URL helper — EveryAyah.com CDN (free, no key)
   Pattern: /data/{reciter}/{surah_padded}{ayah_padded}.mp3
───────────────────────────────────────────────────────── */
const RECITER = 'Alafasy_128kbps'; // Mishary Alafasy

function audioUrl(surah: number, ayah: number): string {
    const s = String(surah).padStart(3, '0');
    const a = String(ayah).padStart(3, '0');
    return `https://everyayah.com/data/${RECITER}/${s}${a}.mp3`;
}

/* ─────────────────────────────────────────────────────────
   RECITE ITEMS — Short surahs + adhkar
   All have audioUrl per verse via EveryAyah CDN
───────────────────────────────────────────────────────── */
export const RECITE_ITEMS: ReciteItem[] = [
    /* ── 1. Al-Fatiha ── */
    {
        id: 'al-fatiha', type: 'surah', title: 'Al-Fatiha', arabicTitle: 'الفاتحة',
        surahNumber: 1,
        description: 'The Opening — recited in every rakat of prayer',
        verses: [
            { number: 1, arabic: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ', transliteration: 'Bismillāhi r-raḥmāni r-raḥīm', translation: 'In the name of Allah, the Most Gracious, the Most Merciful', audioUrl: audioUrl(1, 1) },
            { number: 2, arabic: 'ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَـٰلَمِينَ', transliteration: 'Alḥamdu lillāhi rabbi l-ʿālamīn', translation: 'All praise is for Allah, Lord of all the worlds', audioUrl: audioUrl(1, 2) },
            { number: 3, arabic: 'ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ', transliteration: 'Ar-raḥmāni r-raḥīm', translation: 'The Most Gracious, the Most Merciful', audioUrl: audioUrl(1, 3) },
            { number: 4, arabic: 'مَـٰلِكِ يَوۡمِ ٱلدِّينِ', transliteration: 'Māliki yawmi d-dīn', translation: 'Master of the Day of Judgment', audioUrl: audioUrl(1, 4) },
            { number: 5, arabic: 'إِيَّاكَ نَعۡبُدُ وَإِيَّاكَ نَسۡتَعِينُ', transliteration: 'Iyyāka naʿbudu wa-iyyāka nastaʿīn', translation: 'You alone we worship, and You alone we ask for help', audioUrl: audioUrl(1, 5) },
            { number: 6, arabic: 'ٱهۡدِنَا ٱلصِّرَٰطَ ٱلۡمُسۡتَقِيمَ', transliteration: 'Ihdina ṣ-ṣirāṭal-mustaqīm', translation: 'Guide us to the straight path', audioUrl: audioUrl(1, 6) },
            { number: 7, arabic: 'صِرَٰطَ ٱلَّذِينَ أَنۡعَمۡتَ عَلَيۡهِمۡ غَيۡرِ ٱلۡمَغۡضُوبِ عَلَيۡهِمۡ وَلَا ٱلضَّآلِّينَ', transliteration: 'Ṣirāṭalladhīna anʿamta ʿalayhim ghayril-maghḍūbi ʿalayhim walā ḍ-ḍāllīn', translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked anger or of those who are astray', audioUrl: audioUrl(1, 7) },
        ],
    },

    /* ── 112. Al-Ikhlas ── */
    {
        id: 'al-ikhlas', type: 'surah', title: 'Al-Ikhlas', arabicTitle: 'الإخلاص',
        surahNumber: 112,
        description: 'The Sincerity — equal to one-third of the Quran',
        verses: [
            { number: 1, arabic: 'قُلۡ هُوَ ٱللَّهُ أَحَدٌ', transliteration: 'Qul huwallāhu aḥad', translation: 'Say: He is Allah, [who is] One', audioUrl: audioUrl(112, 1) },
            { number: 2, arabic: 'ٱللَّهُ ٱلصَّمَدُ', transliteration: 'Allāhuṣ-ṣamad', translation: 'Allah, the Eternal Refuge', audioUrl: audioUrl(112, 2) },
            { number: 3, arabic: 'لَمۡ يَلِدۡ وَلَمۡ يُولَدۡ', transliteration: 'Lam yalid wa-lam yūlad', translation: 'He neither begot nor was begotten', audioUrl: audioUrl(112, 3) },
            { number: 4, arabic: 'وَلَمۡ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ', transliteration: 'Walam yakun lahū kufuwan aḥad', translation: 'Nor is there any equivalent to Him', audioUrl: audioUrl(112, 4) },
        ],
    },

    /* ── 113. Al-Falaq ── */
    {
        id: 'al-falaq', type: 'surah', title: 'Al-Falaq', arabicTitle: 'الفلق',
        surahNumber: 113,
        description: 'The Daybreak — one of the two protective surahs',
        verses: [
            { number: 1, arabic: 'قُلۡ أَعُوذُ بِرَبِّ ٱلۡفَلَقِ', transliteration: 'Qul aʿūdhu bi-rabbi l-falaq', translation: 'Say: I seek refuge in the Lord of daybreak', audioUrl: audioUrl(113, 1) },
            { number: 2, arabic: 'مِن شَرِّ مَا خَلَقَ', transliteration: 'Min sharri mā khalaq', translation: 'From the evil of what He created', audioUrl: audioUrl(113, 2) },
            { number: 3, arabic: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', transliteration: 'Wamin sharri ghāsiqin idhā waqab', translation: 'And from the evil of darkness when it settles', audioUrl: audioUrl(113, 3) },
            { number: 4, arabic: 'وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِي ٱلۡعُقَدِ', transliteration: 'Wamin sharrin-naffāthāti fī l-ʿuqad', translation: 'And from the evil of those who blow on knots', audioUrl: audioUrl(113, 4) },
            { number: 5, arabic: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', transliteration: 'Wamin sharri ḥāsidin idhā ḥasad', translation: 'And from the evil of an envier when he envies', audioUrl: audioUrl(113, 5) },
        ],
    },

    /* ── 114. An-Nas ── */
    {
        id: 'an-nas', type: 'surah', title: 'An-Nas', arabicTitle: 'الناس',
        surahNumber: 114,
        description: 'Mankind — the second protective surah, recited at night',
        verses: [
            { number: 1, arabic: 'قُلۡ أَعُوذُ بِرَبِّ ٱلنَّاسِ', transliteration: 'Qul aʿūdhu bi-rabbi n-nās', translation: 'Say: I seek refuge in the Lord of mankind', audioUrl: audioUrl(114, 1) },
            { number: 2, arabic: 'مَلِكِ ٱلنَّاسِ', transliteration: 'Maliki n-nās', translation: 'The Sovereign of mankind', audioUrl: audioUrl(114, 2) },
            { number: 3, arabic: 'إِلَـٰهِ ٱلنَّاسِ', transliteration: 'Ilāhi n-nās', translation: 'The God of mankind', audioUrl: audioUrl(114, 3) },
            { number: 4, arabic: 'مِن شَرِّ ٱلۡوَسۡوَاسِ ٱلۡخَنَّاسِ', transliteration: 'Min sharril-waswāsil-khannās', translation: 'From the evil of the retreating whisperer', audioUrl: audioUrl(114, 4) },
            { number: 5, arabic: 'ٱلَّذِي يُوَسۡوِسُ فِي صُدُورِ ٱلنَّاسِ', transliteration: 'Alladhī yuwaswisu fī ṣudūri n-nās', translation: 'Who whispers [evil] into the breasts of mankind', audioUrl: audioUrl(114, 5) },
            { number: 6, arabic: 'مِنَ ٱلۡجِنَّةِ وَٱلنَّاسِ', transliteration: 'Minal-jinnati wan-nās', translation: 'From among the jinn and mankind', audioUrl: audioUrl(114, 6) },
        ],
    },

    /* ── 103. Al-Asr ── */
    {
        id: 'al-asr', type: 'surah', title: 'Al-Asr', arabicTitle: 'العصر',
        surahNumber: 103,
        description: 'Time — the scholars said: if only this surah were revealed, it would be sufficient guidance',
        verses: [
            { number: 1, arabic: 'وَٱلۡعَصۡرِ', transliteration: 'Wal-ʿaṣr', translation: 'By time', audioUrl: audioUrl(103, 1) },
            { number: 2, arabic: 'إِنَّ ٱلۡإِنسَـٰنَ لَفِي خُسۡرٍ', transliteration: 'Innal-insāna lafī khusr', translation: 'Indeed, mankind is in loss', audioUrl: audioUrl(103, 2) },
            { number: 3, arabic: 'إِلَّا ٱلَّذِينَ ءَامَنُواْ وَعَمِلُواْ ٱلصَّـٰلِحَـٰتِ وَتَوَاصَوۡاْ بِٱلۡحَقِّ وَتَوَاصَوۡاْ بِٱلصَّبۡرِ', transliteration: 'Illalladhīna āmanū waʿamiluṣ-ṣāliḥāti watawāṣaw bil-ḥaqqi watawāṣaw biṣ-ṣabr', translation: 'Except for those who believe, do righteous deeds, advise each other to truth, and advise each other to patience', audioUrl: audioUrl(103, 3) },
        ],
    },

    /* ── 112. Al-Kawthar ── */
    {
        id: 'al-kawthar', type: 'surah', title: 'Al-Kawthar', arabicTitle: 'الكوثر',
        surahNumber: 108,
        description: 'Abundance — the shortest surah in the Quran',
        verses: [
            { number: 1, arabic: 'إِنَّآ أَعۡطَيۡنَـٰكَ ٱلۡكَوۡثَرَ', transliteration: 'Innā aʿṭaynākal-kawthar', translation: 'Indeed, We have granted you Al-Kawthar (abundance)', audioUrl: audioUrl(108, 1) },
            { number: 2, arabic: 'فَصَلِّ لِرَبِّكَ وَٱنۡحَرۡ', transliteration: 'Faṣalli li-rabbika wanḥar', translation: 'So pray to your Lord and sacrifice [to Him alone]', audioUrl: audioUrl(108, 2) },
            { number: 3, arabic: 'إِنَّ شَانِئَكَ هُوَ ٱلۡأَبۡتَرُ', transliteration: 'Inna shāniʾaka huwal-abtar', translation: 'Indeed, your enemy is the one cut off', audioUrl: audioUrl(108, 3) },
        ],
    },

    /* ── 109. Al-Kafirun ── */
    {
        id: 'al-kafirun', type: 'surah', title: 'Al-Kafirun', arabicTitle: 'الكافرون',
        surahNumber: 109,
        description: 'The Disbelievers — recommended to recite before sleeping',
        verses: [
            { number: 1, arabic: 'قُلۡ يَـٰٓأَيُّهَا ٱلۡكَـٰفِرُونَ', transliteration: 'Qul yā ayyuhal-kāfirūn', translation: 'Say: O disbelievers', audioUrl: audioUrl(109, 1) },
            { number: 2, arabic: 'لَآ أَعۡبُدُ مَا تَعۡبُدُونَ', transliteration: 'Lā aʿbudu mā taʿbudūn', translation: 'I do not worship what you worship', audioUrl: audioUrl(109, 2) },
            { number: 3, arabic: 'وَلَآ أَنتُمۡ عَـٰبِدُونَ مَآ أَعۡبُدُ', transliteration: 'Walā antum ʿābidūna mā aʿbud', translation: 'Nor are you worshippers of what I worship', audioUrl: audioUrl(109, 3) },
            { number: 4, arabic: 'وَلَآ أَنَا۠ عَابِدٌ مَّا عَبَدتُّمۡ', transliteration: 'Walā anā ʿābidun mā ʿabadttum', translation: 'Nor will I be a worshipper of what you worship', audioUrl: audioUrl(109, 4) },
            { number: 5, arabic: 'وَلَآ أَنتُمۡ عَـٰبِدُونَ مَآ أَعۡبُدُ', transliteration: 'Walā antum ʿābidūna mā aʿbud', translation: 'Nor will you be worshippers of what I worship', audioUrl: audioUrl(109, 5) },
            { number: 6, arabic: 'لَكُمۡ دِينُكُمۡ وَلِيَ دِينِ', transliteration: 'Lakum dīnukum waliya dīn', translation: 'For you is your religion, and for me is my religion', audioUrl: audioUrl(109, 6) },
        ],
    },

    /* ── 110. An-Nasr ── */
    {
        id: 'an-nasr', type: 'surah', title: 'An-Nasr', arabicTitle: 'النصر',
        surahNumber: 110,
        description: 'The Divine Support — revealed near the end of the Prophet\'s life ﷺ',
        verses: [
            { number: 1, arabic: 'إِذَا جَآءَ نَصۡرُ ٱللَّهِ وَٱلۡفَتۡحُ', transliteration: 'Idhā jāʾa naṣrullāhi wal-fatḥ', translation: 'When the victory of Allah has come and the conquest', audioUrl: audioUrl(110, 1) },
            { number: 2, arabic: 'وَرَأَيۡتَ ٱلنَّاسَ يَدۡخُلُونَ فِي دِينِ ٱللَّهِ أَفۡوَاجًا', transliteration: 'Waraʾayta n-nāsa yadkhulūna fī dīnillāhi afwājā', translation: 'And you see the people entering into the religion of Allah in multitudes', audioUrl: audioUrl(110, 2) },
            { number: 3, arabic: 'فَسَبِّحۡ بِحَمۡدِ رَبِّكَ وَٱسۡتَغۡفِرۡهُ إِنَّهُۥ كَانَ تَوَّابًۢا', transliteration: 'Fasab-biḥ biḥamdi rabbika wastaghfirhu innahū kāna tawwābā', translation: 'Then exalt [Him] with praise of your Lord and ask forgiveness of Him. Indeed, He is ever Accepting of repentance', audioUrl: audioUrl(110, 3) },
        ],
    },

    /* ── 87. Al-Ala ── */
    {
        id: 'al-ala', type: 'surah', title: "Al-A'la", arabicTitle: 'الأعلى',
        surahNumber: 87,
        description: 'The Most High — the Prophet ﷺ loved to recite this in Jumu\'ah and Eid',
        verses: [
            { number: 1, arabic: 'سَبِّحِ ٱسۡمَ رَبِّكَ ٱلۡأَعۡلَى', transliteration: "Sabbihisma rabbika l-aʿlā", translation: 'Exalt the name of your Lord, the Most High', audioUrl: audioUrl(87, 1) },
            { number: 2, arabic: 'ٱلَّذِي خَلَقَ فَسَوَّىٰ', transliteration: 'Alladhī khalaqa fasawwā', translation: 'Who created and proportioned', audioUrl: audioUrl(87, 2) },
            { number: 3, arabic: 'وَٱلَّذِي قَدَّرَ فَهَدَىٰ', transliteration: 'Walladhī qaddara fahadā', translation: 'And who destined and [then] guided', audioUrl: audioUrl(87, 3) },
            { number: 4, arabic: 'وَٱلَّذِيٓ أَخۡرَجَ ٱلۡمَرۡعَىٰ', transliteration: 'Walladhī akhraja l-marʿā', translation: 'And who brings out the pasture', audioUrl: audioUrl(87, 4) },
            { number: 5, arabic: 'فَجَعَلَهُۥ غُثَآءً أَحۡوَىٰ', transliteration: 'Fajaʿalahu ghuthāʾan aḥwā', translation: 'And [then] makes it black stubble', audioUrl: audioUrl(87, 5) },
        ],
    },

    /* ── Ayat al-Kursi ── */
    {
        id: 'ayat-al-kursi', type: 'dua', title: 'Ayat al-Kursi', arabicTitle: 'آية الكرسي',
        surahNumber: 2,
        description: 'The Throne Verse (2:255) — the greatest ayah in the Quran',
        verses: [
            {
                number: 255,
                arabic: 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلۡحَيُّ ٱلۡقَيُّومُ ۚ لَا تَأۡخُذُهُۥ سِنَةٌ وَلَا نَوۡمٌ ۚ لَّهُۥ مَا فِي ٱلسَّمَـٰوَٰتِ وَمَا فِي ٱلۡأَرۡضِ',
                transliteration: 'Allāhu lā ilāha illā huw, al-ḥayyu l-qayyūm; lā taʾkhudhuhu sinatun walā nawm; lahū mā fī s-samāwāti wamā fī l-arḍ',
                translation: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth.',
                audioUrl: audioUrl(2, 255),
            },
        ],
    },

    /* ── Morning Adhkar ── */
    {
        id: 'morning-adhkar', type: 'dua', title: 'Morning Adhkar', arabicTitle: 'أذكار الصباح',
        description: 'Remembrances for the morning — recite after Fajr',
        verses: [
            { number: 1, arabic: 'أَصۡبَحۡنَا وَأَصۡبَحَ ٱلۡمُلۡكُ لِلَّهِ وَٱلۡحَمۡدُ لِلَّهِ', transliteration: 'Aṣbaḥnā wa-aṣbaḥal-mulku lillāhi walḥamdu lillāh', translation: 'We have entered the morning and the dominion belongs to Allah, and all praise is for Allah.' },
            { number: 2, arabic: 'سُبۡحَانَ ٱللَّهِ وَبِحَمۡدِهِۦ ×١٠٠', transliteration: 'Subḥānallāhi wa-biḥamdih — 100 times', translation: 'Glory be to Allah and all praise is His, said 100 times.' },
            { number: 3, arabic: 'لَآ إِلَـٰهَ إِلَّا ٱللَّهُ وَحۡدَهُۥ لَا شَرِيكَ لَهُۥ', transliteration: 'Lā ilāha illallāhu waḥdahū lā sharīka lah', translation: 'There is no god but Allah alone, with no partner.' },
        ],
    },

    /* ── Evening Adhkar ── */
    {
        id: 'evening-adhkar', type: 'dua', title: 'Evening Adhkar', arabicTitle: 'أذكار المساء',
        description: 'Remembrances for the evening — recite after Asr',
        verses: [
            { number: 1, arabic: 'أَمۡسَيۡنَا وَأَمۡسَى ٱلۡمُلۡكُ لِلَّهِ', transliteration: 'Amsaynā wa-amsal-mulku lillāh', translation: 'We have entered the evening and the dominion belongs to Allah.' },
            { number: 2, arabic: 'أَعُوذُ بِكَلِمَاتِ ٱللَّهِ ٱلتَّامَّاتِ مِن شَرِّ مَا خَلَقَ', transliteration: 'Aʿūdhu bikalimātillāhit-tāmmāti min sharri mā khalaq', translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.' },
        ],
    },
];

export function getAllReciteItems(): ReciteItem[] {
    return RECITE_ITEMS;
}

export function getReciteItemById(id: string): ReciteItem | undefined {
    return RECITE_ITEMS.find(item => item.id === id);
}

/** Generate EveryAyah audio URL for any surah/ayah */
export function getVerseAudioUrl(surah: number, ayah: number): string {
    return audioUrl(surah, ayah);
}
