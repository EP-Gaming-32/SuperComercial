import express from 'express';
import {
  relatorioPedidosPorFilial,
  relatorioEstoquePorFilial,
  relatorioFornecedoresPorFilial,
  relatorioPagamentosPorFilial,
  relatorioPrevisaoPedido
} from '../controllers/relatorios.js';

const router = express.Router();

// GET /relatorios/pedidos-filial
router.get('/pedidos-filial', relatorioPedidosPorFilial);

// GET /relatorios/estoque-filial
router.get('/estoque-filial', relatorioEstoquePorFilial);

// GET /relatorios/fornecedores-filial
router.get('/fornecedores-filial', relatorioFornecedoresPorFilial);

// GET /relatorios/pagamentos-filial
router.get('/pagamentos-filial', relatorioPagamentosPorFilial);

router.get('/previsao-pedidos', relatorioPrevisaoPedido);

export default router;
