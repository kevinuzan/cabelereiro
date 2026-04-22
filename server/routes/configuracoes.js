import { Router } from 'express';
import { getDb } from '../db.js';
import { asyncHandler } from '../../public/utils/http.js';

export function adminRouter() {
    const router = Router();
    const coll = () => getDb().collection('configuracoes');

    // #region GET

    router.get('/config', asyncHandler(async (_req, res) => {
        const config = await coll().findOne({ tipo: 'geral' });
        res.json(config || { tempoCorte: 30, profissionais: [] });
    }));

    // #endregion GET

    // ------------------------------------------------------------------------------------------

    // #region ADD/MODIFY

    router.post('/config', asyncHandler(async (req, res) => {
        const { tempoCorte, profissionais } = req.body;
        await coll().updateOne(
            { tipo: 'geral' },
            { $set: { tempoCorte, profissionais } },
            { upsert: true }
        );
        res.json({ success: true });
    }));

    // #endregion ADD/MODIFY

    return router;
}
