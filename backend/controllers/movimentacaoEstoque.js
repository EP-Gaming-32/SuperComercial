import pool from '../config/db.js';

// CRIAR NOVA MOVIMENTAÇÃO DE ESTOQUE E ATUALIZAR ESTOQUE
export const criarMovimentacao = async (req, res) => {
  const { id_estoque, tipo_movimentacao, quantidade } = req.body;
  if (!id_estoque || !tipo_movimentacao || quantidade == null) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
  }

  let conn;
  try {
    // Inicia transação
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Insere o registro de movimentação
    const [insertResult] = await conn.query(
      `INSERT INTO MovimentacaoEstoque (id_estoque, tipo_movimentacao, quantidade)
       VALUES (?, ?, ?)`,
      [id_estoque, tipo_movimentacao, quantidade]
    );

    // Busca a quantidade atual no estoque
    const [rows] = await conn.query(
      `SELECT quantidade FROM Estoque WHERE id_estoque = ? FOR UPDATE`,
      [id_estoque]
    );
    if (rows.length === 0) {
      throw new Error('Registro de estoque não encontrado');
    }
    const quantidadeAtual = rows[0].quantidade;

    // Calcula a nova quantidade
    let novaQuantidade;
    if (tipo_movimentacao === 'entrada') {
      novaQuantidade = quantidadeAtual + quantidade;
    } else if (tipo_movimentacao === 'saida') {
      novaQuantidade = quantidadeAtual - quantidade;
      if (novaQuantidade < 0) {
        throw new Error('Quantidade insuficiente em estoque');
      }
    } else {
      throw new Error('Tipo de movimentação inválido');
    }

    // Atualiza a quantidade na tabela Estoque
    await conn.query(
      `UPDATE Estoque SET quantidade = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id_estoque = ?`,
      [novaQuantidade, id_estoque]
    );

    // Confirma transação
    await conn.commit();

    // Retorna o ID da movimentação criada
    res.status(201).json({ id_movimentacao: insertResult.insertId });
  } catch (err) {
    if (conn) {
      await conn.rollback();
    }
    console.error(err);
    // Se for erro de estoque insuficiente ou inexistente, retorna 400
    if (err.message.includes('insuficiente') || err.message.includes('não encontrado')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Erro interno ao criar movimentação' });
  } finally {
    if (conn) conn.release();
  }
};