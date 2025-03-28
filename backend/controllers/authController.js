import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { sendResetPasswordEmail } from '../utils/emailService.js';

// Function to create JWT token
const createToken = (id, email, expiresIn = '1h') => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn });
};

// Hashing function using SHA-256
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// USER REGISTRATION
export const cadastroUser = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Campos obrigatórios faltando' });
  }

  try {
    const hashedPasswordHex = hashPassword(senha); // Hash as hexadecimal
    const hashedPasswordBuffer = Buffer.from(hashedPasswordHex, 'hex'); // Convert to Buffer

    await pool.query(
      'INSERT INTO Usuarios (Nome, Email, Senha) VALUES (?, ?, ?)',
      [nome, email, hashedPasswordBuffer]
    );

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ message: 'Erro no registro' });
  }
};

// USER LOGIN
export const loginUser = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Campos obrigatórios faltando' });
  }

  try {
    const [users] = await pool.query(
      'SELECT UsuarioID, Nome, Email, Senha FROM Usuarios WHERE Email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const user = users[0];

    const storedHashHex = user.Senha.toString('hex'); 
    const hashedInput = hashPassword(senha);

    if (hashedInput !== storedHashHex) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = createToken(user.UsuarioID, user.Email);
    res.json({ message: 'Login bem-sucedido', token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro no login' });
  }
};

// FORGOT PASSWORD (Sends Reset Email)
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await pool.query('SELECT UsuarioID FROM Usuarios WHERE Email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const usuarioID = users[0].UsuarioID;

    // Generate a token (32 bytes in hex)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // Token expires in 1 hour

    await pool.query(
      'INSERT INTO PasswordResetTokens (UsuarioID, token, expires_at) VALUES (?, ?, ?)',
      [usuarioID, token, expiresAt]
    );

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    // Send email
    await sendResetPasswordEmail(email, resetLink);

    res.json({ message: 'E-mail de redefinição enviado!' });
  } catch (error) {
    console.error('Erro ao processar solicitação de senha:', error);
    res.status(500).json({ message: 'Erro ao enviar e-mail de redefinição' });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const [tokens] = await pool.query(
      'SELECT UsuarioID, expires_at FROM PasswordResetTokens WHERE token = ?',
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Token inválido.' });
    }

    const { UsuarioID, expires_at } = tokens[0];

    if (new Date(expires_at) < new Date()) {
      return res.status(400).json({ message: 'Token expirado.' });
    }

    const hashedPasswordHex = hashPassword(newPassword);
    const hashedPasswordBuffer = Buffer.from(hashedPasswordHex, 'hex');

    await pool.query('UPDATE Usuarios SET Senha = ? WHERE UsuarioID = ?', [hashedPasswordBuffer, UsuarioID]);

    await pool.query('DELETE FROM PasswordResetTokens WHERE token = ?', [token]);

    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ message: 'Erro ao redefinir senha.' });
  }
};
