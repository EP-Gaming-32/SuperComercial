import pool from '../config/db.js';

// RELATÓRIO: Pedidos por filial (histórico por mês)
export const relatorioPedidosPorFilial = async (req, res) => {
  const { id_filial } = req.query;

  try {
    const [rows] = await pool.query(
      `SELECT
         DATE_FORMAT(p.data_pedido, '%Y-%m') AS mes,
         f.nome_filial,
         COUNT(p.id_pedido) AS total_pedidos,
         SUM(p.valor_total) AS valor_total_pedidos
       FROM Pedidos p
       LEFT JOIN Filial f ON p.id_filial = f.id_filial
       ${id_filial ? 'WHERE p.id_filial = ?' : ''}
       GROUP BY mes, f.nome_filial
       ORDER BY mes`,
      id_filial ? [id_filial] : []
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro em relatorioPedidosPorFilial:', error);
    res.status(500).json({ error: 'Erro interno ao gerar relatório de pedidos por filial' });
  }
};



// RELATÓRIO: Estoque por filial
export const relatorioEstoquePorFilial = async (req, res) => {
  const { id_filial } = req.query;

  try {
    let query = `
      SELECT
        f.nome_filial,
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

    query += ` ORDER BY f.nome_filial, p.nome_produto`;

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
         f.nome_filial,
         fo.nome_fornecedor
       FROM Pedidos p
       LEFT JOIN Filial f ON p.id_filial = f.id_filial
       LEFT JOIN Fornecedor fo ON p.id_fornecedor = fo.id_fornecedor
       WHERE f.nome_filial IS NOT NULL AND fo.nome_fornecedor IS NOT NULL
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
            f.nome_filial,
            SUM(pg.valor_pagamento) AS total_pago,
            COUNT(pg.id_pagamento) AS total_pagamentos
        FROM Pagamentos pg
        JOIN Pedidos p ON pg.id_pedido = p.id_pedido
        JOIN Filial f ON p.id_filial = f.id_filial
        GROUP BY f.id_filial;`
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro em relatorioPagamentosPorFilial:', error);
    res.status(500).json({ error: 'Erro interno ao gerar relatório de pagamentos por filial' });
  }
};

export const relatorioPrevisaoPedido = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        f.id_filial,
        f.nome_filial,
        DATE_FORMAT(p.data_pedido, '%Y-%m') AS mes,
        COUNT(*) AS total_pedidos
      FROM Pedidos p
      JOIN Filial f ON p.id_filial = f.id_filial
      GROUP BY f.id_filial, f.nome_filial, mes
      ORDER BY f.id_filial, mes;
    `);

    // Agrupar por filial e calcular média de pedidos nos últimos 3 meses:
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

// RELATÓRIO: Status por Estoque
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

    query += ` GROUP BY status_estoque`;

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar status de estoque:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};


// RELATÓRIO: Estoque Por Produto
export const relatorioEstoquePorProduto = async (req, res) => {
  try {
    const { id_filial } = req.query;

    if (!id_filial) {
      return res.status(400).json({ error: 'Parâmetro id_filial é obrigatório' });
    }

    const [rows] = await pool.query(
      `
      SELECT Produtos.nome_produto AS name, Estoque.quantidade_estoque AS estoque
      FROM Estoque
      JOIN Produtos ON Produtos.id_produto = Estoque.id_produto
      WHERE Estoque.id_filial = ?;
      `,
      [id_filial]
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar estoque por produto:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

export const relatorioComprasPorMes = async (req, res) => {
  try {
    const { id_filial } = req.query;

    if (!id_filial) {
      return res.status(400).json({ error: "Parâmetro id_filial é obrigatório" });
    }

    const [rows] = await pool.query(
      `
      SELECT 
        MONTH(data_compra) AS mes,
        DATE_FORMAT(data_compra, '%b') AS month,
        SUM(valor_total) AS valor_total
      FROM Compras
      WHERE id_filial = ?
      GROUP BY mes, month
      ORDER BY mes;
      `,
      [id_filial]
    );

    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar compras por mês:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
};

// Exemplo de controller em Node.js
export const relatorioEstoqueCritico = async (req, res) => {
  const { status } = req.query; // espera 'critico'
  const [rows] = await pool.query(
    `SELECT p.nome_produto, f.nome_filial, e.quantidade
     FROM Estoque e
     JOIN Produtos p ON e.id_produto = p.id_produto
     JOIN Filial f   ON e.id_filial   = f.id_filial
     WHERE e.status_estoque = ?`,
    [status]
  );
  res.json(rows);
};
