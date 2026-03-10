import type { QuizQuestion, QuizDifficulty } from './types';

// Re-export QuizDifficulty so consumers can import from here
export type { QuizDifficulty } from './types';

const EASY: QuizQuestion[] = [
    {
        id: 'e1', prompt: 'How many times do Muslims pray daily?', category: 'Prayer',
        choices: ['3 times', '4 times', '5 times', '7 times'], correctIndex: 2,
        explanation: 'Muslims pray five times daily: Fajr, Dhuhr, Asr, Maghrib, and Isha.',
    },
    {
        id: 'e2', prompt: 'What is the first pillar of Islam?', category: 'Basics',
        choices: ['Prayer (Salah)', 'Fasting (Sawm)', 'Declaration of Faith (Shahada)', 'Charity (Zakat)'], correctIndex: 2,
        explanation: 'The Shahada — "There is no god but Allah, and Muhammad is His messenger" — is the first pillar.',
    },
    {
        id: 'e3', prompt: 'Which surah is the opening chapter of the Quran?', category: 'Quran',
        choices: ['Al-Baqarah', 'Al-Ikhlas', 'Al-Fatiha', 'Al-Kahf'], correctIndex: 2,
        explanation: 'Al-Fatiha ("The Opening") is the first surah of the Quran and is recited in every rakat of prayer.',
    },
    {
        id: 'e4', prompt: 'What is the direction Muslims pray towards?', category: 'Prayer',
        choices: ['Jerusalem', 'Mecca (the Kaaba)', 'Medina', 'The Sun'], correctIndex: 1,
        explanation: 'Muslims face the Qibla — the direction of the Kaaba in Mecca — during prayer.',
    },
    {
        id: 'e5', prompt: 'What does "As-salamu alaykum" mean?', category: 'Basics',
        choices: ['Praise be to Allah', 'Peace be upon you', 'In the name of Allah', 'Allah is the Greatest'], correctIndex: 1,
        explanation: '"As-salamu alaykum" is the Islamic greeting meaning "Peace be upon you."',
    },
    {
        id: 'e6', prompt: 'How many pillars does Islam have?', category: 'Basics',
        choices: ['3', '4', '5', '6'], correctIndex: 2,
        explanation: 'Islam has five pillars: Shahada, Salah, Zakat, Sawm, and Hajj.',
    },
];

const MEDIUM: QuizQuestion[] = [
    {
        id: 'm1', prompt: 'How many steps are in Wudu (ablution)?', category: 'Wudu',
        choices: ['4 obligatory acts', '6 obligatory acts', '7 obligatory acts', '9 obligatory acts'], correctIndex: 0,
        explanation: 'The 4 obligatory acts of Wudu are: washing the face, both arms to elbows, wiping the head, and washing both feet.',
    },
    {
        id: 'm2', prompt: 'Which surah is known as "The Heart of the Quran"?', category: 'Quran',
        choices: ['Al-Ikhlas', 'Ya-Sin', 'Al-Kahf', 'Al-Mulk'], correctIndex: 1,
        explanation: 'Surah Ya-Sin is often called "the heart of the Quran" based on a hadith in Abu Dawud.',
    },
    {
        id: 'm3', prompt: 'What is the minimum amount for Zakat (Nisab threshold for gold)?', category: 'Zakat',
        choices: ['20 mithqal (~85g)', '50 mithqal', '100 mithqal', '200 mithqal'], correctIndex: 0,
        explanation: 'The nisab for gold is approximately 85 grams (or 20 mithqal). If you own this much for one lunar year, Zakat is due.',
    },
    {
        id: 'm4', prompt: 'What is the Fajr prayer time defined by?', category: 'Prayer',
        choices: ['Midnight', 'True (Astronomical) Dawn', 'Sunrise', '1 hour before sunrise'], correctIndex: 1,
        explanation: 'Fajr begins at true dawn (al-fajr al-sadiq) and ends at sunrise.',
    },
    {
        id: 'm5', prompt: 'In which month did the Quran begin to be revealed?', category: 'Quran',
        choices: ['Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal'], correctIndex: 2,
        explanation: 'The Quran began its revelation during the month of Ramadan, on Laylat al-Qadr.',
    },
    {
        id: 'm6', prompt: 'The number of rakats in Isha prayer is:', category: 'Prayer',
        choices: ['2 fard + 2 sunnah', '2 fard + 4 sunnah', '4 fard + 2 sunnah', '4 fard + 4 sunnah'], correctIndex: 2,
        explanation: 'Isha prayer consists of 4 obligatory (fard) rakats, preceded by 4 sunnah.',
    },
];

const HARD: QuizQuestion[] = [
    {
        id: 'h1', prompt: 'Which of the following invalidates Wudu?', category: 'Wudu',
        choices: ['Laughing during prayer', 'Deep sleep (losing consciousness)', 'Eating cooked food', 'All of the above'], correctIndex: 1,
        explanation: 'According to the Shafi\'i and Hanbali schools, sleep that causes loss of consciousness invalidates wudu. Scholarly opinions differ on the others.',
    },
    {
        id: 'h2', prompt: 'The condition that makes Hajj obligatory includes:', category: 'Hajj',
        choices: ['Being Muslim, sane, adult, free, and able', 'Being Muslim and adult', 'Being Muslim and having wealth', 'Being Muslim, adult, and married'], correctIndex: 0,
        explanation: 'Hajj is obligatory once in a lifetime for every Muslim who is sane, adult, free, and financially/physically able (istita\'ah).',
    },
    {
        id: 'h3', prompt: 'Surah Al-Kahf is recommended to be read every:', category: 'Quran',
        choices: ['Day', 'Monday', 'Friday', 'Month'], correctIndex: 2,
        explanation: 'The Prophet ﷺ recommended reading Surah Al-Kahf every Friday, which provides light between the two Fridays.',
    },
    {
        id: 'h4', prompt: 'What is Tayammum?', category: 'Purification',
        choices: ['A type of prayer', 'Dry purification using clean earth when water is unavailable', 'Ritual bathing (ghusl)', 'Prayer on a journey'], correctIndex: 1,
        explanation: 'Tayammum is the Islamic act of dry ablution using clean earth, dust or stone when water is unavailable or harmful.',
    },
    {
        id: 'h5', prompt: 'How many Juz (parts) does the Quran have?', category: 'Quran',
        choices: ['20', '25', '30', '36'], correctIndex: 2,
        explanation: 'The Quran is divided into 30 Juz (plural: Ajzaa), making it easier to complete one Juz per day in Ramadan.',
    },
    {
        id: 'h6', prompt: 'The term "Ijma" in Islamic jurisprudence means:', category: 'Fiqh',
        choices: ['Analogy (comparison to precedent)', 'Independent legal reasoning', 'Scholarly consensus', 'The Sunnah of the Prophet'], correctIndex: 2,
        explanation: 'Ijma refers to the scholarly consensus of Muslim jurists on a legal ruling, one of the four main sources of Islamic law.',
    },
];

export function getQuizQuestions(difficulty: QuizDifficulty): QuizQuestion[] {
    switch (difficulty) {
        case 'easy': return EASY;
        case 'medium': return MEDIUM;
        case 'hard': return HARD;
    }
}

export function getDifficultyLabel(d: QuizDifficulty): string {
    return { easy: 'Easy', medium: 'Medium', hard: 'Hard' }[d];
}