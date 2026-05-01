// env (MUST BE FIRST)
import 'dotenv/config';
// node
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
// external
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
// internal
import { connectDb } from './db.js';
import { authRouter } from './routes/auth.js';
import { appointmentsRouter } from './routes/appointments.js';
import { configRouter } from './routes/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MONGO_PUBLIC_URL = process.env.MONGO_PUBLIC_URL;
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

function bootstrap() {
    return connectDb(MONGO_PUBLIC_URL, "barbearia_db").then(() => {
        const app = express();
        const httpServer = createServer(app);
        const io = new Server(httpServer);

        app.use(cors());
        app.use(express.json({ limit: '50mb' }));
        app.use(express.static(path.join(__dirname, '../public')));

        app.use('/api/auth', authRouter(JWT_SECRET));
        app.use('/api/agendamentos', appointmentsRouter(io));
        app.use('/api/admin', configRouter());

        app.use((req, res) =>
            res.status(404).json({ success: false, message: 'Route not found' })
        );

        app.use((err, _req, res, _next) =>
            res.status(500).json({ success: false, message: 'Internal server error' })
        );

        httpServer.listen(PORT, '0.0.0.0', () =>
            console.log(`Server running on port ${PORT}`)
        );
    });
}

bootstrap().catch(err => process.exit(1));