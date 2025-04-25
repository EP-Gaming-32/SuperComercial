import { Router } from 'express';
import {
  listarGrupos,
  criarGrupo,
  atualizarGrupo,
  removerGrupo,
  visualizarGrupo
} from '../controllers/grupos.js';
const router = Router();

router.get('/', listarGrupos);
router.get('/detalhes/:id', visualizarGrupo);
router.post('/', criarGrupo);
router.put('/:id', atualizarGrupo);
router.delete('/:id', removerGrupo);

export default router;