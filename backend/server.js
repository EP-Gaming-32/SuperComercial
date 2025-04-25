import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import gruposRoutes from './routes/grupos.js';
import produtosRoutes from './routes/produtos.js';
import fornecedoresRoutes from './routes/fornecedores.js';
import filialRoutes from './routes/filial.js';
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
//endpont para grupos
app.use('/grupos', gruposRoutes);
//endpoint para fornecedores
app.use('/fornecedores', fornecedoresRoutes);
//endpoint filial
app.use('/filial', filialRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
