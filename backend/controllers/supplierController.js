import pool from '../config/db.js';

// Cadastro de fornecedor
export const supplierRegister = async (req, res) => {
  const {
        nome,
        email,
        cnpj,
        endereco,
        telefone,
        tipo
    } = req.body;

  if (!nome || !email || !tipo) {
    return res.status(400).json({ status: false, message: 'Campos obrigatórios faltando' });
  }

  try {
    const today = new Date();

    const save = await pool.query(
      'INSERT INTO Fornecedor (nome_fornecedor, endereco_fornecedor, telefone_fornecedor, email_fornecedor, tipo_pessoa, cnpj_cpf, data_registro, data_atualizacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nome, endereco, telefone, email, tipo, cnpj, today, today]
    );

    if (!save) {
        res.status(400).json({ status: false, message: 'Erro ao registrar fornecedor, tente novamente.' });
    }

    res.status(201).json({ status: true, message: 'Fornecedor registrado com sucesso' });
  } catch (error) {
    console.error('Erro ao cadastrar fornecedor:', error);
    res.status(500).json({ status: false, message: 'Erro no registro' });
  }
};
