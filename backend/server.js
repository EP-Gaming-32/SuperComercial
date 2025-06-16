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
import pedidoFilialRoutes from './routes/pedidoFilial.js';
import ordemCompraRoutes from './routes/ordemCompra.js';
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

app.use(cors({
    origin: '*',
}));


app.use(bodyParser.json());

app.post('/auth/cadastro', cadastroUser);
app.post('/auth/login', loginUser);
app.post('/forgot-password', forgotPassword);
app.post('/reset-password/:token', resetPassword);

app.use('/produtos', produtosRoutes);
app.use('/grupos', gruposRoutes);
app.use('/fornecedores', fornecedoresRoutes);
app.use('/formaPagamento', formaPagamentoRoutes);
app.use('/pedido', pedidoRoutes);
app.use('/pedidoFilial', pedidoFilialRoutes);
app.use('/ordemCompra', ordemCompraRoutes);
app.use('/statusPedido', statusPedidoRoutes);
app.use('/historicoPedido', historicoPedidoRoutes);
app.use('/lotes', lotesRoutes);
app.use('/estoque', estoqueRoutes);
app.use('/movimentacaoEstoque', movimentacaoEstoqueRoutes);

// ROTAS DE RELATÓRIOS E FILIAIS - CRUCIAIS PARA SEU DASHBOARD
app.use('/filial', filialRoutes);       // Montagem do roteador de filiais
app.use('/relatorios', relatoriosRoutes); // Montagem do roteador de relatórios

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
