import { pool } from "../config/database.js";

export async function listarVeiculos(req, res){
    try {
        const resultado = await query.pool(`
            SELECT
                v.id,
                v.marca,
                v.modelo,
                v.placa,
                v.ano,
                v.cor,
                p.id as propietarioId,
                p.nome
            FROM veiculos v
            JOIN proprietarios p
                ON p.id = v.proprietarioID
            ORDER BY v.modelo
            `);

        return res.json(resultado.rows);
            
    } catch (error) {
        return res.status(500).json({
            mensagem: "Erro ao listar veículos"
        });
    }
};

export async function criarVeiculo(req, res){
    try {
        const {marca, modelo, placa, ano, cor, proprietarioId} = req.body;

        const resultado = await query.pool(`
            INSERT INTO veiculos
                (marca, modelo, placa, ano, cor, proprietarioId)
            VALUES
                ($1, $2, $3, $4, $5, $6)
            RETURNING *`
            [marca, modelo, placa, ano, cor, proprietarioId]
        );

        return res.status(200).json(resultado.rows[0]);

    } catch (error) {
        return res.status(400).json({
            mensagem: "Não foi possível cadastrar o veículo"
        });
    }
};