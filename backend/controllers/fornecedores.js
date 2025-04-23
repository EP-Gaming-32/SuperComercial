import pool from '../config/db.js';

export const listarFornecedores = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_fornecedor, nome_fornecedor FROM Fornecedor'
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    res.status(500).json({ message: 'Erro interno ao listar fornecedores' });
  }
};