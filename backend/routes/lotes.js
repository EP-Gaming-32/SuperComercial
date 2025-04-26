import { Router } from 'express';
import {
  listarLotes,
  visualizarLotes,
  criarLotes,
  atualizarLotes,
  removerLotes
} from '../controllers/lotes.js';

const router = Router();
router.get('/', listarLotes);
router.get('/:id', visualizarLotes);
router.post('/',  criarLotes);
router.put('/:id',atualizarLotes);
router.delete('/:id', removerLotes);
export default router;
