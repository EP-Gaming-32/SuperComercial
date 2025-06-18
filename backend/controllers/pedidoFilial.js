import pool from '../config/db.js';

// Listar pedidos de filial com paginação e filtros
export const listarPedidoFilial = async (req, res) => {
  const { id_filial, status, data_pedido, page = 1, limit = 10 } = req.query; // Adicionado data_pedido aqui
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  try {
    // Monta a base da query já com JOIN em Filial
    let sql = `
      SELECT 
        pf.id_pedido_filial,
        pf.id_filial,
        f.nome_filial,
        pf.data_pedido,
        pf.status,
        pf.observacao
      FROM PedidoFilial pf
      LEFT JOIN Filial f 
        ON f.id_filial = pf.id_filial
    `;
    const params = [];
    const clauses = []; // Array para armazenar as cláusulas WHERE

    // Adiciona WHERE dinâmico para status
    if (status) {
      clauses.push(`pf.status = ?`);
      params.push(status);
    }
    
    // Adiciona WHERE dinâmico para id_filial
    if (id_filial) {
      clauses.push(`pf.id_filial = ?`);
      params.push(id_filial);
    }

    // ===============================================
    // ADICIONADO: Lógica para filtrar por data_pedido
    // ===============================================
    if (data_pedido) {
      // O frontend está enviando DD/MM/YYYY (ex: "16/06/2025")
      // Precisamos converter para YYYY-MM-DD para o SQL
      const [dia, mes, ano] = data_pedido.split('/');
      // Basicamente, verificar se todos os segmentos são válidos e se a data é completa
      if (dia && mes && ano && dia.length === 2 && mes.length === 2 && ano.length === 4) {
          const formattedDate = `${ano}-${mes}-${dia}`;
          clauses.push(`DATE(pf.data_pedido) = ?`); // DATE() para comparar apenas a data, ignorando a hora
          params.push(formattedDate);
      } else {
          // Opcional: Logar um aviso se a data_pedido for enviada, mas em formato inválido
          console.warn(`Data de pedido inválida recebida: ${data_pedido}. Ignorando filtro de data.`);
      }
    }

    // Se houver alguma cláusula, adiciona o WHERE à SQL
    if (clauses.length > 0) {
      sql += ` WHERE ` + clauses.join(' AND ');
    }

    // Ordenação e paginação
    sql += ` ORDER BY pf.data_pedido DESC
              LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), offset);

    // Executa a query principal
    const [rows] = await pool.query(sql, params);

    // Contagem total (para paginação) - REPLICAR AS CLÁUSULAS WHERE AQUI
    let countSql = `SELECT COUNT(*) AS total FROM PedidoFilial pf`;
    const countParams = []; // Parâmetros separados para a query de contagem

    // REPLICAR AS CLÁUSULAS WHERE NA QUERY DE CONTAGEM
    // Isso é importante para que a contagem total reflita os filtros aplicados
    if (clauses.length > 0) {
      countSql += ` WHERE ` + clauses.join(' AND ');
      // Adicionar os mesmos parâmetros usados para as cláusulas WHERE
      // (excluindo os parâmetros de LIMIT e OFFSET que são apenas para a query principal)
      countParams.push(...params.slice(0, params.length - 2)); // Pega todos menos os dois últimos (limit, offset)
    }

    const [countResult] = await pool.query(countSql, countParams);
    const totalRecords = countResult[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    res.json({
      data: rows,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalRecords,
      totalPages
    });
  } catch (err) {
    console.error('Erro ao listar pedidos de filial:', err);
    res.status(500).json({ message: 'Erro ao listar pedidos de filial' });
  }
};

// ... (Resto do seu arquivo, visualizarPedidoFilial, criarPedidoFilial, atualizarPedidoFilial, removerPedidoFilial)
// Nenhuma alteração nas outras funções, pois elas não são afetadas pela busca.
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