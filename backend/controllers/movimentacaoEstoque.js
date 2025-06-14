import pool from '../config/db.js';

// CRIAR NOVA MOVIMENTAÇÃO DE ESTOQUE
export const criarMovimentacao = async (req, res) => {
  const { id_estoque, tipo_movimentacao, quantidade } = req.body;
  if (!id_estoque || !tipo_movimentacao || quantidade == null) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
  }
  try {
    const [result] = await pool.query(
      `
      INSERT INTO MovimentacaoEstoque
        (id_estoque, tipo_movimentacao, quantidade)
      VALUES (?, ?, ?)
    `,
      [id_estoque, tipo_movimentacao, quantidade]
    );

    // Retorna apenas o ID criado
    res.status(201).json({ id_movimentacao: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao criar movimentação' });
  }
};