// env (MUST BE FIRST)
import 'dotenv/config';
// node
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
// external
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
// internal
import { notFoundHandler } from '../public/utils/http.js';
import { connectDb } from './db.js';
import { agendamentosRouter } from './routes/agendamentos.js';
import { adminRouter } from './routes/configuracoes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT;

if (!PORT) throw new Error('Environment variable PORT is not defined.');

async function bootstrap() {
    await connectDb();

    const app = express();
    const httpServer = createServer(app);
    const io = new Server(httpServer);

    app.use(cors());
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../public')));

    app.use('/api/agendamentos', agendamentosRouter(io));
    app.use('/api/admin', adminRouter());

    app.use(notFoundHandler);
    app.use((err, _req, res, _next) => res.status(500).json({ error: err.message }));

    const env = process.env.NODE_ENV;

    httpServer.listen(PORT, () => {
        if (env === 'development') {
            console.log(`Server running at http://localhost:${PORT}`);
        } else {
            console.log(`Server running on port ${PORT} [${env}]`);
        }
    });
}

bootstrap().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
