import pool from '../config/db.js';

export const listarFormaPagamento = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  try {
    const [countResult] = await pool.query(
      'SELECT COUNT(*) AS total FROM FormaPagamento'
    );
    const totalRecords = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT * FROM FormaPagamento
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const totalPages = Math.ceil(totalRecords / limit);
    res.json({ data: rows, page, limit, totalRecords, totalPages });
  } catch (error) {
    console.error('Erro em listar FormaPagamento', error);
    res.status(500).json({ error: 'Erro interno listar FormaPagamento' });
  }
};

// READ (single)
export const visualizarFormaPagamento = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM FormaPagamento WHERE id_forma_pagamento = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'FormaPagamento não encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro em visualizar FormaPagamento', error);
    res.status(500).json({ message: 'Erro interno ao visualizar FormaPagamento' });
  }
};

export const criarFormaPagamento = async (req, res) => {
  const { descricao } = req.body;
  if (!descricao) return res.status(400).json({ message: 'Nome obrigatório' });
  const [result] = await pool.query(
    'INSERT INTO FormaPagamento (descricao) VALUES (?)',
    [descricao]
  );
  res.status(201).json({ id_forma_pagamento: result.insertId, descricao });
};

export const atualizarFormaPagamento = async (req, res) => {
  const { id } = req.params;
  const { descricao } = req.body;
  const [result] = await pool.query(
    'UPDATE FormaPagamento SET descricao = ? WHERE id_forma_pagamento = ?',
    [descricao, id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Não encontrado' });
  res.json({ message: 'Atualizado' });
};

export const removerFormaPagamento = async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query(
    'DELETE FROM FormaPagamento WHERE id_forma_pagamento = ?',
    [id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Não encontrado' });
  res.json({ message: 'Removido' });
};