import { Router } from 'express';
import { listarGrupos } from '../controllers/grupos.js';
const router = Router();
router.get('/', listarGrupos);
export default router;