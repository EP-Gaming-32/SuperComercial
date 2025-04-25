import pool from '../config/db.js';

export const listarPedido = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
  
    try {
      const [countResult] = await pool.query(
        'SELECT COUNT(*) AS total FROM Pedidos'
      );
      const totalRecords = countResult[0].total;
  
      const [rows] = await pool.query(
        `SELECT id_pedido, id_filial, id_fornecedor, data_pedido, tipo_pedido, valor_total, observacao 
         FROM Pedidos
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
  
      const totalPages = Math.ceil(totalRecords / limit);
      res.json({ data: rows, page, limit, totalRecords, totalPages });
    } catch (error) {
      console.error('Erro em listar pedidos', error);
      res.status(500).json({ error: 'Erro interno listar pedidos' });
    }
  };
  

// READ (single)
export const visualizarPedido = async (req, res) => {
    const { id } = req.params;
  
    try {
      const [rows] = await pool.query(
        `SELECT id_pedido, id_filial, id_fornecedor, data_pedido, tipo_pedido, valor_total, observacao 
         FROM Pedidos WHERE id_pedido = ?`,
        [id]
      );
  
      if (!rows.length) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }
  
      res.json(rows[0]);
    } catch (error) {
      console.error('Erro em visualizar pedido', error);
      res.status(500).json({ message: 'Erro interno ao visualizar pedido' });
    }
  };

  export const criarPedido = async (req, res) => {
    const { id_filial, id_fornecedor, tipo_pedido, valor_total, observacao } = req.body;
  
    // Validação dos dados
    if (!id_filial || !id_fornecedor || !tipo_pedido || !valor_total) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
    }
  
    try {
      const [result] = await pool.query(
        'INSERT INTO Pedidos (id_filial, id_fornecedor, tipo_pedido, valor_total, observacao) VALUES (?, ?, ?, ?, ?)',
        [id_filial, id_fornecedor, tipo_pedido, valor_total, observacao]
      );
  
      res.status(201).json({ id_pedido: result.insertId, id_filial, id_fornecedor, tipo_pedido, valor_total, observacao });
    } catch (error) {
      console.error('Erro ao criar pedido', error);
      res.status(500).json({ message: 'Erro ao criar pedido' });
    }
  };

  export const atualizarPedido = async (req, res) => {
    const { id } = req.params;
    const { id_filial, id_fornecedor, tipo_pedido, valor_total, observacao } = req.body;
  
    // Validação dos dados
    if (!id_filial || !id_fornecedor || !tipo_pedido || !valor_total) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
    }
  
    try {
      const [result] = await pool.query(
        'UPDATE Pedidos SET id_filial = ?, id_fornecedor = ?, tipo_pedido = ?, valor_total = ?, observacao = ? WHERE id_pedido = ?',
        [id_filial, id_fornecedor, tipo_pedido, valor_total, observacao, id]
      );
  
      if (!result.affectedRows) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }
  
      res.json({ message: 'Pedido atualizado' });
    } catch (error) {
      console.error('Erro ao atualizar pedido', error);
      res.status(500).json({ message: 'Erro ao atualizar pedido' });
    }
  };

  export const removerPedido = async (req, res) => {
    const { id } = req.params;
  
    try {
      const [result] = await pool.query(
        'DELETE FROM Pedidos WHERE id_pedido = ?',
        [id]
      );
  
      if (!result.affectedRows) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }
  
      res.json({ message: 'Pedido removido' });
    } catch (error) {
      console.error('Erro ao remover pedido', error);
      res.status(500).json({ message: 'Erro ao remover pedido' });
    }
  };