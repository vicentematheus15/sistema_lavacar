import { pool } from "../config/database.js";

export async function listarProprietarios(req, res){
    try {
        const resultado = await pool.query(`
            SELECT id, nome, email, telefone 
            FROM proprietarios
            ORDER BY nome
        `);

        return res.json(resultado.rows);
    } catch (error) {
        return res.status(500).json({
            mensagem: "Erro ao listar proprietários."
        })
    }
};