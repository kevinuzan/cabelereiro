import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;
const DB_NAME = "barbearia_db";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function startServer() {
    const client = new MongoClient(process.env.MONGO_PUBLIC_URL || "mongodb://localhost:27017");
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const agendamentosColl = db.collection("agendamentos");
        const configColl = db.collection("configuracoes");

        // --- API ADMIN ---
        app.get('/api/admin/config', async (req, res) => {
            const config = await configColl.findOne({ tipo: "geral" });
            res.json(config || { tempoCorte: 30, profissionais: [] });
        });

        app.post('/api/admin/config', async (req, res) => {
            const { tempoCorte, profissionais } = req.body;
            await configColl.updateOne(
                { tipo: "geral" },
                { $set: { tempoCorte, profissionais } },
                { upsert: true }
            );
            res.json({ success: true });
        });

        // --- API CLIENTE ---
        app.get('/api/agendamentos', async (req, res) => {
            const lista = await agendamentosColl.find().toArray();
            res.json(lista);
        });

        app.post('/api/agendamentos', async (req, res) => {
            const novoAgendamento = { ...req.body, dataCriacao: new Date() };
            const result = await agendamentosColl.insertOne(novoAgendamento);
            
            // Notifica o admin via Socket.io em tempo real
            io.emit('novo_agendamento', { ...novoAgendamento, _id: result.insertedId });
            res.json({ success: true });
        });

        httpServer.listen(PORT, () => console.log(`Servidor ON: http://localhost:${PORT}`));
    } catch (err) { console.error("Erro no MongoDB:", err); }
}
startServer();