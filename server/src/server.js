import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { pool } from './config/database.js';

import { router } from './routes/index.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN
}));

app.use(express.json());

app.use('/api', router);

const iniciar = async () => {
    try {

        await pool.query('SELECT 1');

        app.listen(process.env.PORT || 3000, () => {
            console.log("Servidor iniciado.")
        })
    } catch (erro) {
        console.error("Falha ao iniciar: ", erro);
        process.exit(1);
    }
};

iniciar();