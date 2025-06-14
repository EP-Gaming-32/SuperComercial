// backend/routes/relatorios.js

import { Router } from 'express';
import {
  relatorioPedidosPorFilial,
  relatorioEstoquePorFilial,
  relatorioFornecedoresPorFilial,
  relatorioPagamentosPorFilial,
  relatorioPrevisaoPedido,
  relatorioStatusPorEstoque,
  relatorioEstoquePorProduto,
  relatorioComprasPorMes,
  relatorioEstoqueAlertas,
  relatorioProdutosVencidosDanificados // Make sure this function is exported from your controllers/relatorios.js
} from '../controllers/relatorios.js'; // Adjust the path if your controllers/relatorios.js is in a different location relative to this file

const router = Router();

// RELATÓRIO: Pedidos por filial (histórico por mês)
// Frontend call: GET /api/relatorios/pedidos-por-filial?id_filial=X
router.get('/pedidos-por-filial', relatorioPedidosPorFilial);

// RELATÓRIO: Estoque por filial (detalhado por produto, por filial)
// Frontend call: GET /api/relatorios/estoque-por-filial?id_filial=X
router.get('/estoque-por-filial', relatorioEstoquePorFilial);

// RELATÓRIO: Fornecedores por filial
// Frontend call: GET /api/relatorios/fornecedores-por-filial
router.get('/fornecedores-por-filial', relatorioFornecedoresPorFilial);

// RELATÓRIO: Pagamentos por filial
// Frontend call: GET /api/relatorios/pagamentos-por-filial
router.get('/pagamentos-por-filial', relatorioPagamentosPorFilial);

// RELATÓRIO: Previsão de Pedidos
// Frontend call: GET /api/relatorios/previsao-pedido
router.get('/previsao-pedido', relatorioPrevisaoPedido);

// RELATÓRIO: Status por Estoque (agregado por status)
// Frontend call: GET /api/relatorios/status-por-estoque?id_filial=X
router.get('/status-por-estoque', relatorioStatusPorEstoque);

// RELATÓRIO: Estoque por Produto (detalhado para uma filial específica)
// Frontend call: GET /api/relatorios/estoque-por-produto?id_filial=X
router.get('/estoque-por-produto', relatorioEstoquePorProduto);

// RELATÓRIO: Compras por Mês (para uma filial específica)
// Frontend call: GET /api/relatorios/compras-por-mes?id_filial=X
router.get('/compras-por-mes', relatorioComprasPorMes);

// RELATÓRIO: Estoque Crítico / Alertas (Tabela/Lista paginada)
// Frontend call: GET /api/relatorios/estoque-alertas?page=X&limit=Y&id_filial=Z...
router.get('/estoque-alertas', relatorioEstoqueAlertas);

// NOVO RELATÓRIO: Produtos Vencidos/Danificados
// Frontend call: GET /api/relatorios/produtos/vencidos-danificados?id_filial=X
// This is the route that was causing the "Cannot GET" error.
router.get('/produtos/vencidos-danificados', relatorioProdutosVencidosDanificados);

export default router;
