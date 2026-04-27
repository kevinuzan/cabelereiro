import { Router } from 'express';
import { getDb } from '../db.js';
import { asyncHandler } from '../../public/utils/http.js';

export function appointmentsRouter(io) {
    const router = Router();
    const coll = () => getDb().collection('agendamentos');

    // #region GET

    router.get('/', asyncHandler(async (_req, res) => {
        res.json(await coll().find().sort({ data: 1 }).toArray());
    }));

    // #endregion GET

    // ------------------------------------------------------------------------------------------

    // #region ADD/MODIFY

    router.post('/', asyncHandler(async (req, res) => {
        const newObj = { ...req.body, dataCriacao: new Date() };
        const result = await coll().insertOne(newObj);
        const created = { ...newObj, _id: result.insertedId };

        io.emit('novo_agendamento', created);
        res.status(201).json({ success: true, data: created });
    }));

    // #endregion ADD/MODIFY

    return router;
}
