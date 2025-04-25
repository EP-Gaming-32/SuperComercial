import pool from '../config/db.js';

export const listarStatusPedido = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  try {
    const [countResult] = await pool.query(
      'SELECT COUNT(*) AS total FROM StatusPedido'
    );
    const totalRecords = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT * FROM StatusPedido
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const totalPages = Math.ceil(totalRecords / limit);
    res.json({ data: rows, page, limit, totalRecords, totalPages });
  } catch (error) {
    console.error('Erro em listar Status do Pedido', error);
    res.status(500).json({ error: 'Erro interno listar Status Pedido' });
  }
};

// READ (single)
export const visualizarStatusPedido = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM StatusPedido WHERE id_status = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Status de Pedido não encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro em visualizar Status de Pedido', error);
    res.status(500).json({ message: 'Erro interno ao visualizar Status de Pedido' });
  }
};

export const criarStatusPedido = async (req, res) => {
  const { descricao } = req.body;
  const [result] = await pool.query(
    'INSERT INTO StatusPedido (descricao) VALUES (?)',
    [descricao]
  );
  res.status(201).json({ id_status: result.insertId, descricao });
};

export const atualizarStatusPedido = async (req, res) => {
  const { id } = req.params;
  const { descricao } = req.body;
  const [result] = await pool.query(
    'UPDATE StatusPedido SET descricao = ? WHERE id_status = ?',
    [descricao, id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Não encontrado' });
  res.json({ message: 'Atualizado' });
};

export const removerStatusPedido = async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query(
    'DELETE FROM StatusPedido WHERE id_status = ?',
    [id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Não encontrado' });
  res.json({ message: 'Removido' });
};