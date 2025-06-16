// backend/server.js

import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';

// Importação de TODOS os roteadores (verifique se os caminhos estão corretos)
import gruposRoutes from './routes/grupos.js';
import produtosRoutes from './routes/produtos.js';
import fornecedoresRoutes from './routes/fornecedores.js';
import formaPagamentoRoutes from './routes/formaPagamento.js';
import pedidoRoutes from './routes/pedido.js';
import statusPedidoRoutes from './routes/statusPedido.js';
import filialRoutes from './routes/filial.js'; // Roteador de filiais
import historicoPedidoRoutes from './routes/historicoPedido.js';
import lotesRoutes from './routes/lotes.js';
import estoqueRoutes from './routes/estoque.js';
import movimentacaoEstoqueRoutes from './routes/movimentacaoEstoque.js';
import relatoriosRoutes from './routes/relatorios.js'; // Roteador de relatórios

// Importação dos controladores de autenticação (rotas diretas, sem router.js)
import { cadastroUser, loginUser, forgotPassword, resetPassword } from './controllers/authController.js';

dotenv.config(); // Carregar variáveis de ambiente do arquivo .env

const app = express(); // Cria a instância do aplicativo Express

// MIDDLEWARES GLOBAIS
// CORS: Permite que o frontend acesse o backend de domínios/portas diferentes
app.use(cors({
    origin: '*', // Permite todas as origens para desenvolvimento. Em produção, você definiria domínios específicos.
}));

// bodyParser: Para parsear o corpo das requisições como JSON
app.use(bodyParser.json());
// Se você usa formulários HTML tradicionais (application/x-www-form-urlencoded), adicione também:
// app.use(bodyParser.urlencoded({ extended: true }));


// DEFINIÇÃO DAS ROTAS DA API
// -------------------------

// Rotas de Autenticação (definidas diretamente no server.js, sem um arquivo de rotas dedicado)
// Estas rotas NÃO TÊM o prefixo '/api/' no server.js, pois o frontend as chama diretamente.
app.post('/auth/cadastro', cadastroUser);
app.post('/auth/login', loginUser);
app.post('/forgot-password', forgotPassword);
app.post('/reset-password/:token', resetPassword);

// Montagem dos Roteadores Modulares
// CADA ROTEADOR É MONTADO COM O PREFIXO '/api/'
// Isso garante que as URLs do frontend (que incluem /api/) encontrem suas rotas no backend.
app.use('/api/produtos', produtosRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/formaPagamento', formaPagamentoRoutes);
app.use('/api/pedido', pedidoRoutes);
app.use('/api/statusPedido', statusPedidoRoutes);
app.use('/api/historicoPedido', historicoPedidoRoutes);
app.use('/api/lotes', lotesRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/movimentacaoEstoque', movimentacaoEstoqueRoutes);

// ROTAS DE RELATÓRIOS E FILIAIS - CRUCIAIS PARA SEU DASHBOARD
app.use('/api/filial', filialRoutes);       // Montagem do roteador de filiais
app.use('/api/relatorios', relatoriosRoutes); // Montagem do roteador de relatórios

// Rota de Teste (opcional, apenas para verificar se o servidor está no ar)
app.get('/', (req, res) => {
    res.send('Backend API está funcionando!');
});


// INICIALIZAÇÃO DO SERVIDOR
// -------------------------

// Define a porta do servidor, usando a variável de ambiente PORT ou 5000 como fallback
const PORT = process.env.PORT || 5000;

// Inicia o servidor e o faz escutar na porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
