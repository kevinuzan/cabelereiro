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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Primeiro, servimos os arquivos da pasta 'dist' que o 'npm run build' vai gerar
app.use(express.static(path.join(__dirname, 'dist')));

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
            // Agora desestruturamos também os 'servicos' que vêm do app.js
            const { tempoCorte, profissionais, servicos } = req.body;

            try {
                await configColl.updateOne(
                    { tipo: "geral" },
                    {
                        $set: {
                            tempoCorte,
                            profissionais, // Lista de objetos {id, nome, foto}
                            servicos       // Lista de objetos {id, nome, duracao, foto}
                        }
                    },
                    { upsert: true } // Se não existir o documento 'geral', ele cria um novo
                );
                res.json({ success: true, message: "Configurações atualizadas!" });
            } catch (err) {
                console.error("Erro ao salvar no MongoDB:", err);
                res.status(500).json({ error: "Erro ao salvar no banco" });
            }
        });

        // --- API CLIENTE ---
        app.get('/api/agendamentos', async (req, res) => {
            const lista = await agendamentosColl.find().toArray();
            res.json(lista);
        });

        app.post('/api/agendamentos', async (req, res) => {
            const novoAgendamento = { ...req.body, dataCriacao: new Date() };
            const result = await agendamentosColl.insertOne(novoAgendamento);

            io.emit('novo_agendamento', { ...novoAgendamento, _id: result.insertedId });
            res.json({ success: true });
        });

        // --- AJUSTE PARA PWA / SINGLE PAGE APP ---
        // Se o usuário tentar acessar qualquer rota que não seja da API (ex: /admin),
        // o servidor entrega o index.html da pasta 'dist'.
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'dist', 'index.html'));
        });

        httpServer.listen(PORT, () => console.log(`Servidor ON: http://localhost:${PORT}`));
    } catch (err) { console.error("Erro no MongoDB:", err); }
}
startServer();