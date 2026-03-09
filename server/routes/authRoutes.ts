import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { signToken, requireAuth } from '../auth.js';

const router = Router();

router.post('/signup', async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
    }
    try {
        const passwordHash = await bcrypt.hash(password, 12);
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)
             RETURNING id, email, name`,
            [email.toLowerCase().trim(), passwordHash, name || email.split('@')[0]]
        );
        const user = result.rows[0];
        await pool.query(
            `INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
            [user.id]
        );
        const token = signToken({ userId: user.id, email: user.email });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err: any) {
        if (err.code === '23505') {
            res.status(409).json({ error: 'An account with this email already exists' });
        } else {
            console.error('[auth/signup]', err);
            res.status(500).json({ error: 'Signup failed' });
        }
    }
});

router.post('/signin', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    try {
        const result = await pool.query(
            `SELECT id, email, name, password_hash FROM users WHERE email = $1`,
            [email.toLowerCase().trim()]
        );
        const user = result.rows[0];
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const token = signToken({ userId: user.id, email: user.email });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
        console.error('[auth/signin]', err);
        res.status(500).json({ error: 'Sign in failed' });
    }
});

router.get('/me', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    try {
        const result = await pool.query(
            `SELECT id, email, name FROM users WHERE id = $1`,
            [userId]
        );
        if (!result.rows[0]) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error('[auth/me]', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

export default router;
