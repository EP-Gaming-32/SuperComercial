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
  relatorioProdutosVencidosDanificados
} from '../controllers/relatorios.js'; // Ajuste o caminho se seu controllers/relatorios.js estiver em outro lugar

const router = Router();

// RELATÓRIO: Pedidos por filial (histórico por mês)
// Frontend espera: GET /api/relatorios/pedidos-por-filial
router.get('/pedidos-por-filial', relatorioPedidosPorFilial);

// RELATÓRIO: Estoque por filial (detalhado por produto, por filial)
// Frontend espera: GET /api/relatorios/estoque-por-filial
router.get('/estoque-por-filial', relatorioEstoquePorFilial);

// RELATÓRIO: Fornecedores por filial
// Frontend espera: GET /api/relatorios/fornecedores-por-filial
router.get('/fornecedores-por-filial', relatorioFornecedoresPorFilial);

// RELATÓRIO: Pagamentos por filial
// Frontend espera: GET /api/relatorios/pagamentos-por-filial
router.get('/pagamentos-por-filial', relatorioPagamentosPorFilial);

// RELATÓRIO: Previsão de Pedidos
// Frontend espera: GET /api/relatorios/previsao-pedido
router.get('/previsao-pedido', relatorioPrevisaoPedido);

// RELATÓRIO: Status por Estoque (agregado por status)
// Frontend espera: GET /api/relatorios/status-por-estoque
router.get('/status-por-estoque', relatorioStatusPorEstoque);

// RELATÓRIO: Estoque por Produto (detalhado para uma filial específica)
// Frontend espera: GET /api/relatorios/estoque-por-produto
router.get('/estoque-por-produto', relatorioEstoquePorProduto);

// RELATÓRIO: Compras por Mês (para uma filial específica)
// Frontend espera: GET /api/relatorios/compras-por-mes
router.get('/compras-por-mes', relatorioComprasPorMes);

// RELATÓRIO: Estoque Crítico / Alertas (Tabela/Lista paginada)
// Frontend espera: GET /api/relatorios/estoque-alertas
router.get('/estoque-alertas', relatorioEstoqueAlertas);

// NOVO RELATÓRIO: Produtos Vencidos/Danificados
// Frontend espera: GET /api/relatorios/produtos/vencidos-danificados
router.get('/produtos/vencidos-danificados', relatorioProdutosVencidosDanificados);

export default router;
