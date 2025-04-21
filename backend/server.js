import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import produtosRoutes from './routes/produtos.js';
import { cadastroUser, loginUser, forgotPassword, resetPassword } from './controllers/authController.js';

dotenv.config(); // Carregar variáveis de ambiente

const app = express();

app.use(cors({
  origin: '*',  // ou '*' para permitir de qualquer origem
}));

app.use(bodyParser.json());

//endpoints para login cadastro senha
app.post('/auth/cadastro', cadastroUser);
app.post('/auth/login', loginUser);
app.post('/forgot-password', forgotPassword);
app.post('/reset-password/:token', resetPassword);

//endpoints para produtos
app.use('/produtos', produtosRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
