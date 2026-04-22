import { MongoClient } from 'mongodb';

const URI = process.env.MONGO_URL;
const DB_NAME = process.env.MONGO_DB_NAME;

let _db = null;

export async function connectDb() {
    const client = new MongoClient(URI);
    await client.connect();
    _db = client.db(DB_NAME);
    console.log('MongoDB connected');
}

export function getDb() {
    if (!_db) throw new Error('MongoDB not initialized');
    return _db;
}
