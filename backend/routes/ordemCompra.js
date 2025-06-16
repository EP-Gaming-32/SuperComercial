import { Router } from 'express';
import * as ocCtrl from '../controllers/ordemCompra.js';

const router = Router();

// Itens e preços
router.get('/itensPedidoFilial', ocCtrl.listarItensPedidoFilial);
router.get('/produtoFornecedor', ocCtrl.listarProdutoFornecedor);

// CRUD de OrdemCompra
router.get('/', ocCtrl.listarOrdensCompra);
router.get('/detalhes/:id', ocCtrl.listarDetalhesOrdemCompra);
router.post('/', ocCtrl.criarOrdemCompra);
router.post('/complete', ocCtrl.criarOrdemCompleta);
router.delete('/:id', ocCtrl.cancelarOrdemCompra);

// ✅ Rotas de atualização (novas)
router.patch('/complete/:id', ocCtrl.atualizarOrdemCompleta);

// Vinculuar PedidoFilial → OrdemCompra
router.post('/vincularPedido', ocCtrl.vincularOrdemPedido);

// Itens de OrdemCompra
router.post('/itens', ocCtrl.criarItemOrdemCompra);

// Histórico de status
router.get('/historico', ocCtrl.listarHistoricoStatusOrdemCompra);

export default router;