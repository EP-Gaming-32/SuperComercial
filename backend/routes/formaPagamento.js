import { Router } from 'express';
import {
  listarFormaPagamento,
  criarFormaPagamento,
  atualizarFormaPagamento,
  removerFormaPagamento,
  visualizarFormaPagamento
} from '../controllers/formaPagamento.js';
const router = Router();

router.get('/', listarFormaPagamento);
router.get('/detalhes/:id', visualizarFormaPagamento);
router.post('/', criarFormaPagamento);
router.put('/:id', atualizarFormaPagamento);
router.delete('/:id', removerFormaPagamento);

export default router;