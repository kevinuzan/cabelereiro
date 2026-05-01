import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import { getDb, ObjectId } from '../db.js';

export function authRouter(jwtSecret) {
    const router = Router();
    const users = () => getDb().collection('usuarios');

    router.get('/test', (req, res, next) => {
        const { password } = req.query;
        bcrypt.hash(password, 10).then(hash => res.json({ hash })).catch(next);
    });

    // #region GET

    router.get('/me', (req, res, next) => {
        const [scheme, token] = req.headers.authorization?.split(' ') || [];
        if (scheme !== 'Bearer' || !token) return res.status(401).json({ success: false, message: 'Token não informado.' });

        let decoded;
        try { decoded = jwt.verify(token, jwtSecret); }
        catch (err) { return res.status(401).json({ success: false, message: 'Token inválido.' }); }

        users().findOne({ _id: new ObjectId(decoded.userId) }, { projection: { password: 0 } }).then(user => {
            if (!user) return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });
            res.json({ success: true, user });
        }).catch(next);
    });

    // #endregion GET

    // ------------------------------------------------------------------------------------------

    // #region LOGIN

    router.post('/login', (req, res, next) => {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });

        users().findOne({ email: email?.toLowerCase().trim() }).then(user => {
            if (!user) return res.status(401).json({ success: false, message: 'E-mail ou senha inválidos.' });

            return bcrypt.compare(password, user.password).then(isValid => {
                if (!isValid) return res.status(401).json({ success: false, message: 'E-mail ou senha inválidos.' });
                const token = jwt.sign({ userId: user._id.toString(), role: user.role }, jwtSecret, { expiresIn: '1d' });
                res.json({ success: true, token, id: user._id });
            });
        }).catch(next);
    });

    // #endregion LOGIN

    return router;
}