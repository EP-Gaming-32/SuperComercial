import { Router } from 'express';
import { listarFornecedores } from '../controllers/fornecedores.js';
const router = Router();
router.get('/', listarFornecedores);
export default router;