import { Router } from 'express';
import * as ocCtrl from '../controllers/ordemCompra.js';
const router = Router();

// Itens e preços
router.get('/itensPedidoFilial', ocCtrl.listarItensPedidoFilial);
router.get('/produtoFornecedor', ocCtrl.listarProdutoFornecedor);

// CRUD de OrdemCompra
router.get('/', ocCtrl.listarOrdensCompra);
router.post('/', ocCtrl.criarOrdemCompra);
router.delete('/:id', ocCtrl.cancelarOrdemCompra);
router.get('/detalhes/:id', ocCtrl.listarDetalhesOrdemCompra);

// Vincular PedidoFilial → OrdemCompra
router.post('/vincularPedido', ocCtrl.vincularOrdemPedido);
router.post('/complete', ocCtrl.criarOrdemCompleta);


// Itens de OrdemCompra
router.post('/itens', ocCtrl.criarItemOrdemCompra);

// Histórico de status
router.get('/historico', ocCtrl.listarHistoricoStatusOrdemCompra);

export default router;
