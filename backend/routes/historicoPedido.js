import { Router } from 'express';
import {
  listarHistoricoPedido,
  visualizarHistoricoPedido,
  trocarStatusPedido
} from '../controllers/historicoPedido.js';  // <-- seus controllers que você já tem

const router = Router();

// GET /historico-status?page=<n>&limit=<m>
router.get('/', listarHistoricoPedido);
// GET /historico-status/:id_pedido
router.get('/:id', visualizarHistoricoPedido);
// POST /historico-status
router.post('/', trocarStatusPedido);

export default router;
