// controllers/estoque.js
import pool from '../config/db.js';

export const listarEstoque = async (req, res) => {
  const page  = parseInt(req.query.page,10)||1;
  const limit = parseInt(req.query.limit,10)||10;
  const offset= (page-1)*limit;
  try {
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM Estoque`);
    const [rows] = await pool.query(
      `SELECT e.*,
              p.nome_produto,
              f.nome_fornecedor,
              fi.nome_filial,
              l.codigo_lote
         FROM Estoque e
         JOIN Produtos p    ON e.id_produto    = p.id_produto
         JOIN Fornecedor f  ON e.id_fornecedor = f.id_fornecedor
         JOIN Filial fi     ON e.id_filial     = fi.id_filial
    LEFT JOIN Lote l     ON e.id_lote       = l.id_lote
       LIMIT ? OFFSET ?`, [limit, offset]
    );
    res.json({ data: rows, page, limit, totalRecords: total, totalPages: Math.ceil(total/limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao listar estoque' });
  }
};

export const visualizarEstoque = async (req, res) => {
  const { id } = req.params;
  try {
    const [[row]] = await pool.query(
      `SELECT e.*,
              p.nome_produto,
              f.nome_fornecedor,
              fi.nome_filial,
              l.codigo_lote
         FROM Estoque e
         JOIN Produtos p    ON e.id_produto    = p.id_produto
         JOIN Fornecedor f  ON e.id_fornecedor = f.id_fornecedor
         JOIN Filial fi     ON e.id_filial     = fi.id_filial
    LEFT JOIN Lote l     ON e.id_lote       = l.id_lote
       WHERE e.id_estoque = ?`, [id]
    );
    if (!row) return res.status(404).json({ message: 'Estoque não encontrado' });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao visualizar estoque' });
  }
};

export const criarEstoque = async (req, res) => {
  const { id_produto, id_fornecedor, id_filial, id_lote, local_armazenamento, quantidade, estoque_minimo, estoque_maximo } = req.body;
  if (!id_produto||!id_fornecedor||!id_filial||quantidade==null||estoque_minimo==null||estoque_maximo==null) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
  }
  try {
    const [r] = await pool.query(
      `INSERT INTO Estoque
       (id_produto,id_fornecedor,id_filial,id_lote,local_armazenamento,quantidade,estoque_minimo,estoque_maximo)
       VALUES (?,?,?,?,?,?,?,?)`,
      [id_produto, id_fornecedor, id_filial, id_lote||null, local_armazenamento||null, quantidade, estoque_minimo, estoque_maximo]
    );
    res.status(201).json({ id_estoque: r.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao criar estoque' });
  }
};

export const atualizarEstoque = async (req, res) => {
  const { id } = req.params;
  const campos = ['id_produto','id_fornecedor','id_filial','id_lote','local_armazenamento','quantidade','estoque_minimo','estoque_maximo'];
  const updates = [], vals = [];
  for (const c of campos) {
    if (req.body[c]!==undefined) {
      updates.push(`${c} = ?`);
      vals.push(req.body[c]);
    }
  }
  if (!updates.length) return res.status(400).json({ message: 'Nenhuma alteração enviada' });
  try {
    const [r] = await pool.query(
      `UPDATE Estoque SET ${updates.join(', ')} WHERE id_estoque = ?`,
      [...vals, id]
    );
    if (!r.affectedRows) return res.status(404).json({ message: 'Estoque não encontrado' });
    res.json({ message: 'Estoque atualizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao atualizar estoque' });
  }
};

export const removerEstoque = async (req, res) => {
  const { id } = req.params;
  try {
    const [r] = await pool.query(`DELETE FROM Estoque WHERE id_estoque = ?`, [id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Estoque não encontrado' });
    res.json({ message: 'Estoque removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao remover estoque' });
  }
};
