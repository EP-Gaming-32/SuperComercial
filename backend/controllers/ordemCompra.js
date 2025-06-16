import pool from '../config/db.js';

// GET /ordemCompra/itensPedidoFilial?id_pedido_filial=...
export const listarItensPedidoFilial = async (req, res) => {
  const { id_pedido_filial } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT ipf.id_item_filial, ipf.id_pedido_filial, ipf.id_produto, p.nome_produto, ipf.quantidade
       FROM ItensPedidoFilial ipf
       JOIN Produtos p ON p.id_produto = ipf.id_produto
       WHERE ipf.id_pedido_filial = ?`,
      [id_pedido_filial]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar itens do pedido filial' });
  }
};

// GET /ordemCompra/produtoFornecedor
export const listarProdutoFornecedor = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id_produtoFornecedor AS id, id_produto, id_fornecedor, preco, prazo_entrega
       FROM ProdutoFornecedor WHERE ativo = 1`
    );
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar produto-fornecedor' });
  }
};

// POST /ordemCompra — criação básica de ordem (sem id_fornecedor)
export const criarOrdemCompra = async (req, res) => {
  const { data_ordem, data_entrega_prevista, valor_total, observacao } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO OrdemCompra
       (data_ordem, data_entrega_prevista, valor_total, status, observacao)
       VALUES (?, ?, ?, 'Pendente', ?)`,
      [data_ordem, data_entrega_prevista, valor_total, observacao]
    );
    res.status(201).json({ data: { id_ordem_compra: result.insertId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar ordem de compra' });
  }
};

// POST /ordemCompra/vincularPedido
export const vincularOrdemPedido = async (req, res) => {
  const { id_ordem_compra, id_pedido_filial } = req.body;
  try {
    await pool.query(
      `INSERT INTO OrdemCompraPedidoFilial (id_ordem_compra, id_pedido_filial)
       VALUES (?, ?)`,
      [id_ordem_compra, id_pedido_filial]
    );
    res.status(201).json({ message: 'Vínculo criado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao vincular ordem ao pedido' });
  }
};

// POST /ordemCompra/itens — agora popula ProdutoFornecedor e cria item
export const criarItemOrdemCompra = async (req, res) => {
  const { id_ordem_compra, id_produto, id_fornecedor, quantidade, preco_unitario } = req.body;
  try {
    const [pfRes] = await pool.query(
      `INSERT INTO ProdutoFornecedor (id_produto, id_fornecedor, preco, prazo_entrega, ativo)
       VALUES (?, ?, ?, NULL, TRUE)`,
      [id_produto, id_fornecedor, preco_unitario]
    );
    const id_produto_fornecedor = pfRes.insertId;

    await pool.query(
      `INSERT INTO ItensOrdemCompra
         (id_ordem_compra, id_produto, id_produto_fornecedor, quantidade, preco_unitario)
       VALUES (?, ?, ?, ?, ?)`,
      [id_ordem_compra, id_produto, id_produto_fornecedor, quantidade, preco_unitario]
    );

    res.status(201).json({ message: 'Item da ordem criado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar item de ordem de compra' });
  }
};

// GET /ordemCompra — lista todas as ordens (sem fornecedor)
export const listarOrdensCompra = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id_ordem_compra, data_ordem, data_entrega_prevista, valor_total, status, observacao
       FROM OrdemCompra
       ORDER BY data_ordem DESC`
    );
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar ordens de compra' });
  }
};

// DELETE /ordemCompra/:id — marca a ordem como Cancelado
export const cancelarOrdemCompra = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      `UPDATE OrdemCompra
         SET status = 'Cancelado',
             data_atualizacao = CURRENT_TIMESTAMP
       WHERE id_ordem_compra = ?`,
      [id]
    );
    res.json({ message: 'Ordem de compra cancelada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao cancelar ordem de compra' });
  }
};

