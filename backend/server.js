// backend/server.js

import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors'; // Importe o CORS se ainda não o fez

// Importação das rotas do Express para cada módulo
import gruposRoutes from './routes/grupos.js';
import produtosRoutes from './routes/produtos.js';
import fornecedoresRoutes from './routes/fornecedores.js';
import formaPagamentoRoutes from './routes/formaPagamento.js';
import pedidoRoutes from './routes/pedido.js';
import statusPedidoRoutes from './routes/statusPedido.js';
import filialRoutes from './routes/filial.js';
import historicoPedidoRoutes from './routes/historicoPedido.js';
import lotesRoutes from './routes/lotes.js';
import estoqueRoutes from './routes/estoque.js';
import movimentacaoEstoqueRoutes from './routes/movimentacaoEstoque.js';
import relatoriosRoutes from './routes/relatorios.js'; // Seu roteador de relatórios

// Importação dos controladores de autenticação
import { cadastroUser, loginUser, forgotPassword, resetPassword } from './controllers/authController.js';

dotenv.config(); // Carregar variáveis de ambiente do arquivo .env

const app = express(); // Cria a instância do aplicativo Express

// Configuração do CORS para permitir requisições de qualquer origem
// É crucial para o frontend em uma porta diferente
app.use(cors({
    origin: '*', // Permite todas as origens para desenvolvimento
}));

// Middleware para parsear o corpo das requisições como JSON
app.use(bodyParser.json());

// Endpoints para autenticação (login, cadastro, recuperação de senha)
// Estes endpoints NÃO usam o prefixo '/api/' porque foram definidos assim no seu código original
app.post('/auth/cadastro', cadastroUser);
app.post('/auth/login', loginUser);
app.post('/forgot-password', forgotPassword);
app.post('/reset-password/:token', resetPassword);

// Montagem dos roteadores para cada módulo da API
// AGORA, TODOS SERÃO ACESSADOS COM O PREFIXO '/api/'
// Exemplo: http://localhost:5000/api/produtos, http://localhost:5000/api/grupos, etc.
// ESTA É A CORREÇÃO MAIS IMPORTANTE!
app.use('/api/produtos', produtosRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/filial', filialRoutes); // CORRIGIDO: Agora as filiais serão acessadas via /api/filial
app.use('/api/formaPagamento', formaPagamentoRoutes);
app.use('/api/pedido', pedidoRoutes);
app.use('/api/statusPedido', statusPedidoRoutes);
app.use('/api/historicoPedido', historicoPedidoRoutes);
app.use('/api/lotes', lotesRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/movimentacaoEstoque', movimentacaoEstoqueRoutes);
app.use('/api/relatorios', relatoriosRoutes); // CORRIGIDO: Agora os relatórios serão acessados via /api/relatorios

// Define a porta do servidor, usando a variável de ambiente PORT ou 5000 como fallback
const PORT = process.env.PORT || 5000;

// Inicia o servidor e escuta na porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
