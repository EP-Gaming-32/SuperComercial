import pool from '../config/db.js';

// Listar pedidos de filial com paginação e filtros
export const listarPedidoFilial = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const {
    id_pedido_filial,
    id_filial,
    status,
    data_pedido
  } = req.query;

  const conditions = [];
  const values = [];

  if (id_pedido_filial) {
    conditions.push('pf.id_pedido_filial = ?');
    values.push(id_pedido_filial);
  }
  if (id_filial) {
    conditions.push('pf.id_filial = ?');
    values.push(id_filial);
  }
  if (status) {
    conditions.push('pf.status = ?');
    values.push(status);
  }
  if (data_pedido) {
    conditions.push('DATE(pf.data_pedido) = ?');
    values.push(data_pedido);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    // Contar total de registros
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM PedidoFilial pf
       LEFT JOIN Filial f ON f.id_filial = pf.id_filial
       ${whereClause}`,
      values
    );
    const totalRecords = countResult[0].total;

    // Buscar pedidos com informações agregadas
    const [rows] = await pool.query(
      `SELECT 
         pf.id_pedido_filial,
         pf.id_filial,
         f.nome_filial,
         pf.data_pedido,
         pf.status,
         pf.observacao,
         pf.data_registro,
         pf.data_atualizacao,
         COALESCE(SUM(ipf.quantidade * p.valor_produto), 0) AS valor_total,
         COALESCE(COUNT(ipf.id_produto), 0) AS quantidade_produtos
       FROM PedidoFilial pf
       LEFT JOIN Filial f ON f.id_filial = pf.id_filial
       LEFT JOIN ItensPedidoFilial ipf ON ipf.id_pedido_filial = pf.id_pedido_filial
       LEFT JOIN Produtos p ON p.id_produto = ipf.id_produto
       ${whereClause}
       GROUP BY pf.id_pedido_filial
       ORDER BY pf.data_pedido DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const totalPages = Math.ceil(totalRecords / limit);

    res.json({ 
      data: rows, 
      page, 
      limit, 
      totalRecords, 
      totalPages 
    });
  } catch (error) {
    console.error('Erro ao listar pedidos de filial:', error);
    res.status(500).json({ error: 'Erro interno ao listar pedidos de filial' });
  }
};

// Visualizar pedido de filial específico com produtos
export const visualizarPedidoFilial = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar dados do pedido
    const [pedidoRows] = await pool.query(
      `SELECT 
         pf.id_pedido_filial,
         pf.id_filial,
         f.nome_filial,
         pf.data_pedido,
         pf.status,
         pf.observacao,
         pf.data_registro,
         pf.data_atualizacao
       FROM PedidoFilial pf
       LEFT JOIN Filial f ON f.id_filial = pf.id_filial
       WHERE pf.id_pedido_filial = ?`,
      [id]
    );

    if (!pedidoRows.length) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    // Buscar produtos do pedido com valor atual dos produtos
    const [produtosRows] = await pool.query(
      `SELECT 
         ipf.id_item_filial,
         ipf.id_produto,
         p.nome_produto,
         p.sku,
         ipf.quantidade,
         p.valor_produto,
         (ipf.quantidade * p.valor_produto) AS subtotal
       FROM ItensPedidoFilial ipf
       LEFT JOIN Produtos p ON p.id_produto = ipf.id_produto
       WHERE ipf.id_pedido_filial = ?
       ORDER BY p.nome_produto ASC`,
      [id]
    );

    // Calcular valor total
    const valorTotal = produtosRows.reduce((total, produto) => {
      return total + parseFloat(produto.subtotal || 0);
    }, 0);

    const pedido = {
      ...pedidoRows[0],
      produtos: produtosRows,
      valor_total: valorTotal,
      quantidade_produtos: produtosRows.length
    };

    res.json(pedido);
  } catch (error) {
    console.error('Erro ao visualizar pedido de filial:', error);
    res.status(500).json({ message: 'Erro interno ao visualizar pedido de filial' });
  }
};

