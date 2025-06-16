// backend/routes/filial.js

import { Router } from 'express';
import { listarFilial, visualizarFilial, criarFilial, atualizarFilial, removerFilial } from '../controllers/filial.js'; // Verifique o caminho se necessário

const router = Router();

// Endpoint GET /api/filial para listar todas as filiais (com paginação no controller)
router.get('/', listarFilial);

// Endpoint GET /api/filial/detalhes/:id para visualizar uma filial específica
router.get('/detalhes/:id', visualizarFilial);

// Endpoint POST /api/filial para criar uma filial
router.post('/', criarFilial);

// Endpoint PUT /api/filial/:id para atualizar uma filial
router.put('/:id', atualizarFilial);

// Endpoint DELETE /api/filial/:id para remover (inativar) uma filial
router.delete('/:id', removerFilial);

export default router;
