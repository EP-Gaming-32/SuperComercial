import pool from '../config/db.js';

export const listarFilial = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const { id_filial, nome_filial, endereco_filial, gestor_filial } = req.query;

  const conditions = ['ativo = TRUE'];
  const values = [];

  if (id_filial) {
    conditions.push('id_filial = ?');
    values.push(id_filial);
  }
  if (nome_filial) {
    conditions.push('nome_filial LIKE ?');
    values.push(`%${nome_filial}%`);
  }
  if (endereco_filial) {
    conditions.push('endereco_filial LIKE ?');
    values.push(`%${endereco_filial}%`);
  }
  if (gestor_filial) {
    conditions.push('gestor_filial LIKE ?');
    values.push(`%${gestor_filial}%`);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  try {
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM Filial ${whereClause}`,
      values
    );
    const totalRecords = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT * FROM Filial
          ${whereClause}
          ORDER BY id_filial ASC
          LIMIT ? OFFSET ?`,
      [...values, limit, offset]
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
      `SELECT * FROM Filial WHERE id_filial = ? AND ativo = TRUE`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Filial não encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro em visualizar filial', error);
    res.status(500).json({ message: 'Erro interno ao visualizar filial' });
  }
};

export const criarFilial = async (req, res) => {
  const { nome_filial, endereco_filial, telefone_filial, email_filial, gestor_filial, observacao } = req.body;

  if (!nome_filial) return res.status(400).json({ message: 'Nome da Filial é obrigatório.' });
  if (!endereco_filial) return res.status(400).json({ message: 'Endereço da Filial é obrigatório.' });

  try {
    // --- INÍCIO: VERIFICAÇÃO DE DUPLICIDADE (CRIAR) ---
    // 1. Verificar por nome_filial existente
    const [existingByName] = await pool.query(
      `SELECT id_filial FROM Filial WHERE nome_filial = ? AND ativo = TRUE`,
      [nome_filial]
    );

    if (existingByName.length > 0) {
      return res.status(409).json({ message: 'Filial já cadastrada com este nome.' });
    }

    // 2. Verificar por E-mail existente (se email_filial não for vazio e for considerado único)
    if (email_filial) {
      const [existingByEmail] = await pool.query(
        `SELECT id_filial FROM Filial WHERE email_filial = ? AND ativo = TRUE`,
        [email_filial]
      );

      if (existingByEmail.length > 0) {
        return res.status(409).json({ message: 'Filial já cadastrada com este E-mail.' });
      }
    }
    // --- FIM: VERIFICAÇÃO DE DUPLICIDADE (CRIAR) ---

    const [result] = await pool.query(
      'INSERT INTO Filial (nome_filial, endereco_filial, telefone_filial, email_filial, gestor_filial, observacao) VALUES (?, ?, ?, ?, ?, ?)',
      [nome_filial, endereco_filial, telefone_filial, email_filial, gestor_filial, observacao]
    );
    res.status(201).json({ id_filial: result.insertId, nome_filial, endereco_filial, telefone_filial, email_filial, gestor_filial, observacao });
  } catch (error) {
    console.error('Erro ao criar filial', error);
    res.status(500).json({ message: 'Erro ao criar filial' });
  }
};

export const atualizarFilial = async (req, res) => {
  const { id } = req.params;
  const { nome_filial, endereco_filial, telefone_filial, email_filial, gestor_filial, observacao } = req.body; // Desestrutura os campos

  // Campos que podem ser atualizados
  const camposPermitidos = [
    'nome_filial', 'endereco_filial', 'telefone_filial', 'email_filial',
    'gestor_filial', 'observacao'
  ];

  const fields = [];
  const values = [];
  for (const campo of camposPermitidos) {
    // Adiciona o campo à lista de atualização apenas se ele estiver presente no corpo da requisição
    if (req.body[campo] !== undefined) { 
      fields.push(`${campo} = ?`);
      values.push(req.body[campo]);
    }
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'Nenhuma alteração enviada.' });
  }

  // --- INÍCIO: VERIFICAÇÃO DE DUPLICIDADE (ATUALIZAR) ---
  try {
    // 1. Verificar nome_filial existente (que não seja o da própria filial)
    if (nome_filial !== undefined) { // Verifica se nome_filial está sendo atualizado
      const [existingByName] = await pool.query(
        `SELECT id_filial FROM Filial WHERE nome_filial = ? AND id_filial != ? AND ativo = TRUE`,
        [nome_filial, id]
      );
      if (existingByName.length > 0) {
        return res.status(409).json({ message: 'Nome da filial já cadastrado para outra filial ativa.' });
      }
    }

    // 2. Verificar email_filial existente (que não seja o da própria filial)
    if (email_filial !== undefined && email_filial) { // Verifica se email_filial está sendo atualizado e não é vazio
      const [existingByEmail] = await pool.query(
        `SELECT id_filial FROM Filial WHERE email_filial = ? AND id_filial != ? AND ativo = TRUE`,
        [email_filial, id]
      );
      if (existingByEmail.length > 0) {
        return res.status(409).json({ message: 'E-mail já cadastrado para outra filial ativa.' });
      }
    }
  } catch (error) {
    console.error('Erro na verificação de duplicidade ao atualizar filial:', error);
    return res.status(500).json({ message: 'Erro interno na validação de duplicidade.' });
  }
  // --- FIM: VERIFICAÇÃO DE DUPLICIDADE (ATUALIZAR) ---

  try {
    const sql = `UPDATE Filial SET ${fields.join(', ')}, data_atualizacao = CURRENT_TIMESTAMP WHERE id_filial = ?`;
    const [result] = await pool.query(sql, [...values, id]);

    if (result.affectedRows === 0) {
      // Se 0 linhas foram afetadas, pode ser que a filial não foi encontrada ou os dados eram idênticos
      return res.status(404).json({ message: 'Filial não encontrada ou nenhum dado foi alterado.' });
    }

    res.json({ message: 'Filial atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar filial:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar filial' });
  }
};

export const removerFilial = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      `UPDATE Filial
          SET ativo = FALSE,
              data_atualizacao = CURRENT_TIMESTAMP
        WHERE id_filial = ? AND ativo = TRUE`,
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Filial não encontrada ou já inativa' });
    }

    res.json({ message: 'Filial inativada com sucesso' });
  } catch (error) {
    console.error('Erro ao inativar filial', error);
    res.status(500).json({ message: 'Erro interno ao inativar filial' });
  }
};