import { pool } from "../config/database.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const PERFIS_VALIDOS = ['admin', 'atendente', 'tecnico'];

export async function criarUsuario(req, res){
    try {
        const {nome, email, senha, perfil} = req.body;

        if (!nome || !email || !senha || !perfil){
            return res.status(400).json({
                mensagem: "Nome, email, senha e perfil são obrigatórios."
            });
        }

        if (!PERFIS_VALIDOS.includes(perfil)){
            return res.status(400).json({
                mensagem: "Perfil inválido."
            });
        }

        const emailExiste = await pool.query(`
            SELECT
                id
            FROM usuarios
            WHERE email = $1
        `, [email]
        );

        if (emailExiste.rows.length > 0){
            return res.status(409).json({
                mensagem: "Email já cadastrado!"
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const resultado = await pool.query(`
            INSERT INTO usuarios
                (nome, email, senha, perfil)
            VALUES
                ($1, $2, $3, $4)
            RETURNING
                id, nome, email, perfil
        `, [nome.trim(), email, senhaHash, perfil]
        );

        return res.status(201).json(resultado.rows[0]);

    } catch (error) {
        return res.status(500).json({
            mensagem: "Erro ao cadastrar usuário."
        });
    }
};

export async function login(req, res){
    try {
        const {email, senha} = req.body;

        if (!email || !senha){
            return res.status(400).json({
                mensagem: "Email e senha são obrigatórios."
            });
        }

        const resultado = await pool.query(`
            SELECT
                id, nome, email, senha, perfil
            FROM usuarios
            WHERE email = $1
        `, [email.trim().toLowerCase()]
        );

        const usuario = resultado.rows[0];

        const senhaCorreta = usuario
            ? await bcrypt.compare(senha, usuario.senha)
            : false;

        if (!senhaCorreta){
            return res.status(401).json({
                mensagem: "Email ou senha inválidos."
            });
        }

        const token = jwt.sign(
            { id: usuario.id, perfil: usuario.perfil },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.json({
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            }
        });

    } catch (error) {
        return res.status(500).json({
            mensagem: "Erro ao fazer login."
        });
    }
};