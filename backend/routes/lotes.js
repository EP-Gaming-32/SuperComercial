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
router.get('/', listarLotes);
router.get('/:id', visualizarLotes);
router.post('/',  criarLotes);
router.put('/:id', atualizarLotes);
router.delete('/:id', removerLotes);
router.get('/lotesByEstoque', listarLotesByEstoque);

export default router;
