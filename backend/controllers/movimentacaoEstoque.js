import pool from '../config/db.js';

export const listarMovimentacoes = async (req, res) => {
  const page  = parseInt(req.query.page,10)||1;
  const limit = parseInt(req.query.limit,10)||10;
  const offset= (page-1)*limit;
  try {
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM MovimentacaoEstoque`);
    const [rows] = await pool.query(
      `SELECT m.*,
              p.nome_produto,
              fi.nome_filial
         FROM MovimentacaoEstoque m
         JOIN Produtos p ON m.id_produto = p.id_produto
         JOIN Filial fi ON m.id_filial   = fi.id_filial
       LIMIT ? OFFSET ?`, [limit, offset]
    );
    res.json({ data: rows, page, limit, totalRecords: total, totalPages: Math.ceil(total/limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao listar movimentações' });
  }
};

export const visualizarMovimentacao = async (req, res) => {
  const { id } = req.params;
  try {
    const [[row]] = await pool.query(
      `SELECT m.*,
              p.nome_produto,
              fi.nome_filial
         FROM MovimentacaoEstoque m
         JOIN Produtos p ON m.id_produto = p.id_produto
         JOIN Filial fi ON m.id_filial   = fi.id_filial
       WHERE m.id_movimentacao = ?`, [id]
    );
    if (!row) return res.status(404).json({ message: 'Movimentação não encontrada' });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao visualizar movimentação' });
  }
};

export const criarMovimentacao = async (req, res) => {
  const { id_produto, id_filial, tipo_movimentacao, quantidade } = req.body;
  if (!id_produto||!id_filial||!tipo_movimentacao||quantidade==null) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
  }
  try {
    const [r] = await pool.query(
      `INSERT INTO MovimentacaoEstoque
       (id_produto,id_filial,tipo_movimentacao,quantidade)
       VALUES (?,?,?,?)`,
      [id_produto, id_filial, tipo_movimentacao, quantidade]
    );
    res.status(201).json({ id_movimentacao: r.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao criar movimentação' });
  }
};
