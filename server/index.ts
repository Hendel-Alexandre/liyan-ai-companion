import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './db.js';
import { logConfigStatus } from './config.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import userRoutes from './routes/userRoutes.js';
import islamicRoutes from './routes/islamicRoutes.js';
import setupRoutes from './routes/setupRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);
app.use('/api/islamic', islamicRoutes);
app.use('/api/setup', setupRoutes);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function initDb() {
    try {
        const schemaPath = join(__dirname, 'schema.sql');
        const schema = readFileSync(schemaPath, 'utf-8');
        await pool.query(schema);
        console.log('[server] Database schema initialized');
    } catch (err) {
        console.error('[server] DB init error:', err);
    }
}

// Log config status at startup
logConfigStatus();

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`[server] API server running on port ${PORT}`);
    });
});
