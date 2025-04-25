import pool from '../config/db.js';

export const listarFornecedores = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  try {
    const [countResult] = await pool.query(
      'SELECT COUNT(*) AS total FROM Fornecedor'
    );
    const totalRecords = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT * FROM Fornecedor
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const totalPages = Math.ceil(totalRecords / limit);
    res.json({ data: rows, page, limit, totalRecords, totalPages });
  } catch (error) {
    console.error('Erro em listar fornecedor', error);
    res.status(500).json({ error: 'Erro interno listar fornecedor' });
  }
};

// READ (single)
export const visualizarFornecedor = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM Fornecedor WHERE id_fornecedor = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Fornecedor não encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro em visualizar fornecedor', error);
    res.status(500).json({ message: 'Erro interno ao visualizar fornecedor' });
  }
};

export const criarFornecedor = async (req, res) => {
  const { nome_fornecedor } = req.body;
  if (!nome_fornecedor) return res.status(400).json({ message: 'Nome obrigatório' });
  const [result] = await pool.query(
    'INSERT INTO Fornecedor (nome_fornecedor) VALUES (?)',
    [nome_fornecedor]
  );
  res.status(201).json({ id_fornecedor: result.insertId, nome_fornecedor });
};

export const atualizarFornecedor = async (req, res) => {
  const { id } = req.params;
  const { nome_fornecedor } = req.body;
  const [result] = await pool.query(
    'UPDATE Fornecedor SET nome_fornecedor = ? WHERE id_fornecedor = ?',
    [nome_fornecedor, id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Não encontrado' });
  res.json({ message: 'Atualizado' });
};

export const removerFornecedor = async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query(
    'DELETE FROM Fornecedor WHERE id_fornecedor = ?',
    [id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Não encontrado' });
  res.json({ message: 'Removido' });
};