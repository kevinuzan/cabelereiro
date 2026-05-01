import { Router } from 'express';
import { getDb } from '../db.js';

export function configRouter() {
    const router = Router();
    const coll = () => getDb().collection('configuracoes');

    // #region GET

    router.get('/config', (_req, res, next) => coll()
        .findOne({ tipo: 'geral' })
        .then(config => res.json(config || { tempoCorte: 30, profissionais: [] }))
        .catch(next)
    );

    // #endregion GET

    // ------------------------------------------------------------------------------------------

    // #region ADD/MODIFY

    router.post('/config', (req, res, next) => {
        const { tempoCorte, profissionais } = req.body;

        coll().updateOne(
            { tipo: 'geral' },
            { $set: { tempoCorte, profissionais } },
            { upsert: true }
        )
        .then(() => res.json({ success: true }))
        .catch(next);
    });

    // #endregion ADD/MODIFY

    return router;
}
