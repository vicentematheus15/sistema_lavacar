import jwt from 'jsonwebtoken';

export async function autenticar (req, res, next){
    const token = req.headers.authorization?.split("")[1];

    if(!token){
        return res.status(401).json({
            mensagem: "Token nao informado"
        });
    }

    try {
        req.usuario = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        return next();
    } catch (error) {
        return res.status(401).json({
            mensagem: "Token inválido ou expirado."
        })
    }
};