import pool from '../config/db.js';

// Listar histórico de status de um pedido de filial específico
export const listarHistoricoStatusPedidoFilial = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  // Filtro por id_pedido_filial (obrigatório para este endpoint)
  const { id_pedido_filial } = req.query;
  
  if (!id_pedido_filial) {
    return res.status(400).json({ 
      message: 'id_pedido_filial é obrigatório para consultar o histórico' 
    });
  }

  try {
    // Contar total de registros
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM HistoricoStatusPedidoFilial h
       WHERE h.id_pedido_filial = ?`,
      [id_pedido_filial]
    );
    const totalRecords = countResult[0].total;

    // Buscar histórico com informações do usuário (se disponível)
    const [rows] = await pool.query(
      `SELECT 
         h.id_historico_pf,
         h.id_pedido_filial,
         h.status_antigo,
         h.status_novo,
         h.usuario_id,
         u.Nome AS nome_usuario,
         h.motivo,
         h.data_alteracao
       FROM HistoricoStatusPedidoFilial h
       LEFT JOIN Usuarios u ON u.UsuarioID = h.usuario_id
       WHERE h.id_pedido_filial = ?
       ORDER BY h.data_alteracao DESC
       LIMIT ? OFFSET ?`,
      [id_pedido_filial, limit, offset]
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
    console.error('Erro ao listar histórico de status do pedido de filial:', error);
    res.status(500).json({ error: 'Erro interno ao listar histórico de status' });
  }
};

// Visualizar histórico completo de um pedido de filial
export const visualizarHistoricoStatusPedidoFilial = async (req, res) => {
  const { id } = req.params; // id_pedido_filial

  try {
    // Verificar se o pedido existe
    const [pedidoExists] = await pool.query(
      'SELECT id_pedido_filial FROM PedidoFilial WHERE id_pedido_filial = ?',
      [id]
    );

    if (!pedidoExists.length) {
      return res.status(404).json({ message: 'Pedido de filial não encontrado' });
    }

    // Buscar todo o histórico do pedido
    const [rows] = await pool.query(
      `SELECT 
         h.id_historico_pf,
         h.id_pedido_filial,
         h.status_antigo,
         h.status_novo,
         h.usuario_id,
         u.Nome AS nome_usuario,
         h.motivo,
         h.data_alteracao
       FROM HistoricoStatusPedidoFilial h
       LEFT JOIN Usuarios u ON u.UsuarioID = h.usuario_id
       WHERE h.id_pedido_filial = ?
       ORDER BY h.data_alteracao DESC`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ 
        message: 'Nenhum histórico de status encontrado para este pedido' 
      });
    }

    res.json(rows);
  } catch (error) {
    console.error('Erro ao visualizar histórico de status:', error);
    res.status(500).json({ message: 'Erro interno ao visualizar histórico de status' });
  }
};

// Trocar status de um pedido de filial (manual)
export const trocarStatusPedidoFilial = async (req, res) => {
  const { id_pedido_filial, novo_status, usuario_id, motivo } = req.body;

  if (!id_pedido_filial || !novo_status) {
    return res.status(400).json({ 
      message: 'id_pedido_filial e novo_status são obrigatórios' 
    });
  }

  // Validar status permitidos
  const statusPermitidos = ['Pendente', 'Atendido', 'Cancelado'];
  if (!statusPermitidos.includes(novo_status)) {
    return res.status(400).json({ 
      message: 'Status inválido. Valores permitidos: ' + statusPermitidos.join(', ') 
    });
  }

  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();

    // Verificar se o pedido existe e obter status atual
    const [pedidoRows] = await conn.query(
      'SELECT id_pedido_filial, status FROM PedidoFilial WHERE id_pedido_filial = ?',
      [id_pedido_filial]
    );

    if (!pedidoRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Pedido de filial não encontrado' });
    }

    const statusAtual = pedidoRows[0].status;

    // Verificar se o status realmente mudou
    if (statusAtual === novo_status) {
      await conn.rollback();
      return res.status(400).json({ 
        message: `O pedido já está com o status '${novo_status}'` 
      });
    }

    // Atualizar status na tabela PedidoFilial
    await conn.query(
      'UPDATE PedidoFilial SET status = ? WHERE id_pedido_filial = ?',
      [novo_status, id_pedido_filial]
    );

    // Inserir registro manual no histórico (o trigger automático também será executado)
    await conn.query(
      `INSERT INTO HistoricoStatusPedidoFilial 
       (id_pedido_filial, status_antigo, status_novo, usuario_id, motivo) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        id_pedido_filial, 
        statusAtual, 
        novo_status, 
        usuario_id || null, 
        motivo || `Status alterado manualmente de '${statusAtual}' para '${novo_status}'`
      ]
    );

    await conn.commit();
    res.status(201).json({ 
      message: `Status do pedido ${id_pedido_filial} alterado de '${statusAtual}' para '${novo_status}' com sucesso` 
    });
  } catch (error) {
    await conn.rollback();
    console.error('Erro ao trocar status do pedido de filial:', error);
    res.status(500).json({ message: 'Erro ao trocar status: ' + error.message });
  } finally {
    conn.release();
  }
};

