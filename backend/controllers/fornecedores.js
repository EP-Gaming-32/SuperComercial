// backend/controllers/fornecedores.js

import pool from '../config/db.js';

// =================================================================
// FUNÇÃO DE LISTAR (BUSCA) - CORRIGIDA
// =================================================================
export const listarFornecedores = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const { id_fornecedor, nome_fornecedor, tipo_pessoa, cnpj_cpf, email_fornecedor, telefone_fornecedor } = req.query;

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
  if (email_fornecedor) {
    conditions.push('email_fornecedor LIKE ?');
    values.push(`%${email_fornecedor}%`);
  }

  if (telefone_fornecedor) {
    const telefoneLimpo = telefone_fornecedor.replace(/\D/g, '');
    if (telefoneLimpo) {
      // ESTA LINHA AGORA LIMPA O CAMPO DO BANCO ANTES DE COMPARAR
      conditions.push("REPLACE(REPLACE(REPLACE(REPLACE(telefone_fornecedor, '(', ''), ')', ''), '-', ''), ' ', '') LIKE ?");
      values.push(`%${telefoneLimpo}%`);
    }
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
          ORDER BY nome_fornecedor ASC
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


// =================================================================
// FUNÇÃO DE CRIAR - CORRIGIDA
// =================================================================
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

  // LIMPA O TELEFONE ANTES DE SALVAR NO BANCO
  const telefoneLimpoParaSalvar = telefone_fornecedor ? telefone_fornecedor.replace(/\D/g, '') : null;

  try {
    const [existingByCnpjCpf] = await pool.query(
      `SELECT id_fornecedor FROM Fornecedor WHERE cnpj_cpf = ? AND ativo = TRUE`,
      [cnpj_cpf]
    );

    if (existingByCnpjCpf.length > 0) {
      return res.status(409).json({ message: 'Fornecedor já cadastrado com este CNPJ/CPF.' });
    }

    if (email_fornecedor) {
      const [existingByEmail] = await pool.query(
        `SELECT id_fornecedor FROM Fornecedor WHERE email_fornecedor = ? AND ativo = TRUE`,
        [email_fornecedor]
      );
      if (existingByEmail.length > 0) {
        return res.status(409).json({ message: 'Fornecedor já cadastrado com este E-mail.' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO Fornecedor (
        nome_fornecedor, endereco_fornecedor, telefone_fornecedor, 
        email_fornecedor, tipo_pessoa, cnpj_cpf, observacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nome_fornecedor, endereco_fornecedor, telefoneLimpoParaSalvar, // Usando o telefone limpo
        email_fornecedor, tipo_pessoa, cnpj_cpf, observacao
      ]
    );

    res.status(201).json({ id_fornecedor: result.insertId, ...req.body });
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    res.status(500).json({ message: 'Erro interno ao criar fornecedor.', error });
  }
};


// =================================================================
// FUNÇÃO DE ATUALIZAR - CORRIGIDA
// =================================================================
export const atualizarFornecedor = async (req, res) => {
  const { id } = req.params;
  const { nome_fornecedor, endereco_fornecedor, email_fornecedor, tipo_pessoa, observacao, telefone_fornecedor, cnpj_cpf } = req.body;
  
  // LIMPA O TELEFONE ANTES DE ATUALIZAR NO BANCO
  const telefoneLimpoParaAtualizar = telefone_fornecedor ? telefone_fornecedor.replace(/\D/g, '') : null;
  
  try {
    const [existingByCnpjCpf] = await pool.query(
      `SELECT id_fornecedor FROM Fornecedor WHERE cnpj_cpf = ? AND id_fornecedor != ? AND ativo = TRUE`,
      [cnpj_cpf, id]
    );
    if (existingByCnpjCpf.length > 0) {
      return res.status(409).json({ message: 'CNPJ/CPF já cadastrado para outro fornecedor ativo.' });
    }

    if (email_fornecedor) {
      const [existingByEmail] = await pool.query(
        `SELECT id_fornecedor FROM Fornecedor WHERE email_fornecedor = ? AND id_fornecedor != ? AND ativo = TRUE`,
        [email_fornecedor, id]
      );
      if (existingByEmail.length > 0) {
        return res.status(409).json({ message: 'E-mail já cadastrado para outro fornecedor ativo.' });
      }
    }
  } catch (error) {
    console.error('Erro na verificação de duplicidade ao atualizar fornecedor:', error);
    return res.status(500).json({ message: 'Erro interno na validação de duplicidade.' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE Fornecedor SET nome_fornecedor = ?, endereco_fornecedor = ?, email_fornecedor = ?, tipo_pessoa = ?, observacao = ?, telefone_fornecedor = ?, cnpj_cpf = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id_fornecedor = ?',
      [nome_fornecedor, endereco_fornecedor, email_fornecedor, tipo_pessoa, observacao, telefoneLimpoParaAtualizar, cnpj_cpf, id] // Usando o telefone limpo
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Fornecedor não encontrado ou dados idênticos' });
    }

    res.json({ message: 'Fornecedor atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar fornecedor' });
  }
};


// A FUNÇÃO DE REMOVER (INATIVAR) NÃO PRECISA DE MUDANÇAS
export const removerFornecedor = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      `UPDATE Fornecedor SET ativo = FALSE, data_atualizacao = CURRENT_TIMESTAMP WHERE id_fornecedor = ? AND ativo = TRUE`,
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

// A FUNÇÃO DE VISUALIZAR NÃO PRECISA DE MUDANÇAS
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