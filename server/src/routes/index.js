import {Router} from 'express';
import { autenticar } from '../middlewares/auth.js';

import { listarProprietarios, criarProprietario } from '../controllers/proprietario.controller.js';
import { listarVeiculos, criarVeiculo } from '../controllers/veiculo.controller.js';
import { criarOrdemServico, listarOrdemServico, atualizarStatus } from '../controllers/ordemServico.controller.js';
import { criarUsuario, login } from '../controllers/usuario.controller.js';

const router = Router();

//Autenticação
router.post('/auth/login', login);
router.post('/auth/cadastrar', criarUsuario);

//Proprietários
router.get('/proprietarios', autenticar, listarProprietarios);
router.post('/proprietarios', autenticar, criarProprietario);

//Veículos
router.get('/veiculos', autenticar, listarVeiculos);
router.post('/veiculos', autenticar, criarVeiculo);

//Ordem de serviço
router.get('/ordens-servico', autenticar, listarOrdemServico);
router.post('/ordens-servico', autenticar, criarOrdemServico);
router.patch('/ordens-servico/:id/status', autenticar, atualizarStatus);

export default router;