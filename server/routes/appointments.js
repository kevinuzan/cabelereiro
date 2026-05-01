import { Router } from 'express';
import { getDb } from '../db.js';

export function appointmentsRouter(io) {
    const router = Router();
    const coll = () => getDb().collection('agendamentos');

    // #region GET

    router.get('/', (_req, res, next) => coll()
        .find().sort({ data: 1 }).toArray()
        .then(data => res.json(data)).catch(next)
    );

    // #endregion GET

    // ------------------------------------------------------------------------------------------

    // #region ADD/MODIFY

    router.post('/', (req, res, next) => {
        const newObj = { ...req.body, dataCriacao: new Date() };

        coll().insertOne(newObj).then((result) => {
            const created = { ...newObj, _id: result.insertedId };

            io.emit('novo_agendamento', created);
            res.status(201).json({ success: true, data: created });
        }).catch(next);
    });

    // #endregion ADD/MODIFY

    return router;
}
