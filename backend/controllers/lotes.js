import pool from '../config/db.js';

export const listarLotes = async (req, res) => {
  const page  = parseInt(req.query.page,10)||1;
  const limit = parseInt(req.query.limit,10)||10;
  const offset= (page-1)*limit;
  try {
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM Lote`);
    const [rows] = await pool.query(
      `SELECT l.*, p.nome_produto 
         FROM Lote l
         JOIN Produtos p ON l.id_produto = p.id_produto
       LIMIT ? OFFSET ?`, [limit, offset]
    );
    res.json({ data: rows, page, limit, totalRecords: total, totalPages: Math.ceil(total/limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao listar lotes' });
  }
};

export const visualizarLotes = async (req, res) => {
  const { id } = req.params;
  try {
    const [[lote]] = await pool.query(
      `SELECT l.*, p.nome_produto
         FROM Lote l
         JOIN Produtos p ON l.id_produto = p.id_produto
       WHERE l.id_lote = ?`, [id]
    );
    if (!lote) return res.status(404).json({ message: 'Lote não encontrado' });
    res.json(lote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao visualizar lote' });
  }
};

export const criarLotes = async (req, res) => {
  const { id_produto, codigo_lote, data_expedicao, data_validade, quantidade } = req.body;
  if (!id_produto||!codigo_lote||!data_expedicao||quantidade==null)
    return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
  try {
    const [result] = await pool.query(
      `INSERT INTO Lote
         (id_produto, codigo_lote, data_expedicao, data_validade, quantidade)
       VALUES (?, ?, ?, ?, ?)`,
      [id_produto, codigo_lote, data_expedicao, data_validade||null, quantidade]
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
  const updates = [], vals = [];
  for (const c of campos) {
    if (req.body[c]!==undefined) {
      updates.push(`${c} = ?`);
      vals.push(req.body[c]);
    }
  }
  if (!updates.length) return res.status(400).json({ message:'Nenhuma alteração' });
  try {
    const [r] = await pool.query(
      `UPDATE Lote SET ${updates.join(', ')} WHERE id_lote = ?`,
      [...vals, id]
    );
    if (!r.affectedRows) return res.status(404).json({ message:'Lote não encontrado' });
    res.json({ message:'Lote atualizado' });
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
    res.json({ message:'Lote removido' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Erro interno ao remover lote' });
  }
};
