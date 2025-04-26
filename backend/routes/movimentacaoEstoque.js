// routes/movimentacaoEstoque.js
import { Router } from 'express';
import {
  listarMovimentacoes,
  visualizarMovimentacao,
  criarMovimentacao
} from '../controllers/movimentacaoEstoque.js';

const router = Router();
router.get('/',       listarMovimentacoes);
router.get('/:id',    visualizarMovimentacao);
router.post('/',      criarMovimentacao);
export default router;
