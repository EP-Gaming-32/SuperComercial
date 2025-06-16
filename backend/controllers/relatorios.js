// backend/controllers/relatorios.js

import pool from '../config/db.js'; // Certifique-se de que este caminho está correto para sua configuração do banco de dados

// RELATÓRIO: Pedidos por filial (histórico por mês)
export const relatorioPedidosPorFilial = async (req, res) => {
  const { id_filial } = req.query;

  try {
    const [rows] = await pool.query(
      `SELECT
          DATE_FORMAT(p.data_pedido, '%Y-%m') AS mes,
          f.id_filial, -- Adicionado ao SELECT para ser usado no GROUP BY/ORDER BY
          f.nome_filial,
          COUNT(p.id_pedido) AS total_pedidos,
          SUM(p.valor_total) AS valor_total_pedidos
        FROM PedidoFilial p
        LEFT JOIN Filial f ON p.id_filial = f.id_filial
        ${id_filial ? 'WHERE p.id_filial = ?' : ''}
        GROUP BY mes, f.id_filial, f.nome_filial -- Ajustado para incluir id_filial
        ORDER BY mes, f.id_filial`, // Ajustado para ordenar por id_filial
      id_filial ? [id_filial] : []
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro em relatorioPedidosPorFilial:', error);
    res.status(500).json({ error: 'Erro interno ao gerar relatório de pedidos por filial' });
  }
};

// RELATÓRIO: Estoque por filial (detalhado por produto)
export const relatorioEstoquePorFilial = async (req, res) => {
  const { id_filial } = req.query;

  try {
    let query = `
      SELECT
        f.id_filial, -- Adicionado para GROUP BY/ORDER BY
        f.nome_filial,
        p.id_produto, -- Adicionado para GROUP BY/ORDER BY
        p.nome_produto,
        e.quantidade
      FROM Estoque e
      LEFT JOIN Filial f ON e.id_filial = f.id_filial
      LEFT JOIN Produtos p ON e.id_produto = p.id_produto
    `;

    const params = [];

    if (id_filial) {
      query += ` WHERE e.id_filial = ?`;
      params.push(id_filial);
    }

    query += ` ORDER BY f.nome_filial, p.nome_produto`; // Não tem GROUP BY, então OK

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error('Erro em relatorioEstoquePorFilial:', error);
    res.status(500).json({ error: 'Erro interno ao gerar relatório de estoque por filial' });
  }
};

// RELATÓRIO: Fornecedores por filial
export const relatorioFornecedoresPorFilial = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT
          f.id_filial,
          f.nome_filial,
          fo.id_fornecedor,
          fo.nome_fornecedor
        FROM Filial f
        JOIN PedidoFilial pf ON f.id_filial = pf.id_filial
        JOIN OrdemCompraPedidoFilial ocpf ON pf.id_pedido_filial = ocpf.id_pedido_filial
        JOIN OrdemCompra oc ON ocpf.id_ordem_compra = oc.id_ordem_compra
        JOIN Fornecedor fo ON oc.id_fornecedor = fo.id_fornecedor
        WHERE f.nome_filial IS NOT NULL AND fo.nome_fornecedor IS NOT NULL
        GROUP BY f.id_filial, f.nome_filial, fo.id_fornecedor, fo.nome_fornecedor
        ORDER BY f.nome_filial, fo.nome_fornecedor`
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro em relatorioFornecedoresPorFilial:', error);
    res.status(500).json({ error: 'Erro interno ao gerar relatório de fornecedores por filial' });
  }
};


// RELATÓRIO: Pagamentos por filial
export const relatorioPagamentosPorFilial = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
            f.id_filial,
            f.nome_filial,
            SUM(pg.valor_pagamento) AS total_pago,
            COUNT(pg.id_pagamento) AS total_pagamentos
        FROM Pagamentos pg
        JOIN OrdemCompra oc ON pg.id_ordem_compra = oc.id_ordem_compra
        JOIN OrdemCompraPedidoFilial ocpf ON oc.id_ordem_compra = ocpf.id_ordem_compra
        JOIN PedidoFilial p ON ocpf.id_pedido_filial = p.id_pedido_filial
        JOIN Filial f ON p.id_filial = f.id_filial
        GROUP BY f.id_filial, f.nome_filial
        ORDER BY f.nome_filial;`
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro em relatorioPagamentosPorFilial:', error);
    res.status(500).json({ error: 'Erro interno ao gerar relatório de pagamentos por filial' });
  }
};

