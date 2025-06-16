import { Router } from 'express';
import { 
    listarProdutos, 
    criarProduto, 
    atualizarProduto, 
    removerProduto, 
    visualizarProduto,
    listarProdutosUnicos} from '../controllers/produtos.js';

const router = Router();

//endpoint GET /produtos?page=<n>&limit=<m>
router.get('/', listarProdutos);
//endpoint GET /produtos/Unicos
router.get('/Unicos', listarProdutosUnicos);
//endpoint GET /produtos/detalhes/:id
router.get('/detalhes/:id', visualizarProduto);
//endpoint POST /produtos
router.post('/', criarProduto);
//endpoint PUT /produtos/:id
router.put('/:id', atualizarProduto);
//endpoint DELETE /produtos/:id
router.delete('/:id', removerProduto);


export default router;