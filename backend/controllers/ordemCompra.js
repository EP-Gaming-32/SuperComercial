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

// POST /ordemCompra
export const criarOrdemCompra = async (req, res) => {
  const { id_fornecedor, data_ordem, data_entrega_prevista, valor_total, observacao } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO OrdemCompra
       (id_fornecedor, data_ordem, data_entrega_prevista, valor_total, status, observacao)
       VALUES (?, ?, ?, ?, 'Pendente', ?)`,
      [id_fornecedor, data_ordem, data_entrega_prevista, valor_total, observacao]
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

// POST /ordemCompra/itens
export const criarItemOrdemCompra = async (req, res) => {
  const { id_ordem_compra, id_produto, quantidade, preco_unitario } = req.body;
  try {
    await pool.query(
      `INSERT INTO ItensOrdemCompra (id_ordem_compra, id_produto, quantidade, preco_unitario)
       VALUES (?, ?, ?, ?)`,
      [id_ordem_compra, id_produto, quantidade, preco_unitario]
    );
    res.status(201).json({ message: 'Item da ordem criado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar item de ordem de compra' });
  }
};

// GET /ordemCompra           — lista todas as ordens
export const listarOrdensCompra = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT oc.id_ordem_compra,
              oc.id_fornecedor,
              f.nome_fornecedor,
              oc.data_ordem,
              oc.data_entrega_prevista,
              oc.valor_total,
              oc.status,
              oc.observacao
       FROM OrdemCompra oc
       JOIN Fornecedor f ON f.id_fornecedor = oc.id_fornecedor
       ORDER BY oc.data_ordem DESC`
    );
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar ordens de compra' });
  }
};

// DELETE /ordemCompra/:id    — marca a ordem como Cancelado
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

// GET /ordemCompra/historico?id_ordem_compra=...  — histórico de status
export const listarHistoricoStatusOrdemCompra = async (req, res) => {
  const { id_ordem_compra } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT h.id_historico_oc,
              h.id_ordem_compra,
              h.status_antigo,
              h.status_novo,
              h.usuario_id,
              u.Nome AS nome_usuario,
              h.motivo,
              h.data_alteracao
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

export const listarDetalhesOrdemCompra = async (req, res) => {
  const { id } = req.params;
  try {
    // 1) Dados da ordem
    const [ordemRows] = await pool.query(
      `SELECT oc.id_ordem_compra,
              oc.id_fornecedor,
              f.nome_fornecedor,
              oc.data_ordem,
              oc.data_entrega_prevista,
              oc.valor_total,
              oc.status,
              oc.observacao
       FROM OrdemCompra oc
       JOIN Fornecedor f USING(id_fornecedor)
       WHERE oc.id_ordem_compra = ?`,
      [id]
    );
    if (ordemRows.length === 0) {
      return res.status(404).json({ message: 'Ordem de compra não encontrada' });
    }
    const ordem = ordemRows[0];

    // 2) Itens da ordem — use id_item_oc (não id_item_ordem)
    const [itensRows] = await pool.query(
      `SELECT ioc.id_item_oc       AS id,
              ioc.id_produto,
              p.nome_produto,
              ioc.quantidade,
              ioc.preco_unitario
       FROM ItensOrdemCompra ioc
       JOIN Produtos p USING(id_produto)
       WHERE ioc.id_ordem_compra = ?`,
      [id]
    );

    // 3) Retorna tudo junto
    res.json({ data: { ...ordem, itens: itensRows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar detalhes da ordem' });
  }
};

export const criarOrdemCompleta = async (req, res) => {
  const {
    id_fornecedor,
    data_ordem,
    data_entrega_prevista,
    observacao,
    pedidos_filial = [],  // ids
    itens = []            // { id_produto, quantidade, preco_unitario }
  } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // calcula o total
    const valor_total = itens.reduce(
      (sum, i) => sum + i.preco_unitario * i.quantidade,
      0
    );

    // insere ordem com o total
    const [ordemResult] = await conn.query(
      `INSERT INTO OrdemCompra
         (id_fornecedor, data_ordem, data_entrega_prevista, valor_total, status, observacao)
       VALUES (?, ?, ?, ?, 'Pendente', ?)`,
      [id_fornecedor, data_ordem, data_entrega_prevista, valor_total, observacao]
    );
    const id_ordem = ordemResult.insertId;

    // vincula pedidos
    for (const id_ped of pedidos_filial) {
      await conn.query(
        `INSERT INTO OrdemCompraPedidoFilial (id_ordem_compra, id_pedido_filial)
         VALUES (?, ?)`,
        [id_ordem, id_ped]
      );
    }

    // insere itens com preço unitário
    for (const { id_produto, quantidade, preco_unitario } of itens) {
      await conn.query(
        `INSERT INTO ItensOrdemCompra
           (id_ordem_compra, id_produto, quantidade, preco_unitario)
         VALUES (?, ?, ?, ?)`,
        [id_ordem, id_produto, quantidade, preco_unitario]
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