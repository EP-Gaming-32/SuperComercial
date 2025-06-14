import { Router } from 'express';
import { 
    listarHistoricoStatusPedidoFilial,
    visualizarHistoricoStatusPedidoFilial,
    trocarStatusPedidoFilial
    } from '../controllers/historicoPedidoFilial.js';

const router = Router();

//endpoint GET /Pedido?page=<n>&limit=<m>
router.get('/', listarHistoricoStatusPedidoFilial);
//endpoint GET /Pedido/detalhes/:id
router.get('/detalhes/:id', visualizarHistoricoStatusPedidoFilial);
//endpoint PUT /Pedido/:id
router.put('/:id', trocarStatusPedidoFilial);


export default router;