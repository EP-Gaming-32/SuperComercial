import pool from '../config/db.js';

export const listarHistoricoPedido = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  try {
    const [countResult] = await pool.query(
      'SELECT COUNT(*) AS total FROM HistoricoStatusPedido'
    );
    const totalRecords = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT h.id_historico, h.id_pedido, s.nome_status, h.data_atualizacao
       FROM HistoricoStatusPedido h
       JOIN StatusPedido s ON h.id_status = s.id_status
       ORDER BY h.data_atualizacao DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const totalPages = Math.ceil(totalRecords / limit);
    res.json({ data: rows, page, limit, totalRecords, totalPages });
  } catch (error) {
    console.error('Erro em listar histórico', error);
    res.status(500).json({ error: 'Erro interno ao listar histórico' });
  }
};

// READ (single)
export const visualizarHistoricoPedido = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT h.id_historico, h.id_pedido, s.nome_status, h.data_atualizacao
       FROM HistoricoStatusPedido h
       JOIN StatusPedido s ON h.id_status = s.id_status
       WHERE h.id_pedido = ?
       ORDER BY h.data_atualizacao DESC`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Histórico não encontrado para esse pedido' });
    }

    res.json(rows);
  } catch (error) {
    console.error('Erro ao visualizar histórico', error);
    res.status(500).json({ message: 'Erro interno ao visualizar histórico' });
  }
};

export const trocarStatusPedido = async (req, res) => {
  const { id_pedido, id_status } = req.body;

  if (!id_pedido || !id_status) {
    return res.status(400).json({ message: 'ID do pedido e status são obrigatórios' });
  }

  try {
    await pool.query(
      'INSERT INTO HistoricoStatusPedido (id_pedido, id_status) VALUES (?, ?)',
      [id_pedido, id_status]
    );
    res.status(201).json({ message: 'Status atualizado no histórico' });
  } catch (error) {
    console.error('Erro ao trocar status do pedido', error);
    res.status(500).json({ message: 'Erro ao trocar status' });
  }
};
