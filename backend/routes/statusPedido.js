import { Router } from 'express';
import {
  listarStatusPedido,
  criarStatusPedido,
  atualizarStatusPedido,
  removerStatusPedido,
  visualizarStatusPedido
} from '../controllers/statusPedido.js';
const router = Router();

router.get('/', listarStatusPedido);
router.get('/detalhes/:id', visualizarStatusPedido);
router.post('/', criarStatusPedido);
router.put('/:id', atualizarStatusPedido);
router.delete('/:id', removerStatusPedido);

export default router;