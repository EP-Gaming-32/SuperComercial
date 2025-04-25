import { Router } from 'express';
import { listarFornecedores, visualizarFornecedor, criarFornecedor, atualizarFornecedor, removerFornecedor } from '../controllers/fornecedores.js';
const router = Router();

router.get('/', listarFornecedores);
router.get('/detalhes/:id', visualizarFornecedor);
router.post('/', criarFornecedor);
router.put('/:id', atualizarFornecedor);
router.delete('/:id', removerFornecedor);

export default router;