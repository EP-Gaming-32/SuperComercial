import pool from '../config/db.js';

export const listarGrupos = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  try {
    const [countResult] = await pool.query(
      'SELECT COUNT(*) AS total FROM Grupos'
    );
    const totalRecords = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT * FROM GRUPOS
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const totalPages = Math.ceil(totalRecords / limit);
    res.json({ data: rows, page, limit, totalRecords, totalPages });
  } catch (error) {
    console.error('Erro em listar grupos', error);
    res.status(500).json({ error: 'Erro interno listar grupos' });
  }
};


export const visualizarGrupo = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM Grupos WHERE id_grupo = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro em visualizar grupo', error);
    res.status(500).json({ message: 'Erro interno ao visualizar grupo' });
  }
};

export const criarGrupo = async (req, res) => {
  const { nome_grupo } = req.body;
  if (!nome_grupo) return res.status(400).json({ message: 'Nome obrigatório' });
  const [result] = await pool.query(
    'INSERT INTO Grupos (nome_grupo) VALUES (?)',
    [nome_grupo]
  );
  res.status(201).json({ id_grupo: result.insertId, nome_grupo });
};

export const atualizarGrupo = async (req, res) => {
  const { id } = req.params;
  const { nome_grupo } = req.body;
  const [result] = await pool.query(
    'UPDATE Grupos SET nome_grupo = ? WHERE id_grupo = ?',
    [nome_grupo, id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Não encontrado' });
  res.json({ message: 'Atualizado' });
};

export const removerGrupo = async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query(
    'DELETE FROM Grupos WHERE id_grupo = ?',
    [id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Não encontrado' });
  res.json({ message: 'Removido' });
};