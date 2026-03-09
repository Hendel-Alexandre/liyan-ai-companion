import { Router, Request, Response } from 'express';
import { requireAuth } from '../auth.js';
import pool from '../db.js';

const router = Router();

router.get('/settings', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    try {
        const result = await pool.query(
            `SELECT * FROM user_settings WHERE user_id = $1`,
            [userId]
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        console.error('[user/settings GET]', err);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

router.put('/settings', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const { accent_color, text_size, voice_speed, voice_gender, voice_provider, voice_id, city, country } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO user_settings (user_id, accent_color, text_size, voice_speed, voice_gender, voice_provider, voice_id, city, country)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (user_id) DO UPDATE SET
               accent_color = COALESCE(EXCLUDED.accent_color, user_settings.accent_color),
               text_size = COALESCE(EXCLUDED.text_size, user_settings.text_size),
               voice_speed = COALESCE(EXCLUDED.voice_speed, user_settings.voice_speed),
               voice_gender = COALESCE(EXCLUDED.voice_gender, user_settings.voice_gender),
               voice_provider = COALESCE(EXCLUDED.voice_provider, user_settings.voice_provider),
               voice_id = COALESCE(EXCLUDED.voice_id, user_settings.voice_id),
               city = COALESCE(EXCLUDED.city, user_settings.city),
               country = COALESCE(EXCLUDED.country, user_settings.country),
               updated_at = NOW()
             RETURNING *`,
            [userId, accent_color || 'lime', text_size || 'medium', voice_speed || 'normal',
             voice_gender || 'feminine', voice_provider || 'browser', voice_id || null, city || null, country || null]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[user/settings PUT]', err);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

router.get('/profile', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    try {
        const result = await pool.query(
            `SELECT id, email, name, created_at FROM users WHERE id = $1`,
            [userId]
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        console.error('[user/profile GET]', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

router.patch('/profile', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const { name } = req.body;
    try {
        const result = await pool.query(
            `UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name`,
            [name, userId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[user/profile PATCH]', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

router.get('/saved', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    try {
        const result = await pool.query(
            `SELECT * FROM saved_items WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('[user/saved GET]', err);
        res.status(500).json({ error: 'Failed to fetch saved items' });
    }
});

router.post('/saved', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const { item_type, title, subtitle, item_ref_id, payload_json } = req.body;
    if (!item_type || !title) {
        res.status(400).json({ error: 'item_type and title are required' });
        return;
    }
    try {
        const result = await pool.query(
            `INSERT INTO saved_items (user_id, item_type, title, subtitle, item_ref_id, payload_json)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [userId, item_type, title, subtitle || null, item_ref_id || null, payload_json || {}]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[user/saved POST]', err);
        res.status(500).json({ error: 'Failed to save item' });
    }
});

router.delete('/saved/:id', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const { id } = req.params;
    try {
        await pool.query(`DELETE FROM saved_items WHERE id = $1 AND user_id = $2`, [id, userId]);
        res.json({ ok: true });
    } catch (err) {
        console.error('[user/saved DELETE]', err);
        res.status(500).json({ error: 'Failed to remove saved item' });
    }
});

router.delete('/saved', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    try {
        await pool.query(`DELETE FROM saved_items WHERE user_id = $1`, [userId]);
        res.json({ ok: true });
    } catch (err) {
        console.error('[user/saved DELETE all]', err);
        res.status(500).json({ error: 'Failed to clear saved items' });
    }
});

export default router;
