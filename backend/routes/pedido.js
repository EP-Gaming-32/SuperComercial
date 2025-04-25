import { Router } from 'express';
import { 
    listarPedido, 
    criarPedido, 
    atualizarPedido, 
    removerPedido, 
    visualizarPedido} from '../controllers/pedido.js';

const router = Router();

//endpoint GET /Pedido?page=<n>&limit=<m>
router.get('/', listarPedido);
//endpoint GET /Pedido/detalhes/:id
router.get('/detalhes/:id', visualizarPedido);
//endpoint POST /Pedido
router.post('/', criarPedido);
//endpoint PUT /Pedido/:id
router.put('/:id', atualizarPedido);
//endpoint DELETE /Pedido/:id
router.delete('/:id', removerPedido);


export default router;