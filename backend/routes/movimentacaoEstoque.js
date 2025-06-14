// routes/movimentacaoEstoque.js
import { Router } from 'express';
import {
  criarMovimentacao
} from '../controllers/movimentacaoEstoque.js';

const router = Router();
router.post('/',      criarMovimentacao);
export default router;
