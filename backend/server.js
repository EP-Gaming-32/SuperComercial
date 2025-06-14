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
import pedidoFilialRoutes from './routes/pedidoFilial.js';
import statusPedidoRoutes from './routes/statusPedido.js';
import filialRoutes from './routes/filial.js';
import historicoPedidoRoutes  from './routes/historicoPedido.js';
import historicoPedidoFilialRoutes  from './routes/historicoPedidoFilial.js';
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

//endpoints para produtos
app.use('/produtos', produtosRoutes);
//endpont para grupos
app.use('/grupos', gruposRoutes);
//endpoint para fornecedores
app.use('/fornecedores', fornecedoresRoutes);
//endpoint filial
app.use('/filial', filialRoutes);
//endpoint formas de pagamentos
app.use('/formaPagamento', formaPagamentoRoutes);
//endpoint Pedidos
app.use('/pedido', pedidoRoutes);
//endpoint Pedidos
app.use('/pedidoFilial', pedidoFilialRoutes);
//endpoint status do pedido
app.use('/statusPedido', statusPedidoRoutes);
//endpoint historico de status do pedido
app.use('/historicoPedido', historicoPedidoRoutes);
//endpoint historico de status do pedido
app.use('/historicoPedidoFilial', historicoPedidoFilialRoutes);
//endpoints estoque
app.use('/lotes', lotesRoutes);
app.use('/estoque', estoqueRoutes);
app.use('/movimentacaoEstoque', movimentacaoEstoqueRoutes);
app.use('/relatorios', relatoriosRoutes);

const PORT = process.env.PORT || 5000;

// Inicia o servidor e escuta na porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
