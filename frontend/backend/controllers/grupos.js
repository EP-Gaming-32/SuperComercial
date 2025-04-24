import pool from '../config/db.js';

export const listarGrupos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_grupo, nome_grupo FROM Grupos'
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar grupos:', error);
    res.status(500).json({ message: 'Erro interno ao listar grupos' });
  }
};