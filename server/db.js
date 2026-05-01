import { MongoClient, ObjectId } from 'mongodb';

let _db = null;

export function connectDb(url, db) {
    const client = new MongoClient(url);
    return client.connect().then(() => {
        _db = client.db(db);
        console.log('MongoDB connected');
    });
}

export function getDb() {
    if (!_db) throw new Error('MongoDB not initialized');
    return _db;
}

export { ObjectId };