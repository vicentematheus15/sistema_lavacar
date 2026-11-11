import { pool } from "../config/database.js";
import bcrypt from 'bcryptjs';

export async function criarUsuario(req, res){
    try {
        const {nome, email, senha, perfil, cpf} = req.body;
        
        const emailExiste = await query.pool(`
            SELECT
                email 
            FROM usuarios
            WHERE email = $1   
        `, [email]
        );

        if (emailExiste){
            return res.stauts(409).json({
                mensagem: "Email já cadastrado!"
            })
        }

        const senhaHash = await bcrypt.compare(senha, 10);

        const novoUsuario = await query.pool(`
            INSERT INTO usuarios
                (nome, email, senhaHash, perfil, cpf)
            VALUES
                ($1, $2, $3, $4, $5)
        `, [nome, email, senhaHash, perfil, cpf]
        );

        return res.status(201).json({
            novoUsuario
        })

    } catch (error) {
        return res.status(500).json({
            mensagem: ""
        })
    }
};

export async function login(req, res){
    try {
        
    } catch (error) {
        
    }
};