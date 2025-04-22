import { Router } from 'express';
import { listarProdutos, criarProduto, atualizarProduto, removerProduto } from '../controllers/produtos.js';

const router = Router();

//endpoint GET /produtos?page=<n>&limit=<m>
router.get('/', listarProdutos);
//endpoint POST /produtos
router.post('/', criarProduto);
//endpoint PUT /produtos/:id
router.put('/:id', atualizarProduto);
//endpoint DELETE /produtos/:id
router.delete('/:id', removerProduto);


export default router;