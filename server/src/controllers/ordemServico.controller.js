import { pool } from "../config/database.js";

export async function listarOrdemServico(req, res){
    try {
        const resultado = await query.pool(`
            SELECT 
                os.id,
                os.descricao,
                os.tipoServico,
                os.valor,
                v.marca,
                v.placa,
                v.modelo,
                p.nome as proprietarioNome
            FROM ordens_servico os
            JOIN veiculos v
                ON v.id = os.veiculo_id
            JOIN proprietarios p
                ON p.id = v.proprietarios_id
            ORDER BY os.dataEntrada DESC
            `)
    } catch (error) {
        
    }
};

export async function criarOrdemServico (req, res){
    try {
        const {descricao, tipo_servico, valor, veiculo_id}= req.body;

        const resultado = await query.pool(`
            INSERT INTO ordens_servico
                (descricao, tipo_servico, valor, veiculo_id)
            VALUES
                ($1, $2, $3, $4)
            RETURNING *`,
            [descricao, tipo_servico, valor, veiculo_id]
            );

        return res.status(201).json(resultado.rows[0]);

    } catch (error) {
        return res.status(400).json({
            mensagem: "Não foi possível criar ordem de serviço."
        });
    }
};

export async function atualizarStatus (req, res){
    try {
        const {id} = req.params;
        const {status} = req.body;

        const resultado = await query.pool(`
            UPDATE ordens_servico 
            SET status = $1, "updatedAt" = NOW()
            WHERE id = $2
            RETURNING *`,
            [status, id]
        );

        if (resultado.rowCount === 0){
            return res.status(404).json({
                mensagem: "Ordem de serviço não encontrada."
            })
        }

        return res.json(resultado.rows[0]);

    } catch (error) {
        return res.status(400).json({
            mensagem: "Não foi possível atualizar o status."
        })
    }
};