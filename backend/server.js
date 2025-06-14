import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
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
import relatoriosRoutes from './routes/relatorios.js';
import { cadastroUser, loginUser, forgotPassword, resetPassword } from './controllers/authController.js';

dotenv.config(); // Carregar variáveis de ambiente

const app = express();

app.use(cors({
  origin: '*',
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