// RELATÓRIO: Previsão de Pedidos (baseado no histórico de PedidoFilial)
export const relatorioPrevisaoPedido = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        f.id_filial,
        f.nome_filial,
        DATE_FORMAT(p.data_pedido, '%Y-%m') AS mes,
        COUNT(*) AS total_pedidos
      FROM PedidoFilial p
      JOIN Filial f ON p.id_filial = f.id_filial
      GROUP BY f.id_filial, f.nome_filial, mes
      ORDER BY f.id_filial, mes;
    `);

    const agrupadoPorFilial = {};

    rows.forEach(row => {
      const { id_filial, nome_filial, mes, total_pedidos } = row;
      if (!agrupadoPorFilial[id_filial]) {
        agrupadoPorFilial[id_filial] = {
          nome_filial,
          historico: [],
        };
      }
      agrupadoPorFilial[id_filial].historico.push({ mes, total_pedidos });
    });

    const resultadoFinal = Object.entries(agrupadoPorFilial).map(([id_filial, { nome_filial, historico }]) => {
      const ultimos3 = historico.slice(-3);
      const media = Math.round(ultimos3.reduce((acc, h) => acc + h.total_pedidos, 0) / ultimos3.length || 0);

      const mesesFuturos = ["2025-06", "2025-07", "2025-08"].map(m => ({
        mes: m,
        total_pedidos: media,
        previsao: true,
      }));

      return {
        id_filial: Number(id_filial),
        nome_filial,
        dados: [...historico.map(h => ({ ...h, previsao: false })), ...mesesFuturos],
      };
    });

    res.json(resultadoFinal);
  } catch (error) {
    console.error('Erro em relatorioPrevisaoPedido:', error);
    res.status(500).json({ error: 'Erro interno ao gerar relatório de previsão de pedidos' });
  }
};

// RELATÓRIO: Status por Estoque (normal, baixo, critico)
export const relatorioStatusPorEstoque = async (req, res) => {
  try {
    const { id_filial } = req.query;

    let query = `
      SELECT status_estoque AS name, COUNT(*) AS value
      FROM Estoque
    `;
    const params = [];

    if (id_filial) {
      query += ` WHERE id_filial = ?`;
      params.push(id_filial);
    }

    query += ` GROUP BY status_estoque`; // Não tem ORDER BY, então OK

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar status de estoque:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

// RELATÓRIO: Estoque Por Produto (id_filial agora é opcional)
export const relatorioEstoquePorProduto = async (req, res) => {
  const { id_filial } = req.query; // Torna id_filial opcional

  try {
    let query = `
      SELECT Produtos.nome_produto AS name, Estoque.quantidade AS estoque_quantidade
      FROM Estoque
      JOIN Produtos ON Produtos.id_produto = Estoque.id_produto
    `;
    const params = [];

    if (id_filial) {
      query += ` WHERE Estoque.id_filial = ?`;
      params.push(id_filial);
    }

    query += `;`; // Não tem GROUP BY, então OK

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar estoque por produto:', error);
    res.status(500).json({ error: 'Erro interno ao buscar estoque por produto' });
  }
};

// RELATÓRIO: Compras por Mês (id_filial agora é opcional)
export const relatorioComprasPorMes = async (req, res) => {
  const { id_filial } = req.query; // Torna id_filial opcional

  try {
    let query = `
      SELECT
        MONTH(oc.data_ordem) AS mes,
        DATE_FORMAT(oc.data_ordem, '%b') AS month_abbr,
        SUM(oc.valor_total) AS valor_total_compras
      FROM OrdemCompra oc
      JOIN OrdemCompraPedidoFilial ocpf ON oc.id_ordem_compra = ocpf.id_ordem_compra
      JOIN PedidoFilial pf ON ocpf.id_pedido_filial = pf.id_pedido_filial
    `;
    const params = [];

    if (id_filial) { // Filtrar pela filial se o id for fornecido
      query += ` WHERE pf.id_filial = ?`;
      params.push(id_filial);
    }

    query += ` GROUP BY mes, month_abbr ORDER BY mes;`; // Ajustado para incluir month_abbr no GROUP BY

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar compras por mês:", error);
    res.status(500).json({ error: "Erro interno ao buscar compras por mês" });
  }
};

// RELATÓRIO DE ESTOQUE CRÍTICO / ALERTAS (Tabela paginada)
export const relatorioEstoqueAlertas = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const {
    nome_produto,
    id_produto,
    id_fornecedor,
    id_filial
  } = req.query;

  const conditions = [`e.status_estoque IN ('critico','baixo')`];
  const values = [];

  if (nome_produto) {
    conditions.push(`p.nome_produto LIKE ?`);
    values.push(`%${nome_produto}%`);
  }
  if (id_produto) {
    conditions.push(`e.id_produto = ?`);
    values.push(id_produto);
  }
  if (id_fornecedor) {
    conditions.push(`e.id_fornecedor = ?`);
    values.push(id_fornecedor);
  }
  if (id_filial) {
    conditions.push(`e.id_filial = ?`);
    values.push(id_filial);
  }

  const whereClause = `WHERE ` + conditions.join(" AND ");

  try {
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total
        FROM Estoque e
        JOIN Produtos p ON e.id_produto = p.id_produto
        JOIN Fornecedor f ON e.id_fornecedor = f.id_fornecedor
        JOIN Filial fi ON e.id_filial = fi.id_filial
        ${whereClause}`,
      values
    );
    const totalRecords = countResult[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    const [rows] = await pool.query(
      `SELECT
          p.nome_produto,
          f.nome_fornecedor,
          fi.nome_filial,
          e.quantidade,
          e.status_estoque
        FROM Estoque e
        JOIN Produtos p ON e.id_produto = p.id_produto
        JOIN Fornecedor f ON e.id_fornecedor = f.id_fornecedor
        JOIN Filial fi ON e.id_filial = fi.id_filial
        ${whereClause}
        LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    return res.json({
      data: rows,
      page,
      limit,
      totalRecords,
      totalPages
    });
  } catch (error) {
    console.error("Erro em relatorioEstoqueAlertas:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao listar alertas de estoque" });
  }
};

// RELATÓRIO: Produtos Vencidos (ajustado ao esquema do BD)
export const relatorioProdutosVencidosDanificados = async (req, res) => {
  const { id_filial } = req.query;

  try {
    let query = `
      SELECT
        F.id_filial, -- Adicionado para o GROUP BY
        F.nome_filial,
        SUM(L.quantidade) AS vencidos_quantidade_total
      FROM Lote L
      JOIN Produtos P ON L.id_produto = P.id_produto
      JOIN Estoque E ON L.id_produto = E.id_produto AND L.id_lote = E.id_lote
      JOIN Filial F ON E.id_filial = F.id_filial
      WHERE L.data_validade < CURDATE()
    `;
    const params = [];

    if (id_filial) {
      query += ` AND E.id_filial = ?`;
      params.push(id_filial);
    }

    query += ` GROUP BY F.id_filial, F.nome_filial ORDER BY F.nome_filial`; // Ajustado para incluir id_filial

    const [rows] = await pool.query(query, params);

    const formattedRows = rows.map(row => ({
      nome_filial: row.nome_filial,
      vencidos: row.vencidos_quantidade_total || 0,
      danificados: 0
    }));

    res.json(formattedRows);
  } catch (error) {
    console.error('Erro em relatorioProdutosVencidosDanificados:', error);
    res.status(500).json({ error: 'Erro interno ao gerar relatório de produtos vencidos/danificados' });
  }
};