// Criar novo pedido de filial com produtos
export const criarPedidoFilial = async (req, res) => {
  const { id_filial, data_pedido, status, observacao, produtos } = req.body;
  
  if (!id_filial || !produtos || !Array.isArray(produtos) || produtos.length === 0) {
    return res.status(400).json({ 
      message: 'Campos obrigatórios ausentes: id_filial e produtos são obrigatórios' 
    });
  }
  
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();

    // Inserir pedido
    const [pedidoResult] = await conn.query(
      `INSERT INTO PedidoFilial (id_filial, data_pedido, status, observacao) 
       VALUES (?, ?, ?, ?)`,
      [
        id_filial, 
        data_pedido || new Date(), 
        status || 'Pendente', 
        observacao || null
      ]
    );

    const id_pedido_filial = pedidoResult.insertId;

    // Inserir produtos do pedido
    for (const produto of produtos) {
      if (!produto.id_produto || !produto.quantidade) {
        throw new Error('Dados do produto incompletos: id_produto e quantidade são obrigatórios');
      }

      // Verificar se o produto existe
      const [produtoExists] = await conn.query(
        'SELECT id_produto FROM Produtos WHERE id_produto = ? AND ativo = TRUE',
        [produto.id_produto]
      );

      if (!produtoExists.length) {
        throw new Error(`Produto com ID ${produto.id_produto} não encontrado ou inativo`);
      }

      await conn.query(
        `INSERT INTO ItensPedidoFilial (id_pedido_filial, id_produto, quantidade) 
         VALUES (?, ?, ?)`,
        [id_pedido_filial, produto.id_produto, produto.quantidade]
      );
    }

    await conn.commit();
    res.status(201).json({ 
      id_pedido_filial, 
      message: 'Pedido de filial criado com sucesso' 
    });
  } catch (error) {
    await conn.rollback();
    console.error('Erro ao criar pedido de filial:', error);
    res.status(500).json({ message: 'Erro ao criar pedido de filial: ' + error.message });
  } finally {
    conn.release();
  }
};

// Atualizar pedido de filial
export const atualizarPedidoFilial = async (req, res) => {
  const { id } = req.params;
  const { id_filial, data_pedido, status, observacao, produtos } = req.body;

  if (!id_filial || !produtos || !Array.isArray(produtos) || produtos.length === 0) {
    return res.status(400).json({ 
      message: 'Campos obrigatórios ausentes: id_filial e produtos são obrigatórios' 
    });
  }

  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();

    // Verificar se o pedido existe
    const [existingPedido] = await conn.query(
      'SELECT id_pedido_filial FROM PedidoFilial WHERE id_pedido_filial = ?',
      [id]
    );

    if (!existingPedido.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    // Atualizar dados do pedido
    await conn.query(
      `UPDATE PedidoFilial 
       SET id_filial = ?, data_pedido = ?, status = ?, observacao = ?
       WHERE id_pedido_filial = ?`,
      [id_filial, data_pedido, status, observacao, id]
    );

    // Remover produtos existentes
    await conn.query(
      'DELETE FROM ItensPedidoFilial WHERE id_pedido_filial = ?',
      [id]
    );

    // Inserir novos produtos
    for (const produto of produtos) {
      if (!produto.id_produto || !produto.quantidade) {
        throw new Error('Dados do produto incompletos: id_produto e quantidade são obrigatórios');
      }

      // Verificar se o produto existe
      const [produtoExists] = await conn.query(
        'SELECT id_produto FROM Produtos WHERE id_produto = ? AND ativo = TRUE',
        [produto.id_produto]
      );

      if (!produtoExists.length) {
        throw new Error(`Produto com ID ${produto.id_produto} não encontrado ou inativo`);
      }

      await conn.query(
        `INSERT INTO ItensPedidoFilial (id_pedido_filial, id_produto, quantidade) 
         VALUES (?, ?, ?)`,
        [id, produto.id_produto, produto.quantidade]
      );
    }

    await conn.commit();
    res.json({ message: 'Pedido de filial atualizado com sucesso' });
  } catch (error) {
    await conn.rollback();
    console.error('Erro ao atualizar pedido de filial:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar pedido de filial: ' + error.message });
  } finally {
    conn.release();
  }
};

// Cancelar pedido de filial (remoção lógica)
export const removerPedidoFilial = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar se o pedido existe
    const [existingPedido] = await pool.query(
      'SELECT id_pedido_filial, status FROM PedidoFilial WHERE id_pedido_filial = ?',
      [id]
    );

    if (!existingPedido.length) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    if (existingPedido[0].status === 'Cancelado') {
      return res.status(400).json({ message: 'Pedido já está cancelado' });
    }

    // Atualizar status para cancelado
    await pool.query(
      'UPDATE PedidoFilial SET status = ? WHERE id_pedido_filial = ?',
      ['Cancelado', id]
    );

    res.json({ message: `Pedido ${id} cancelado com sucesso` });
  } catch (error) {
    console.error('Erro ao cancelar pedido de filial:', error);
    res.status(500).json({ message: 'Erro interno ao cancelar pedido de filial' });
  }
};