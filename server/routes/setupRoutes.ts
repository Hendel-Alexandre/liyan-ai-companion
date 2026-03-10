import { Router, Request, Response } from 'express';
import { validateConfig, type ConfigReport } from '../config.js';

const router = Router();

/**
 * GET /api/setup/status
 * Returns provider configuration status WITHOUT exposing secret values.
 * Shows which providers are configured and which are missing.
 */
router.get('/status', (req: Request, res: Response) => {
    const report = validateConfig();

    // Sanitize — never send envVar names to client in production
    const safeProviders = report.providers.map(p => ({
        name: p.name,
        configured: p.configured,
        required: p.required,
        description: p.description,
        where: p.where,
    }));

    res.json({
        ready: report.allCriticalReady && report.aiReady,
        database: report.dbReady,
        auth: report.authReady,
        ai: report.aiReady,
        providers: safeProviders,
        warnings: report.warnings,
        errors: report.errors.map(e =>
            // Redact env var names from error messages for extra safety
            e.replace(/[A-Z_]{3,}/g, (match) => {
                if (['DATABASE_URL', 'JWT_SECRET'].includes(match)) return '[REDACTED]';
                return match;
            })
        ),
    });
});

export default router;