// GET /ordemCompra/historico?id_ordem_compra=...
export const listarHistoricoStatusOrdemCompra = async (req, res) => {
  const { id_ordem_compra } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT h.id_historico_oc, h.id_ordem_compra, h.status_antigo, h.status_novo,
              h.usuario_id, u.Nome AS nome_usuario, h.motivo, h.data_alteracao
       FROM HistoricoStatusOrdemCompra h
       LEFT JOIN Usuarios u ON u.UsuarioID = h.usuario_id
       WHERE h.id_ordem_compra = ?
       ORDER BY h.data_alteracao DESC`,
      [id_ordem_compra]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar histórico da ordem de compra' });
  }
};

// GET /ordemCompra/:id — detalhes da ordem, incluindo fornecedores por item
export const listarDetalhesOrdemCompra = async (req, res) => {
  const { id } = req.params;
  try {
    // 1) Busco a própria ordem
    const [ordemRows] = await pool.query(
      `SELECT 
         id_ordem_compra, 
         data_ordem, 
         data_entrega_prevista, 
         valor_total, 
         status, 
         observacao
       FROM OrdemCompra
       WHERE id_ordem_compra = ?`,
      [id]
    );
    if (ordemRows.length === 0) {
      return res.status(404).json({ message: 'Ordem de compra não encontrada' });
    }
    const ordem = ordemRows[0];

    // 2) Busco os itens usando id_fornecedor em vez de id_produto_fornecedor
    const [itensRows] = await pool.query(
      `SELECT 
         ioc.id_item_oc    AS id,
         ioc.id_produto,
         p.nome_produto,
         ioc.id_fornecedor AS id_fornecedor,
         f.nome_fornecedor,
         pf.id_produtoFornecedor AS produto_fornecedor_id,
         ioc.quantidade,
         ioc.preco_unitario
       FROM ItensOrdemCompra AS ioc
       JOIN Produtos AS p 
         ON p.id_produto = ioc.id_produto
       JOIN Fornecedor AS f 
         ON f.id_fornecedor = ioc.id_fornecedor
       LEFT JOIN ProdutoFornecedor AS pf 
         ON pf.id_produto     = ioc.id_produto
        AND pf.id_fornecedor  = ioc.id_fornecedor
       WHERE ioc.id_ordem_compra = ?`,
      [id]
    );

    res.json({ data: { ...ordem, itens: itensRows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar detalhes da ordem' });
  }
};

// POST /ordemCompra/complete — cria ordem com múltiplos itens e fornecedores
export const criarOrdemCompleta = async (req, res) => {
  const {
    data_ordem,
    data_entrega_prevista,
    observacao,
    pedidos_filial = [],
    itens = []
  } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const valor_total = itens.reduce(
      (sum, i) => sum + i.preco_unitario * i.quantidade,
      0
    );

    const [ordemResult] = await conn.query(
      `INSERT INTO OrdemCompra
        (data_ordem, data_entrega_prevista, valor_total, status, observacao)
      VALUES (?, ?, ?, 'Pendente', ?)`,
      [data_ordem, data_entrega_prevista, valor_total, observacao]
    );
    const id_ordem = ordemResult.insertId;

    for (const id_ped of pedidos_filial) {
      await conn.query(
        `INSERT INTO OrdemCompraPedidoFilial (id_ordem_compra, id_pedido_filial)
         VALUES (?, ?)`,
        [id_ordem, id_ped]
      );
    }

    for (const { id_produto, id_fornecedor: itemFornecedor, quantidade, preco_unitario } of itens) {
      const [pfRes] = await conn.query(
        `INSERT INTO ProdutoFornecedor (id_produto, id_fornecedor, preco, ativo)
         VALUES (?, ?, ?, TRUE)`,
        [id_produto, itemFornecedor, preco_unitario]
      );
      const id_pf = pfRes.insertId;

      await conn.query(
        `INSERT INTO ItensOrdemCompra
           (id_ordem_compra, id_produto, id_produto_fornecedor, quantidade, preco_unitario)
         VALUES (?, ?, ?, ?, ?)`,
        [id_ordem, id_produto, id_pf, quantidade, preco_unitario]
      );
    }

    await conn.commit();
    res.status(201).json({ data: { id_ordem_compra: id_ordem } });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar ordem completa: ' + err.message });
  } finally {
    conn.release();
  }
};

export const atualizarOrdemCompleta = async (req, res) => {
  const { id_ordem_compra, itens } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Atualiza dados da ordem (ex.: status, data_entrega, valor_total…)
    await conn.query(
      `UPDATE OrdemCompra
         SET status = ?, 
             data_entrega_prevista = ?, 
             valor_total = ?
       WHERE id_ordem_compra = ?`,
      [req.body.status, req.body.data_entrega_prevista, req.body.valor_total, id_ordem_compra]
    );

    // 2) Para cada item, atualiza usando a coluna correta id_fornecedor:
    for (const item of itens) {
      await conn.query(
        `UPDATE ItensOrdemCompra
            SET id_fornecedor   = ?,   -- em vez de id_produto_fornecedor
                quantidade      = ?,
                preco_unitario  = ?
          WHERE id_ordem_compra = ?
            AND id_produto      = ?`,
        [
          item.id_fornecedor,
          item.quantidade,
          item.preco_unitario,
          id_ordem_compra,
          item.id_produto
        ]
      );
    }

    // 3) (opcional) insere novos itens, deleta removidos, etc.

    await conn.commit();
    res.json({ message: 'Ordem de compra atualizada com sucesso' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar ordem de compra' });
  } finally {
    conn.release();
  }
};