import { Router } from 'express';
import { listarProdutos, criarProduto, atualizarProduto } from '../controllers/produtos.js';

const router = Router();

//endpoint GET /produtos?page=<n>&limit=<m>
router.get('/', listarProdutos);
//endpoint POST /produtos
router.post('/', criarProduto);
//endpoint PUT /produtos/:id
router.put('/:id', atualizarProduto);

export default router;