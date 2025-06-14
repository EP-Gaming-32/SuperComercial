import pool from '../config/db.js';

// Listar produtos (só ativos, com fornecedores ativos)
export const listarProdutos = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const { nome_produto, id_grupo, id_fornecedor, unidade_medida } = req.query;

  const conditions = ['p.ativo = TRUE'];
  const values = [];

  if (nome_produto) {
    conditions.push('p.nome_produto LIKE ?');
    values.push(`%${nome_produto}%`);
  }
  if (id_grupo) {
    conditions.push('p.id_grupo = ?');
    values.push(id_grupo);
  }
  if (id_fornecedor) {
    conditions.push('pf.id_fornecedor = ? AND pf.ativo = TRUE');
    values.push(id_fornecedor);
  }
  if (unidade_medida) {
    conditions.push('p.unidade_medida = ?');
    values.push(unidade_medida);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  try {
    const [countResult] = await pool.query(
      `SELECT COUNT(DISTINCT p.id_produto) AS total
       FROM Produtos p
       LEFT JOIN ProdutoFornecedor pf ON pf.id_produto = p.id_produto
       ${whereClause}`,
      values
    );
    const totalRecords = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT
         p.*,
         g.nome_grupo,
         f.nome_fornecedor
       FROM Produtos p
       LEFT JOIN Grupos g ON p.id_grupo = g.id_grupo
       LEFT JOIN ProdutoFornecedor pf ON pf.id_produto = p.id_produto AND pf.ativo = TRUE
       LEFT JOIN Fornecedor f ON pf.id_fornecedor = f.id_fornecedor
       ${whereClause}
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const totalPages = Math.ceil(totalRecords / limit);
    res.json({ data: rows, page, limit, totalRecords, totalPages });
  } catch (error) {
    console.error('Erro em listar produtos', error);
    res.status(500).json({ error: 'Erro interno listar produtos' });
  }
};

// Listar produtos únicos (só ativos)
export const listarProdutosUnicos = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const { nome_produto, id_grupo, unidade_medida } = req.query;
  const conditions = ['ativo = TRUE'];
  const values = [];

  if (nome_produto) {
    conditions.push('nome_produto LIKE ?');
    values.push(`%${nome_produto}%`);
  }
  if (id_grupo) {
    conditions.push('id_grupo = ?');
    values.push(id_grupo);
  }
  if (unidade_medida) {
    conditions.push('unidade_medida = ?');
    values.push(unidade_medida);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  try {
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM Produtos
       ${whereClause}`,
      values
    );
    const totalRecords = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT
         p.*,
         g.nome_grupo
       FROM Produtos p
       LEFT JOIN Grupos g ON p.id_grupo = g.id_grupo
       ${whereClause}
       ORDER BY p.id_produto
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const totalPages = Math.ceil(totalRecords / limit);
    res.json({ data: rows, page, limit, totalRecords, totalPages });
  } catch (error) {
    console.error('Erro em listar produtos únicos', error);
    res.status(500).json({ error: 'Erro interno ao listar produtos' });
  }
};

// Criar produto
export const criarProduto = async (req, res) => {
  const {
    sku,
    nome_produto,
    id_grupo,
    valor_produto,
    prazo_validade,
    unidade_medida,
    codigo_barras,
    id_fornecedor,
    preco_compra,
    prazo_entrega,
    condicoes_pagamento
  } = req.body;

  if (!sku || !nome_produto || !valor_produto) {
    return res.status(400).json({ message: 'Campos obrigatórios faltando' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO Produtos
         (sku, nome_produto, id_grupo, valor_produto, prazo_validade, unidade_medida, codigo_barras)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sku, nome_produto, id_grupo || null, valor_produto, prazo_validade || null, unidade_medida, codigo_barras]
    );
    const productId = result.insertId;

    if (id_fornecedor) {
      await pool.query(
        `INSERT INTO ProdutoFornecedor
           (id_produto, id_fornecedor, preco, prazo_entrega, condicoes_pagamento)
         VALUES (?, ?, ?, ?, ?)`,
        [productId, id_fornecedor, preco_compra, prazo_entrega, condicoes_pagamento]
      );
    }

    res.status(201).json({ message: 'Produto registrado com sucesso!', id_produto: productId });
  } catch (error) {
    console.error('Erro em criar produto', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'SKU ou código de barras duplicado' });
    }
    res.status(500).json({ error: 'Erro interno ao criar produto' });
  }
};

// Visualizar produto (só ativo)
export const visualizarProduto = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT
         p.*,
         g.nome_grupo,
         pf.id_fornecedor,
         f.nome_fornecedor,
         pf.preco AS preco_compra,
         pf.prazo_entrega,
         pf.condicoes_pagamento
       FROM Produtos p
       LEFT JOIN Grupos g ON p.id_grupo = g.id_grupo
       LEFT JOIN ProdutoFornecedor pf ON pf.id_produto = p.id_produto AND pf.ativo = TRUE
       LEFT JOIN Fornecedor f ON pf.id_fornecedor = f.id_fornecedor
       WHERE p.id_produto = ? AND p.ativo = TRUE`,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro em visualizar produto', error);
    res.status(500).json({ message: 'Erro interno ao visualizar produto' });
  }
};

// Atualizar produto
export const atualizarProduto = async (req, res) => {
  const { id } = req.params;
  const dados = req.body;
  const {
    id_fornecedor,
    preco_compra,
    prazo_entrega,
    condicoes_pagamento
  } = req.body;

  const camposPermitidos = [
    'sku','nome_produto','id_grupo','valor_produto',
    'prazo_validade','unidade_medida','codigo_barras'
  ];

  const fields = [];
  const values = [];
  for (const campo of camposPermitidos) {
    if (dados[campo] !== undefined) {
      fields.push(`${campo} = ?`);
      values.push(dados[campo]);
    }
  }

  if (!fields.length) {
    return res.status(400).json({ message: 'Nenhuma alteração feita' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE Produtos
         SET ${fields.join(', ')}, data_atualizacao = CURRENT_TIMESTAMP
       WHERE id_produto = ? AND ativo = TRUE`,
      [...values, id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Produto não encontrado ou inativo' });
    }

    // atualizar relação fornecedor, se houver
    const [pfResult] = await pool.query(
      `UPDATE ProdutoFornecedor
         SET preco = ?, prazo_entrega = ?, condicoes_pagamento = ?, data_atualizacao = CURRENT_TIMESTAMP
       WHERE id_produto = ? AND ativo = TRUE`,
      [preco_compra, prazo_entrega, condicoes_pagamento, id]
    );
    if (!pfResult.affectedRows && id_fornecedor) {
      await pool.query(
        `INSERT INTO ProdutoFornecedor
           (id_produto, id_fornecedor, preco, prazo_entrega, condicoes_pagamento)
         VALUES (?, ?, ?, ?, ?)`,
        [id, id_fornecedor, preco_compra, prazo_entrega, condicoes_pagamento]
      );
    }

    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    console.error('Erro em atualizar produto', error);
    res.status(500).json({ message: 'Erro interno ao atualizar produto' });
  }
};

// Remoção lógica de produto
export const removerProduto = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      `UPDATE Produtos
         SET ativo = FALSE, data_atualizacao = CURRENT_TIMESTAMP
       WHERE id_produto = ? AND ativo = TRUE`,
      [id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Produto não encontrado ou já inativo' });
    }
    res.json({ message: 'Produto inativado com sucesso' });
  } catch (error) {
    console.error('Erro em remover produto', error);
    res.status(500).json({ message: 'Erro interno ao inativar produto' });
  }
};
