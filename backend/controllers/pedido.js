import pool from '../config/db.js';

export const listarPedido = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    //filtros

    const {id_pedido, id_filial, id_fornecedor, tipo_pedido, valor_total, data_pedido, status_pedido} = req.query;

    const conditions = [];
    const values = [];

    if (id_pedido) {
      conditions.push('p.id_pedido = ?');
      values.push(id_pedido);
    }
    if (id_filial) {
      conditions.push('p.id_filial = ?');
      values.push(id_filial);
    }
    if (id_fornecedor) {
      conditions.push('p.id_fornecedor = ?');
      values.push(id_fornecedor);
    }
    if (tipo_pedido) {
      conditions.push('p.tipo_pedido LIKE ?');
      values.push(`%${tipo_pedido}%`);
    }
    if (valor_total) {
      conditions.push('p.valor_total LIKE ?');
      values.push(`%${valor_total}%`);
    }
    if (data_pedido) {
      conditions.push('p.data_pedido = ?');
      values.push(data_pedido);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
      const [countResult] = await pool.query(
        `SELECT COUNT(*) AS total
        FROM Pedidos p
        ${whereClause}`,
        values
      );

      const totalRecords = countResult[0].total;
  
      const [rows] = await pool.query(
      `SELECT p.id_pedido, p.id_filial, p.id_fornecedor, p.data_pedido, p.tipo_pedido, p.valor_total, p.observacao 
       FROM Pedidos p
       ${whereClause}
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
      );
  
      const totalPages = Math.ceil(totalRecords / limit);
      res.json({ data: rows, page, limit, totalRecords, totalPages });
    } catch (error) {
      console.error('Erro em listar pedidos', error);
      res.status(500).json({ error: 'Erro interno listar pedidos' });
    }
  };
  

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
    const { id_filial, id_fornecedor, tipo_pedido, valor_total, observacao, id_status } = req.body;
  
    if (!id_filial || !id_fornecedor || !tipo_pedido || !valor_total || !id_status) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
    }
  
    const conn = await pool.getConnection();
  
    try {
      await conn.beginTransaction();
  
      const [pedidoResult] = await conn.query(
        'INSERT INTO Pedidos (id_filial, id_fornecedor, tipo_pedido, valor_total, observacao) VALUES (?, ?, ?, ?, ?)',
        [id_filial, id_fornecedor, tipo_pedido, valor_total, observacao]
      );
  
      const id_pedido = pedidoResult.insertId;
  
      await conn.query(
        'INSERT INTO HistoricoStatusPedido (id_pedido, id_status) VALUES (?, ?)',
        [id_pedido, id_status]
      );
  
      await conn.commit();
      res.status(201).json({ id_pedido, message: 'Pedido criado com histórico' });
    } catch (error) {
      await conn.rollback();
      console.error('Erro ao criar pedido', error);
      res.status(500).json({ message: 'Erro ao criar pedido' });
    } finally {
      conn.release();
    }
  };
  

  export const atualizarPedido = async (req, res) => {
    const { id } = req.params;
    const { id_filial, id_fornecedor, tipo_pedido, valor_total, observacao } = req.body;
  

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