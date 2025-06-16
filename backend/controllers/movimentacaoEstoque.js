import pool from '../config/db.js';

// CRIAR NOVA MOVIMENTAÇÃO DE ESTOQUE E ATUALIZAR ESTOQUE
export const criarMovimentacao = async (req, res) => {
  const { id_estoque, tipo_movimentacao, quantidade } = req.body;
  // Valida campos obrigatórios
  if (!id_estoque || !tipo_movimentacao || quantidade == null) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
  }

  // Valida quantidade não-negativa
  if (quantidade < 0) {
    return res.status(400).json({ error: 'Quantidade deve ser maior ou igual a zero' });
  }

  // Mapeia tipos possíveis do front (lowercase) para enum do banco
  const enumsValidos = ['Vendido', 'Quebrado', 'Vencido', 'Reposição', 'Entrada'];
  const tipoFormatado =
    tipo_movimentacao.charAt(0).toUpperCase() + tipo_movimentacao.slice(1).toLowerCase();
  if (!enumsValidos.includes(tipoFormatado)) {
    return res.status(400).json({ error: 'Tipo de movimentação inválido' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Insere movimentação (data_movimentacao default CURRENT_TIMESTAMP)
    const [insertResult] = await conn.query(
      `INSERT INTO MovimentacaoEstoque (id_estoque, tipo_movimentacao, quantidade)
       VALUES (?, ?, ?)`,
      [id_estoque, tipoFormatado, quantidade]
    );

    // Bloqueia registro de estoque para atualização
    const [rows] = await conn.query(
      `SELECT quantidade FROM Estoque WHERE id_estoque = ? FOR UPDATE`,
      [id_estoque]
    );
    if (rows.length === 0) {
      throw new Error('Registro de estoque não encontrado');
    }
    const quantidadeAtual = rows[0].quantidade;

    // Calcula nova quantidade
    const novaQuantidade = quantidadeAtual + (tipoFormatado === 'Entrada' || tipoFormatado === 'Reposição' ? quantidade : -quantidade);
    if (novaQuantidade < 0) {
      throw new Error('Quantidade insuficiente em estoque');
    }

    // Atualiza tabela Estoque
    await conn.query(
      `UPDATE Estoque SET quantidade = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id_estoque = ?`,
      [novaQuantidade, id_estoque]
    );

    await conn.commit();
    res.status(201).json({ id_movimentacao: insertResult.insertId });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    if (err.message.includes('insuficiente') || err.message.includes('não encontrado')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Erro interno ao criar movimentação' });
  } finally {
    if (conn) conn.release();
  }
};