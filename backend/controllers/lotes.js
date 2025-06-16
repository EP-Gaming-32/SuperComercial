// controllers/lotes.js
import pool from '../config/db.js';

export const listarLotes = async (req, res) => {
  const page  = parseInt(req.query.page,10) || 1;
  const limit = parseInt(req.query.limit,10) || 10;
  const offset= (page - 1) * limit;

  // filtros
  const { id_produto, id_lote, codigo_lote, data_expedicao, data_validade, quantidade } = req.query;
  const conditions = [];
  const values = [];

  if (id_produto) {
    conditions.push('l.id_produto = ?');
    values.push(id_produto);
  }
  if (id_lote) {
    conditions.push('l.id_lote = ?');
    values.push(id_lote);
  }
  if (codigo_lote) {
    conditions.push('l.codigo_lote LIKE ?');
    values.push(`%${codigo_lote}%`);
  }
  if (data_expedicao) {
    conditions.push('DATE(l.data_expedicao) = ?');
    values.push(data_expedicao);
  }
  if (data_validade) {
    conditions.push('DATE(l.data_validade) = ?');
    values.push(data_validade);
  }
  if (quantidade) {
    conditions.push('l.quantidade = ?');
    values.push(quantidade);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM Lote l
       JOIN Produtos p ON l.id_produto = p.id_produto
       ${whereClause}`,
      values
    );
    const totalRecords = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT l.id_lote, l.id_produto, p.nome_produto,
         l.codigo_lote, l.data_expedicao, l.data_validade, l.quantidade
       FROM Lote l
       JOIN Produtos p ON l.id_produto = p.id_produto
       ${whereClause}
       ORDER BY l.id_lote DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const totalPages = Math.ceil(totalRecords / limit);
    res.json({ data: rows, page, limit, totalRecords, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao listar lotes' });
  }
};

export const visualizarLotes = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT l.id_lote, l.id_produto, p.nome_produto,
         l.codigo_lote, l.data_expedicao, l.data_validade, l.quantidade
       FROM Lote l
       JOIN Produtos p ON l.id_produto = p.id_produto
       WHERE l.id_lote = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Lote não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao visualizar lote' });
  }
};

export const criarLotes = async (req, res) => {
  const { id_produto, codigo_lote, data_expedicao, data_validade, quantidade } = req.body;
  if (!id_produto || !codigo_lote || !data_expedicao || quantidade == null) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO Lote
         (id_produto, codigo_lote, data_expedicao, data_validade, quantidade)
       VALUES (?, ?, ?, ?, ?)`,
      [id_produto, codigo_lote, data_expedicao, data_validade || null, quantidade]
    );
    res.status(201).json({ id_lote: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao criar lote' });
  }
};

export const atualizarLotes = async (req, res) => {
  const { id } = req.params;
  const campos = ['id_produto','codigo_lote','data_expedicao','data_validade','quantidade'];
  const updates = [];
  const vals = [];
  campos.forEach(c => {
    if (req.body[c] !== undefined) {
      updates.push(`${c} = ?`);
      vals.push(req.body[c]);
    }
  });
  if (!updates.length) return res.status(400).json({ message:'Nenhuma alteração enviada' });
  try {
    const [r] = await pool.query(
      `UPDATE Lote SET ${updates.join(', ')} WHERE id_lote = ?`,
      [...vals, id]
    );
    if (!r.affectedRows) return res.status(404).json({ message:'Lote não encontrado' });
    res.json({ message:'Lote atualizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Erro interno ao atualizar lote' });
  }
};

export const removerLotes = async (req, res) => {
  const { id } = req.params;
  try {
    const [r] = await pool.query(`DELETE FROM Lote WHERE id_lote = ?`, [id]);
    if (!r.affectedRows) return res.status(404).json({ message:'Lote não encontrado' });
    res.json({ message:'Lote removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Erro interno ao remover lote' });
  }
};

export const listarLotesByEstoque = async (req, res) => {
  const { id_estoque } = req.query;
  if (!id_estoque) {
    return res.status(400).json({ message: 'id_estoque é obrigatório' });
  }
console.log('visualizarLotes, id recebido =', req.params.id);
  try {
    // 1. Buscar o registro de Estoque
    
    const [estoqueRows] = await pool.query(
      `SELECT id_lote
         FROM Estoque
        WHERE id_estoque = ?`,
      [id_estoque]
    );
console.log('visualizarLotes, id recebido =', req.params.id);
    if (!estoqueRows.length) {
      return res.status(404).json({ message: 'Estoque não encontrado' });
    }

    const { id_lote } = estoqueRows[0];
    if (id_lote == null) {
      // Não há lote vinculado a esse estoque
      return res.json({ data: [] });
    }

    // 2. Buscar dados do lote pelo id_lote obtido
    const [loteRows] = await pool.query(
      `SELECT l.id_lote,
              l.id_produto,
              p.nome_produto,
              l.codigo_lote,
              l.data_expedicao,
              l.data_validade,
              l.quantidade
         FROM Lote l
         JOIN Produtos p ON l.id_produto = p.id_produto
        WHERE l.id_lote = ?`,
      [id_lote]
    );

    if (!loteRows.length) {
      // Em princípio não deve ocorrer, visto que fk deveria garantir existência,
      // mas por precaução:
      return res.status(404).json({ message: 'Lote vinculado não encontrado' });
    }

    // Retorna como array (por consistência com outros endpoints que devolvem lista)
    res.json({ data: loteRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao listar lote por estoque' });
  }
};
