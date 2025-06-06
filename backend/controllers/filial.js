import pool from '../config/db.js';

export const listarFilial = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  try {
    const [countResult] = await pool.query(
      'SELECT COUNT(*) AS total FROM Filial'
    );
    const totalRecords = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT * FROM Filial
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const totalPages = Math.ceil(totalRecords / limit);
    res.json({ data: rows, page, limit, totalRecords, totalPages });
  } catch (error) {
    console.error('Erro em listar filial', error);
    res.status(500).json({ error: 'Erro interno listar filial' });
  }
};


export const visualizarFilial = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM Filial WHERE id_filial = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Filial não encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro em visualizar filial', error);
    res.status(500).json({ message: 'Erro interno ao visualizar filial' });
  }
};

export const criarFilial = async (req, res) => {
  const { nome_filial, endereco_filial, telefone_filial, email_filial, gestor_filial, observacao } = req.body;
  
  if (!nome_filial) return res.status(400).json({ message: 'Nome obrigatório' });
  if (!endereco_filial) return res.status(400).json({ message: 'Endereço obrigatório' });

  try {
    const [result] = await pool.query(
      'INSERT INTO Filial (nome_filial, endereco_filial, telefone_filial, email_filial, gestor_filial, observacao) VALUES (?, ?, ?, ?, ?, ?)',
      [nome_filial, endereco_filial, telefone_filial, email_filial, gestor_filial, observacao]
    );
    res.status(201).json({ id_filial: result.insertId, nome_filial, endereco_filial, telefone_filial, email_filial, gestor_filial, observacao });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar filial' });
  }
};

export const atualizarFilial = async (req, res) => {
  const { id } = req.params;
  const dados = req.body;

  const camposPermitidos = [
    'nome_filial',
    'endereco_filial',
    'telefone_filial',
    'email_filial',
    'gestor_filial',
    'observacao'
  ];

  const fields = [];
  const values = [];
  for (const campo of camposPermitidos) {
    if (dados[campo] !== undefined) {
      fields.push(`${campo} = ?`);
      values.push(dados[campo]);
    }
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'Nenhuma alteração enviada.' });
  }

  try {
    const sql = `UPDATE Filial SET ${fields.join(', ')} WHERE id_filial = ?`;
    const [result] = await pool.query(sql, [...values, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Filial não encontrada.' });
    }

    res.json({ message: 'Filial atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar filial:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar filial' });
  }
};

export const removerFilial = async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query(
    'DELETE FROM Filial WHERE id_filial = ?',
    [id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Não encontrado' });
  res.json({ message: 'Removido' });
};