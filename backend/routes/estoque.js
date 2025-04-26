// routes/estoque.js
import { Router } from 'express';
import {
  listarEstoque,
  visualizarEstoque,
  criarEstoque,
  atualizarEstoque,
  removerEstoque
} from '../controllers/estoque.js';

const router = Router();
router.get('/',       listarEstoque);
router.get('/:id',    visualizarEstoque);
router.post('/',      criarEstoque);
router.put('/:id',    atualizarEstoque);
router.delete('/:id', removerEstoque);
export default router;
