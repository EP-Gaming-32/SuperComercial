// routes/estoque.js
import { Router } from 'express';
// ✅ 1. IMPORTAR A FUNÇÃO DO CONTROLLER DE LOTES
import { listarLotesByEstoque } from '../controllers/lotes.js'; 

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

// ✅ 2. ADICIONE A ROTA QUE ESTAVA FALTANDO AQUI
router.get('/lotesByEstoque', listarLotesByEstoque);

router.post('/',      criarEstoque);
router.put('/:id',    atualizarEstoque);
router.delete('/:id', removerEstoque);

export default router;
