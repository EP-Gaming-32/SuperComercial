import pool from '../config/db.js';

// Helper para construir cláusulas WHERE dinâmicas
const buildWhereClause = (filters, params) => {
  const clauses = ['ativo = TRUE'];

  if (filters.id_grupo) {
    clauses.push('id_grupo = ?');
    params.push(parseInt(filters.id_grupo, 10));
  }
  if (filters.nome_grupo) {
    clauses.push('nome_grupo LIKE ?');
    params.push(`%${filters.nome_grupo}%`);
  }

  return clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
};

export const listarGrupos = async (req, res) => {
  const { page = 1, limit = 10, id_grupo, nome_grupo } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  const filters = { id_grupo, nome_grupo };
  const paramsCount = [];
  const whereClause = buildWhereClause(filters, paramsCount);

  try {
    // Total de registros ativos com filtros
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM Grupos ${whereClause}`,
      paramsCount
    );
    const totalRecords = countResult[0].total;

    // Pegar página de resultados
    const paramsData = [...paramsCount, limitNum, offset];
    const [rows] = await pool.query(
      `SELECT id_grupo, nome_grupo, data_registro, data_atualizacao
         FROM Grupos
         ${whereClause}
         ORDER BY nome_grupo
         LIMIT ? OFFSET ?`,
      paramsData
    );

    const totalPages = Math.ceil(totalRecords / limitNum);
    res.json({ data: rows, page: pageNum, limit: limitNum, totalRecords, totalPages });
  } catch (error) {
    console.error('Erro em listar grupos', error);
    res.status(500).json({ error: 'Erro interno ao listar grupos' });
  }
};

export const visualizarGrupo = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id_grupo, nome_grupo, data_registro, data_atualizacao
         FROM Grupos
         WHERE id_grupo = ? AND ativo = TRUE`,
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
  if (!nome_grupo) {
    return res.status(400).json({ message: 'Nome do Grupo é obrigatório.' });
  }

  try {
    // --- INÍCIO: VERIFICAÇÃO DE DUPLICIDADE (CRIAR) ---
    // 1. Verificar por nome_grupo existente
    const [existingByName] = await pool.query(
      `SELECT id_grupo FROM Grupos WHERE nome_grupo = ? AND ativo = TRUE`,
      [nome_grupo]
    );

    if (existingByName.length > 0) {
      return res.status(409).json({ message: 'Grupo já cadastrado com este nome.' });
    }
    // --- FIM: VERIFICAÇÃO DE DUPLICIDADE (CRIAR) ---

    const [result] = await pool.query(
      'INSERT INTO Grupos (nome_grupo) VALUES (?)',
      [nome_grupo]
    );
    res.status(201).json({ id_grupo: result.insertId, nome_grupo });
  } catch (error) {
    console.error('Erro em criar grupo', error);
    res.status(500).json({ message: 'Erro interno ao criar grupo' });
  }
};

export const atualizarGrupo = async (req, res) => {
  const { id } = req.params;
  const { nome_grupo } = req.body;
  if (!nome_grupo) {
    return res.status(400).json({ message: 'Nome do Grupo é obrigatório.' });
  }

  try {
    // --- INÍCIO: VERIFICAÇÃO DE DUPLICIDADE (ATUALIZAR) ---
    // 1. Verificar nome_grupo existente (que não seja o do próprio grupo)
    const [existingByName] = await pool.query(
      `SELECT id_grupo FROM Grupos WHERE nome_grupo = ? AND id_grupo != ? AND ativo = TRUE`,
      [nome_grupo, id]
    );

    if (existingByName.length > 0) {
      return res.status(409).json({ message: 'Nome do grupo já cadastrado para outro grupo ativo.' });
    }
    // --- FIM: VERIFICAÇÃO DE DUPLICIDADE (ATUALIZAR) ---

    const [result] = await pool.query(
      'UPDATE Grupos SET nome_grupo = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id_grupo = ? AND ativo = TRUE',
      [nome_grupo, id]
    );

    if (!result.affectedRows) {
      // Pode ser que o grupo não foi encontrado, estava inativo, ou nenhum dado foi alterado (nome_grupo é o mesmo)
      return res.status(404).json({ message: 'Grupo não encontrado ou nenhum dado foi alterado.' });
    }

    res.json({ message: 'Grupo atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro em atualizar grupo', error);
    res.status(500).json({ message: 'Erro interno ao atualizar grupo' });
  }
};

export const removerGrupo = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'UPDATE Grupos SET ativo = FALSE, data_atualizacao = CURRENT_TIMESTAMP WHERE id_grupo = ? AND ativo = TRUE',
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Grupo não encontrado ou já inativo' });
    }

    res.json({ message: 'Grupo inativado com sucesso' });
  } catch (error) {
    console.error('Erro em remover grupo', error);
    res.status(500).json({ message: 'Erro interno ao remover grupo' });
  }
};