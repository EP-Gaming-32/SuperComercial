import { Router } from 'express';
import { listarTiposMovimentacao, criarMovimentacao } from '../controllers/movimentacaoEstoque.js';

const router = Router();

router.get('/tipos', listarTiposMovimentacao);
router.post('/', criarMovimentacao);

export default router;