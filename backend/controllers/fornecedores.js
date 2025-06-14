import pool from '../config/db.js';

export const listarFornecedores = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  // filtros e exclusão lógica
  const { id_fornecedor, nome_fornecedor, tipo_pessoa, cnpj_cpf } = req.query;

  const conditions = ['ativo = TRUE'];
  const values = [];

  if (id_fornecedor) {
    conditions.push('id_fornecedor = ?');
    values.push(id_fornecedor);
  }
  if (nome_fornecedor) {
    conditions.push('nome_fornecedor LIKE ?');
    values.push(`%${nome_fornecedor}%`);
  }
  if (tipo_pessoa) {
    conditions.push('tipo_pessoa = ?');
    values.push(tipo_pessoa);
  }
  if (cnpj_cpf) {
    conditions.push('cnpj_cpf LIKE ?');
    values.push(`%${cnpj_cpf}%`);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM Fornecedor ${whereClause}`,
      values
    );
    const [rows] = await pool.query(
      `SELECT * FROM Fornecedor
         ${whereClause}
         LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const totalPages = Math.ceil(total / limit);
    res.json({ data: rows, page, limit, totalRecords: total, totalPages });
  } catch (error) {
    console.error('Erro em listar fornecedores', error);
    res.status(500).json({ error: 'Erro interno ao listar fornecedores' });
  }
};

export const visualizarFornecedor = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM Fornecedor WHERE id_fornecedor = ? AND ativo = TRUE`,
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
  const {
    nome_fornecedor,
    endereco_fornecedor,
    telefone_fornecedor,
    email_fornecedor,
    tipo_pessoa,
    cnpj_cpf,
    observacao
  } = req.body;

  if (!nome_fornecedor || !endereco_fornecedor || !tipo_pessoa || !cnpj_cpf) {
    return res.status(400).json({ message: 'Campos obrigatórios não preenchidos.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO Fornecedor (
        nome_fornecedor,
        endereco_fornecedor,
        telefone_fornecedor,
        email_fornecedor,
        tipo_pessoa,
        cnpj_cpf,
        observacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nome_fornecedor,
        endereco_fornecedor,
        telefone_fornecedor,
        email_fornecedor,
        tipo_pessoa,
        cnpj_cpf,
        observacao
      ]
    );

    res.status(201).json({
      id_fornecedor: result.insertId,
      nome_fornecedor,
      endereco_fornecedor,
      telefone_fornecedor,
      email_fornecedor,
      tipo_pessoa,
      cnpj_cpf,
      observacao
    });
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    res.status(500).json({ message: 'Erro ao criar fornecedor.', error });
  }
};

export const atualizarFornecedor = async (req, res) => {
  const { id } = req.params;
  const { nome_fornecedor, endereco_fornecedor, email_fornecedor, tipo_pessoa, observacao, telefone_fornecedor, cnpj_cpf  } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE Fornecedor SET nome_fornecedor = ?, endereco_fornecedor = ?, email_fornecedor = ?, tipo_pessoa = ?, observacao = ?, telefone_fornecedor = ?, cnpj_cpf = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id_fornecedor = ?',
      [nome_fornecedor,endereco_fornecedor, email_fornecedor, tipo_pessoa, observacao, telefone_fornecedor, cnpj_cpf, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Fornecedor não encontrado' });
    }

    res.json({ message: 'Fornecedor atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar fornecedor' });
  }
};

export const removerFornecedor = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      `UPDATE Fornecedor
         SET ativo = FALSE,
             data_atualizacao = CURRENT_TIMESTAMP
       WHERE id_fornecedor = ? AND ativo = TRUE`,
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Fornecedor não encontrado ou já inativo' });
    }

    res.json({ message: 'Fornecedor inativado com sucesso' });
  } catch (error) {
    console.error('Erro ao remover fornecedor:', error);
    res.status(500).json({ message: 'Erro interno ao remover fornecedor' });
  }
};
