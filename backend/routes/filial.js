import { Router } from 'express';
import { listarFilial, visualizarFilial, criarFilial, atualizarFilial, removerFilial } from '../controllers/filial.js';
const router = Router();

router.get('/', listarFilial);
router.get('/detalhes/:id', visualizarFilial);
router.post('/', criarFilial);
router.put('/:id', atualizarFilial);
router.delete('/:id', removerFilial);

export default router;