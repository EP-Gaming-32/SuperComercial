import { Router } from 'express';
import { 
    listarPedidoFilial, 
    criarPedidoFilial, 
    atualizarPedidoFilial, 
    removerPedidoFilial, 
    visualizarPedidoFilial} from '../controllers/pedidoFilial.js';

const router = Router();

//endpoint GET /Pedido?page=<n>&limit=<m>
router.get('/', listarPedidoFilial);
//endpoint GET /Pedido/detalhes/:id
router.get('/detalhes/:id', visualizarPedidoFilial);
//endpoint POST /Pedido
router.post('/', criarPedidoFilial);
//endpoint PUT /Pedido/:id
router.put('/:id', atualizarPedidoFilial);
//endpoint DELETE /Pedido/:id
router.delete('/:id', removerPedidoFilial);


export default router;