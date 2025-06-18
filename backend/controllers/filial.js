import pool from '../config/db.js';

// Função de listar - Nenhuma alteração necessária aqui
export const listarFilial = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const { id_filial, nome_filial, endereco_filial, gestor_filial, telefone_filial } = req.query;
  const conditions = ['ativo = TRUE'];
  const values = [];

  if (id_filial) { conditions.push('id_filial = ?'); values.push(id_filial); }
  if (nome_filial) { conditions.push('nome_filial LIKE ?'); values.push(`%${nome_filial}%`); }
  if (endereco_filial) { conditions.push('endereco_filial LIKE ?'); values.push(`%${endereco_filial}%`); }
  if (gestor_filial) { conditions.push('gestor_filial LIKE ?'); values.push(`%${gestor_filial}%`); }
  if (telefone_filial) {
    const telefoneLimpo = telefone_filial.replace(/\D/g, '');
    if (telefoneLimpo) {
      conditions.push("REPLACE(REPLACE(REPLACE(REPLACE(telefone_filial, '(', ''), ')', ''), '-', ''), ' ', '') LIKE ?");
      values.push(`%${telefoneLimpo}%`);
    }
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  try {
    const [countResult] = await pool.query(`SELECT COUNT(*) AS total FROM Filial ${whereClause}`, values);
    const totalRecords = countResult[0].total;
    const [rows] = await pool.query(`SELECT * FROM Filial ${whereClause} ORDER BY id_filial ASC LIMIT ? OFFSET ?`, [...values, limit, offset]);
    const totalPages = Math.ceil(totalRecords / limit);
    res.json({ data: rows, page, limit, totalRecords, totalPages });
  } catch (error) {
    console.error('Erro em listar filial', error);
    res.status(500).json({ error: 'Erro interno listar filial' });
  }
};

// Função de visualizar - Nenhuma alteração necessária aqui
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

// Função de criar - Nenhuma alteração necessária aqui
export const criarFilial = async (req, res) => {
  const { nome_filial, endereco_filial, telefone_filial, email_filial, gestor_filial, observacao } = req.body;
  if (!nome_filial || !endereco_filial) {
    return res.status(400).json({ message: 'Nome e Endereço são obrigatórios.' });
  }
  const telefoneLimpoParaSalvar = telefone_filial ? telefone_filial.replace(/\D/g, '') : null;
  try {
    const [existingByName] = await pool.query(`SELECT id_filial FROM Filial WHERE nome_filial = ? AND ativo = TRUE`, [nome_filial]);
    if (existingByName.length > 0) {
      return res.status(409).json({ message: 'Filial já cadastrada com este nome.' });
    }
    if (email_filial) {
      const [existingByEmail] = await pool.query(`SELECT id_filial FROM Filial WHERE email_filial = ? AND ativo = TRUE`, [email_filial]);
      if (existingByEmail.length > 0) {
        return res.status(409).json({ message: 'Filial já cadastrada com este E-mail.' });
      }
    }
    const [result] = await pool.query(
      'INSERT INTO Filial (nome_filial, endereco_filial, telefone_filial, email_filial, gestor_filial, observacao) VALUES (?, ?, ?, ?, ?, ?)',
      [nome_filial, endereco_filial, telefoneLimpoParaSalvar, email_filial, gestor_filial, observacao]
    );
    res.status(201).json({ id_filial: result.insertId, ...req.body });
  } catch (error) {
    console.error('Erro ao criar filial:', error);
    res.status(500).json({ message: 'Erro ao criar filial' });
  }
};


// =============================================================
// FUNÇÃO DE ATUALIZAR - CORRIGIDA
// =============================================================
export const atualizarFilial = async (req, res) => {
  const { id } = req.params;
  // 1. Converte o ID da URL (que é texto) para um número inteiro.
  const filialId = parseInt(id, 10);

  // Verificação de segurança caso o ID não seja um número válido
  if (isNaN(filialId)) {
    return res.status(400).json({ message: 'ID da filial inválido.' });
  }

  // Limpa o telefone se ele for enviado na requisição
  if (req.body.telefone_filial !== undefined) {
    req.body.telefone_filial = req.body.telefone_filial ? req.body.telefone_filial.replace(/\D/g, '') : null;
  }
  
  const { nome_filial, email_filial } = req.body;
  const camposPermitidos = ['nome_filial', 'endereco_filial', 'telefone_filial', 'email_filial', 'gestor_filial', 'observacao'];
  const fields = [];
  const values = [];

  for (const campo of camposPermitidos) {
    if (req.body[campo] !== undefined) { 
      fields.push(`${campo} = ?`);
      values.push(req.body[campo]);
    }
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'Nenhuma alteração enviada.' });
  }

  try {
    // Verificação de duplicidade para o nome
    if (nome_filial !== undefined) {
      const [existingByName] = await pool.query(
        // 2. Usa o ID numérico na cláusula '!=' para garantir a comparação correta
        `SELECT id_filial FROM Filial WHERE nome_filial = ? AND id_filial != ? AND ativo = TRUE`,
        [nome_filial, filialId] 
      );
      if (existingByName.length > 0) {
        const conflictingId = existingByName[0].id_filial;
        return res.status(409).json({ message: `O nome "${nome_filial}" já está em uso por outra filial ativa (ID: ${conflictingId}).` });
      }
    }
    // Verificação de duplicidade para o email
    if (email_filial !== undefined && email_filial) {
      const [existingByEmail] = await pool.query(
        `SELECT id_filial FROM Filial WHERE email_filial = ? AND id_filial != ? AND ativo = TRUE`,
        [email_filial, filialId] // 2. Usa o ID numérico aqui também
      );
      if (existingByEmail.length > 0) {
        return res.status(409).json({ message: 'E-mail já cadastrado para outra filial ativa.' });
      }
    }
  } catch (error) {
    console.error('Erro na verificação de duplicidade ao atualizar filial:', error);
    return res.status(500).json({ message: 'Erro interno na validação de duplicidade.' });
  }

  try {
    const sql = `UPDATE Filial SET ${fields.join(', ')}, data_atualizacao = CURRENT_TIMESTAMP WHERE id_filial = ?`;
    // 3. Usa o ID numérico na query de atualização final
    const [result] = await pool.query(sql, [...values, filialId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Filial não encontrada ou nenhum dado foi alterado.' });
    }
    res.json({ message: 'Filial atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar filial:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar filial' });
  }
};


// Função de remover (inativar) - Nenhuma alteração necessária aqui
export const removerFilial = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      `UPDATE Filial SET ativo = FALSE, data_atualizacao = CURRENT_TIMESTAMP WHERE id_filial = ? AND ativo = TRUE`,
      [id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Filial não encontrada ou já inativa' });
    }
    res.json({ message: 'Filial inativada com sucesso' });
  } catch (error) {
    console.error('Erro ao inativar filial:', error);
    res.status(500).json({ message: 'Erro interno ao inativar filial' });
  }
};