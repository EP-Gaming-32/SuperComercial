import { Router } from 'express';
import { listarProdutos } from '../controllers/produtos.js';

const router = Router();

//endpoint GET /produtos?page=<n>&limit=<m>
router.get('/', listarProdutos);

export default router;