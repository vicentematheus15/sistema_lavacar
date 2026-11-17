import bcrypt from 'bcrypt';
import { pool } from '../config/database.js';
import { cifrarCpf } from '../utils/criptografia.js';

// Dados de demonstração (cenário lava-car)
const usuarios = [
    { nome: 'Administrador', email: 'admin@email.com', senha: '123456', perfil: 'admin' },
    { nome: 'Ana Atendente', email: 'atendente@email.com', senha: '123456', perfil: 'atendente' },
    { nome: 'Tiago Técnico', email: 'tecnico@email.com', senha: '123456', perfil: 'tecnico' }
];

const proprietarios = [
    { nome: 'Carlos Silva', email: 'carlos@email.com', telefone: '48999990000', cpf: '11122233344' },
    { nome: 'Mariana Souza', email: 'mariana@email.com', telefone: '48999991111', cpf: '22233344455' },
    { nome: 'João Pereira', email: 'joao@email.com', telefone: '48999992222', cpf: '33344455566' }
];

// proprietarioEmail liga o veículo ao proprietário acima
const veiculos = [
    { marca: 'Volkswagen', modelo: 'Gol', placa: 'ABC1D23', ano: '2020', cor: 'Branco', proprietarioEmail: 'carlos@email.com' },
    { marca: 'Fiat', modelo: 'Argo', placa: 'DEF4G56', ano: '2022', cor: 'Preto', proprietarioEmail: 'mariana@email.com' },
    { marca: 'Chevrolet', modelo: 'Onix', placa: 'GHI7J89', ano: '2019', cor: 'Prata', proprietarioEmail: 'joao@email.com' }
];

// veiculoPlaca liga a ordem ao veículo acima
const ordens = [
    { descricao: 'Lavagem completa com cera', tipo_servico: 'Lavagem completa', valor: 80.00, status: 'aberto', veiculoPlaca: 'ABC1D23' },
    { descricao: 'Higienização interna dos bancos', tipo_servico: 'Higienização interna', valor: 150.00, status: 'em_andamento', veiculoPlaca: 'DEF4G56' },
    { descricao: 'Polimento de faróis e carroceria', tipo_servico: 'Polimento', valor: 220.00, status: 'concluido', veiculoPlaca: 'GHI7J89' }
];

const seed = async () => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Usuários (senha sempre com hash bcrypt)
        for (const u of usuarios) {
            const senhaHash = await bcrypt.hash(u.senha, 10);
            await client.query(`
                INSERT INTO usuarios (nome, email, senha, perfil)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (email) DO NOTHING
            `, [u.nome, u.email, senhaHash, u.perfil]);
        }

        // Proprietários: guardamos email -> id para usar nos veículos
        const idProprietario = {};
        for (const p of proprietarios) {
            const r = await client.query(`
                INSERT INTO proprietarios (nome, email, telefone, cpf)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
                RETURNING id
            `, [p.nome, p.email, p.telefone, cifrarCpf(p.cpf)]);
            idProprietario[p.email] = r.rows[0].id;
        }

        // Veículos: guardamos placa -> id para usar nas ordens
        const idVeiculo = {};
        for (const v of veiculos) {
            const r = await client.query(`
                INSERT INTO veiculos (marca, modelo, placa, ano, cor, proprietario_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (placa) DO UPDATE SET placa = EXCLUDED.placa
                RETURNING id
            `, [v.marca, v.modelo, v.placa, v.ano, v.cor, idProprietario[v.proprietarioEmail]]);
            idVeiculo[v.placa] = r.rows[0].id;
        }

        // Ordens de serviço: não há campo único, então o critério é descricao + veiculo_id
        for (const o of ordens) {
            const veiculoId = idVeiculo[o.veiculoPlaca];
            await client.query(`
                INSERT INTO ordens_servico (descricao, tipo_servico, valor, status, veiculo_id)
                SELECT $1, $2, $3, $4, $5
                WHERE NOT EXISTS (
                    SELECT 1 FROM ordens_servico
                    WHERE descricao = $1 AND veiculo_id = $5
                )
            `, [o.descricao, o.tipo_servico, o.valor, o.status, veiculoId]);
        }

        await client.query('COMMIT');
        console.log('Seed executado com sucesso!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao executar Seed:', error);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
};

seed();