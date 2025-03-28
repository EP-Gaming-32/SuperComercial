import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

// Function to create JWT token
const createToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '1h' });
};

// Hashing function using SHA-256
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const cadastroUser = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Campos obrigatórios faltando' });
  }

  try {
    const hashedPasswordHex = hashPassword(senha); // Hash em formato hexadecimal (64 caracteres)
    const hashedPasswordBuffer = Buffer.from(hashedPasswordHex, 'hex'); // Converte para Buffer (32 bytes)

    // Insira o Buffer no campo Senha (VARBINARY)
    await pool.query(
      'INSERT INTO Usuarios (Nome, Email, Senha) VALUES (?, ?, ?)',
      [nome, email, hashedPasswordBuffer]
    );

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    console.error('Erro ao inserir usuário:', error);
    res.status(500).json({ message: 'Erro de registro' });
  }
};

export const loginUser = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Campos obrigatórios faltando' });
  }

  try {
    // Busque o usuário com o nome correto da coluna (Senha)
    const [users] = await pool.query(
      'SELECT UsuarioID, Nome, Email, Senha FROM Usuarios WHERE Email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const user = users[0];

    // Converta o Buffer armazenado para hexadecimal
    const storedHashHex = user.Senha.toString('hex'); 
    const hashedInput = hashPassword(senha); // Hash da senha fornecida

    // Compare os hashes em formato hexadecimal
    if (hashedInput !== storedHashHex) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Crie o token
    const token = createToken(user.UsuarioID, user.Email);
    res.json({ message: 'Login bem-sucedido', token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro no login' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await pool.query('SELECT UsuarioID FROM Usuarios WHERE Email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Implementar envio de e-mail com link para reset de senha aqui

    res.json({ message: 'E-mail de redefinição enviado!' });
  } catch (error) {
    console.error('Erro ao enviar e-mail de redefinição:', error);
    res.status(500).json({ message: 'Erro ao enviar e-mail de redefinição' });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Validar token de reset de senha (essa parte pode ser feita com base na sua implementação de token)

    const hashedPassword = hashPassword(newPassword); // Hash da nova senha

    await pool.query('UPDATE Usuarios SET Senha = ? WHERE UsuarioID = ?', [hashedPassword, userId]); // Atualizar senha no banco

    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro ao redefinir a senha:', error);
    res.status(500).json({ message: 'Erro ao redefinir a senha' });
  }
};
