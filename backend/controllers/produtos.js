import pool from '../config/db.js';

// READ (paginated, with group & supplier)
export const listarProdutos = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  try {
    const [countResult] = await pool.query(
      'SELECT COUNT(*) AS total FROM Produtos'
    );
    const totalRecords = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT
         p.*,
         g.nome_grupo,
         f.nome_fornecedor
       FROM Produtos p
       LEFT JOIN Grupos g ON p.id_grupo = g.id_grupo
       LEFT JOIN ProdutoFornecedor pf ON pf.id_produto = p.id_produto
       LEFT JOIN Fornecedor f ON pf.id_fornecedor = f.id_fornecedor
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const totalPages = Math.ceil(totalRecords / limit);
    res.json({ data: rows, page, limit, totalRecords, totalPages });
  } catch (error) {
    console.error('Erro em listar produtos', error);
    res.status(500).json({ error: 'Erro interno listar produtos' });
  }
};

// CREATE (with ProdutoFornecedor)
export const criarProduto = async (req, res) => {
  const { sku, nome_produto, id_grupo, valor_produto, prazo_validade,
          unidade_medida, codigo_barras, id_fornecedor,
          preco_compra, prazo_entrega, condicoes_pagamento } = req.body;

  if (!sku || !nome_produto || !valor_produto) {
    return res.status(400).json({ message: 'Campos obrigatórios faltando' });
  }

  // Validar FK Grupo
  if (id_grupo) {
    const [g] = await pool.query(
      'SELECT 1 FROM Grupos WHERE id_grupo = ?', [id_grupo]
    );
    if (!g.length) return res.status(400).json({ message: 'Grupo inválido' });
  }
  // Validar FK Fornecedor
  if (id_fornecedor) {
    const [f] = await pool.query(
      'SELECT 1 FROM Fornecedor WHERE id_fornecedor = ?', [id_fornecedor]
    );
    if (!f.length) return res.status(400).json({ message: 'Fornecedor inválido' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO Produtos
         (sku, nome_produto, id_grupo, valor_produto, prazo_validade, unidade_medida, codigo_barras)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sku, nome_produto, id_grupo || null, valor_produto,
       prazo_validade || null, unidade_medida, codigo_barras]
    );

    const productId = result.insertId;
    // Inserir em ProdutoFornecedor
    if (id_fornecedor) {
        await pool.query(
          `INSERT INTO ProdutoFornecedor
             (id_produto, id_fornecedor, preco, prazo_entrega, condicoes_pagamento)
           VALUES (?, ?, ?, ?, ?)`,
          [productId, id_fornecedor, preco_compra, prazo_entrega, condicoes_pagamento]
        );
      }

    return res.status(201).json({ message: 'Produto registrado com sucesso!', id_produto: productId });
  } catch (error) {
    console.error('Erro em criar produto', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'SKU ou código de barras duplicado' });
    }
    return res.status(500).json({ error: 'Erro interno ao criar produto' });
  }
};

// READ (single)
export const visualizarProduto = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT
         p.*,
         g.nome_grupo,
         pf.id_fornecedor,               -- <-- ADICIONAR AQUI
         f.nome_fornecedor,
         pf.preco      AS preco_compra,
         pf.prazo_entrega,
         pf.condicoes_pagamento
       FROM Produtos p
       LEFT JOIN Grupos g ON p.id_grupo = g.id_grupo
       LEFT JOIN ProdutoFornecedor pf ON pf.id_produto = p.id_produto
       LEFT JOIN Fornecedor f ON pf.id_fornecedor = f.id_fornecedor
       WHERE p.id_produto = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Produto não encontrado' });
    // agora rows[0].id_fornecedor estará definido (ou null, se não houver relação)
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro em visualizar produto', error);
    res.status(500).json({ message: 'Erro interno ao visualizar produto' });
  }
};

// UPDATE
export const atualizarProduto = async (req, res) => {
  const { id } = req.params;
  const dados = req.body;
  const { id_fornecedor, preco_compra, prazo_entrega, condicoes_pagamento } = req.body;

  // Validar FKs como em criarProduto...

  const camposPermitidos = ['sku','nome_produto','id_grupo','valor_produto',
                            'prazo_validade','unidade_medida','codigo_barras'];
  const fields = [], values = [];
  for (const c of camposPermitidos) {
    if (dados[c] !== undefined) {
      fields.push(`${c} = ?`);
      values.push(dados[c]);
    }
  }
  //if (!fields.length) return res.json({ message: 'Nenhuma alteração feita' });

  try {
    const [result] = await pool.query(
      `UPDATE Produtos SET ${fields.join(',')} WHERE id_produto = ?`,
      [...values, id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Produto não encontrado' });

    // Atualizar relacionamento ProdutoFornecedor
    const [updateResult] = await pool.query(
      `UPDATE ProdutoFornecedor
         SET id_fornecedor = ?, preco = ?, prazo_entrega = ?, condicoes_pagamento = ?
       WHERE id_produto = ?`,
      [id_fornecedor, preco_compra, prazo_entrega, condicoes_pagamento, id]
    );
    
    // 2) Se não havia nenhuma linha para esse produto, insere
    if (updateResult.affectedRows === 0) {
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

// DELETE
export const removerProduto = async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

  try {
    const [result] = await pool.query(
      'DELETE FROM Produtos WHERE id_produto = ?',
      [id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    console.error('Erro em remover produto', error);
    res.status(500).json({ message: 'Erro interno ao remover produto' });
  }
};