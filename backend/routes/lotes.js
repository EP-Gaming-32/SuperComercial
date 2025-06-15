import { Router } from 'express';
import {
  listarLotes,
  visualizarLotes,
  criarLotes,
  atualizarLotes,
  removerLotes,
  listarLotesByEstoque,
} from '../controllers/lotes.js';

const router = Router();

// Rotas específicas primeiro:
router.get('/por-estoque', listarLotesByEstoque);

// Rotas de listagem geral e CRUD por ID
router.get('/', listarLotes);
router.get('/:id', visualizarLotes);
router.post('/', criarLotes);
router.put('/:id', atualizarLotes);
router.delete('/:id', removerLotes);

export default router;
