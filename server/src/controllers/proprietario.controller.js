import { pool } from "../config/database.js";
import { cifrarCpf } from "../utils/criptografia.js";

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

export async function criarProprietario (req, res){
    try {
        const {nome, email, telefone, cpf} = req.body;

        const resultado = await pool.query(`
            INSERT INTO proprietarios
                (nome, email, telefone, cpf)
            VALUES
                ($1, $2, $3, $4)
            RETURNING 
                id, nome, email, telefone`, 
            [nome, email, telefone, cifrarCpf(cpf)]
        );

        res.status(201).json(resultado.rows[0]);

    } catch (error) {
        return res.status(400).json({
            mensagem: "Não foi possível cadastrar proprietário."
        });
    }
};