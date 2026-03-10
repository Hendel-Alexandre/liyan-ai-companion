/* ─────────────────────────────────────────────────────────
   Centralized Config Validation
   
   Validates all required secrets at startup.
   Never leaks secret values — only reports presence/absence.
───────────────────────────────────────────────────────── */

export interface ProviderStatus {
    name: string;
    configured: boolean;
    required: boolean;
    description: string;
    envVar: string;
    where: string; // where to set it
}

export interface ConfigReport {
    allCriticalReady: boolean;
    aiReady: boolean;
    dbReady: boolean;
    authReady: boolean;
    providers: ProviderStatus[];
    warnings: string[];
    errors: string[];
}

const SECRET_MAP: { name: string; envVar: string; required: boolean; description: string; where: string; category: string }[] = [
    // Database & Auth (critical)
    { name: 'Database', envVar: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string', where: 'Replit Secrets', category: 'infra' },
    { name: 'JWT Secret', envVar: 'JWT_SECRET', required: true, description: 'Token signing key (any random string)', where: 'Replit Secrets', category: 'auth' },

    // AI Providers (at least one needed)
    { name: 'Anthropic (Claude)', envVar: 'ANTHROPIC_API_KEY', required: false, description: 'Claude AI provider', where: 'Replit Secrets', category: 'ai' },
    { name: 'OpenAI', envVar: 'OPENAI_API_KEY', required: false, description: 'GPT AI provider', where: 'Replit Secrets', category: 'ai' },
    { name: 'Google Gemini', envVar: 'GEMINI_API_KEY', required: false, description: 'Gemini AI provider', where: 'Replit Secrets', category: 'ai' },

    // Optional providers
    { name: 'ElevenLabs (TTS)', envVar: 'ELEVENLABS_API_KEY', required: false, description: 'Premium text-to-speech voices', where: 'Replit Secrets', category: 'tts' },
    { name: 'Deepgram (STT)', envVar: 'DEEPGRAM_API_KEY', required: false, description: 'Speech-to-text transcription', where: 'Replit Secrets', category: 'stt' },
];

export function validateConfig(): ConfigReport {
    const providers: ProviderStatus[] = SECRET_MAP.map(s => ({
        name: s.name,
        configured: !!process.env[s.envVar],
        required: s.required,
        description: s.description,
        envVar: s.envVar,
        where: s.where,
    }));

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check critical infra
    const dbReady = !!process.env.DATABASE_URL;
    const authReady = !!process.env.JWT_SECRET;

    if (!dbReady) errors.push('DATABASE_URL is missing — database will not work');
    if (!authReady) errors.push('JWT_SECRET is missing — authentication will not work');

    // Check AI providers
    const aiProviders = providers.filter(p => SECRET_MAP.find(s => s.envVar === p.envVar)?.category === 'ai');
    const aiReady = aiProviders.some(p => p.configured);

    if (!aiReady) {
        errors.push('No AI provider configured — chat will not work. Add at least one of: ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY');
    } else {
        const missing = aiProviders.filter(p => !p.configured);
        if (missing.length > 0) {
            warnings.push(`Optional AI providers not configured: ${missing.map(p => p.name).join(', ')} — fallback chain may be limited`);
        }
    }

    // Check optional
    if (!process.env.ELEVENLABS_API_KEY) warnings.push('ElevenLabs not configured — using browser TTS');
    if (!process.env.DEEPGRAM_API_KEY) warnings.push('Deepgram not configured — using browser speech recognition');

    const allCriticalReady = dbReady && authReady;

    return { allCriticalReady, aiReady, dbReady, authReady, providers, warnings, errors };
}

/** Get available AI provider names in priority order */
export function getAvailableAIProviders(preferred = 'claude'): string[] {
    const all: { name: string; envVar: string }[] = [
        { name: 'claude', envVar: 'ANTHROPIC_API_KEY' },
        { name: 'openai', envVar: 'OPENAI_API_KEY' },
        { name: 'gemini', envVar: 'GEMINI_API_KEY' },
    ];
    const available = all.filter(p => !!process.env[p.envVar]).map(p => p.name);
    // Put preferred first
    const ordered = [preferred, ...available.filter(n => n !== preferred)].filter(n => available.includes(n));
    return ordered;
}

/** Log config status at startup */
export function logConfigStatus() {
    const report = validateConfig();
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║       LIYAN AI — Config Status       ║');
    console.log('╚══════════════════════════════════════╝');

    for (const p of report.providers) {
        const icon = p.configured ? '✅' : (p.required ? '❌' : '⚪');
        console.log(`  ${icon} ${p.name}: ${p.configured ? 'configured' : 'missing'}`);
    }

    if (report.errors.length > 0) {
        console.log('\n⛔ ERRORS:');
        report.errors.forEach(e => console.log(`  • ${e}`));
    }
    if (report.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        report.warnings.forEach(w => console.log(`  • ${w}`));
    }

    if (report.allCriticalReady && report.aiReady) {
        console.log('\n🟢 All critical services ready.\n');
    } else {
        console.log('\n🔴 Some required services are missing. See errors above.\n');
    }
}