// controllers/estoque.js
import pool from '../config/db.js';

export const listarEstoque = async (req, res) => {
  const page  = parseInt(req.query.page,10) || 1;
  const limit = parseInt(req.query.limit,10) || 10;
  const offset = (page - 1) * limit;

  const { id_produto, id_filial, id_lote, id_fornecedor, status_estoque } = req.query;
  const conditions = [];
  const values = [];

  if (id_produto) {
    conditions.push('e.id_produto = ?'); values.push(id_produto);
  }
  if (id_filial) {
    conditions.push('e.id_filial = ?'); values.push(id_filial);
  }
  if (id_lote) {
    conditions.push('e.id_lote = ?'); values.push(id_lote);
  }
  if (id_fornecedor) {
    conditions.push('e.id_fornecedor = ?'); values.push(id_fornecedor);
  }
  if (status_estoque) {
    conditions.push('e.status_estoque = ?'); values.push(status_estoque);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM Estoque e ${whereClause}`,
      values
    );
    const totalRecords = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT
         e.id_estoque,
         e.id_produto,
         p.nome_produto,
         e.id_fornecedor,
         f.nome_fornecedor,
         e.id_filial,
         fi.nome_filial,
         e.id_lote,
         l.codigo_lote,
         l.data_expedicao,
         l.data_validade,
         l.quantidade AS lote_quantidade,
         e.local_armazenamento,
         e.quantidade,
         e.estoque_minimo,
         e.estoque_maximo,
         e.status_estoque
       FROM Estoque e
       JOIN Produtos p    ON e.id_produto    = p.id_produto
       JOIN Fornecedor f  ON e.id_fornecedor = f.id_fornecedor
       JOIN Filial fi     ON e.id_filial     = fi.id_filial
       LEFT JOIN Lote l   ON e.id_lote       = l.id_lote
       ${whereClause}
       ORDER BY e.id_estoque DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    res.json({ data: rows, page, limit, totalRecords, totalPages: Math.ceil(totalRecords/limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao listar estoque' });
  }
};

export const visualizarEstoque = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT
         e.id_estoque,
         e.id_produto,
         p.nome_produto,
         e.id_fornecedor,
         f.nome_fornecedor,
         e.id_filial,
         fi.nome_filial,
         e.id_lote,
         l.codigo_lote,
         l.data_expedicao,
         l.data_validade,
         l.quantidade AS lote_quantidade,
         e.local_armazenamento,
         e.quantidade,
         e.estoque_minimo,
         e.estoque_maximo,
         e.status_estoque
       FROM Estoque e
       JOIN Produtos p    ON e.id_produto    = p.id_produto
       JOIN Fornecedor f  ON e.id_fornecedor = f.id_fornecedor
       JOIN Filial fi     ON e.id_filial     = fi.id_filial
       LEFT JOIN Lote l   ON e.id_lote       = l.id_lote
       WHERE e.id_estoque = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Estoque não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao visualizar estoque' });
  }
};

export const criarEstoque = async (req, res) => {
  const {
    id_produto,
    id_fornecedor,
    id_filial,
    local_armazenamento,
    quantidade,
    estoque_minimo,
    estoque_maximo,
    id_lote
  } = req.body;

  if (!id_produto || !id_fornecedor || !id_filial || quantidade == null) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO Estoque
         (id_produto, id_fornecedor, id_filial, local_armazenamento,
          quantidade, estoque_minimo, estoque_maximo, id_lote)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_produto,
        id_fornecedor,
        id_filial,
        local_armazenamento,
        quantidade,
        estoque_minimo ?? Math.ceil(quantidade * 0.2),
        estoque_maximo ?? quantidade * 2,
        id_lote || null
      ]
    );
    res.status(201).json({
      message: 'Estoque criado com sucesso.',
      data: { id_estoque: result.insertId }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao criar estoque' });
  }
};

export const atualizarEstoque = async (req, res) => {
  const { id } = req.params;
  const {
    id_lote,
    id_produto,
    id_fornecedor,
    id_filial,
    local_armazenamento,
    quantidade,
    estoque_minimo,
    estoque_maximo
  } = req.body;

  // Monta os campos dinâmicos de atualização
  const updatesArr = [];
  const vals = [];

  if (id_produto !== undefined) {
    updatesArr.push('id_produto = ?');
    vals.push(id_produto);
  }
  if (id_fornecedor !== undefined) {
    updatesArr.push('id_fornecedor = ?');
    vals.push(id_fornecedor);
  }
  if (id_filial !== undefined) {
    updatesArr.push('id_filial = ?');
    vals.push(id_filial);
  }
  if (local_armazenamento !== undefined) {
    updatesArr.push('local_armazenamento = ?');
    vals.push(local_armazenamento);
  }
  if (quantidade !== undefined) {
    updatesArr.push('quantidade = ?');
    vals.push(quantidade);
  }
  if (estoque_minimo !== undefined) {
    updatesArr.push('estoque_minimo = ?');
    vals.push(estoque_minimo);
  }
  if (estoque_maximo !== undefined) {
    updatesArr.push('estoque_maximo = ?');
    vals.push(estoque_maximo);
  }
  // Sempre atualiza id_lote (pode ser null)
  updatesArr.push('id_lote = ?');
  vals.push(id_lote || null);

  if (!updatesArr.length) {
    return res.status(400).json({ message: 'Nenhuma alteração enviada' });
  }

  const updates = updatesArr.join(', ');

  try {
    const [result] = await pool.query(
      `UPDATE Estoque SET ${updates} WHERE id_estoque = ?`,
      [...vals, id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Estoque não encontrado' });
    }
    res.json({ message: 'Estoque atualizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao atualizar estoque' });
  }
};

export const removerEstoque = async (req, res) => {
  const { id } = req.params;
  try {
    const [r] = await pool.query(`DELETE FROM Estoque WHERE id_estoque = ?`, [id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Estoque não encontrado' });
    res.json({ message: 'Estoque removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao remover estoque' });
  }
};