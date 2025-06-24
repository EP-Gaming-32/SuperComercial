import pool from '../config/db.js';

// GET /ordemCompra/itensPedidoFilial?id_pedido_filial=...
export const listarItensPedidoFilial = async (req, res) => {
  const { id_pedido_filial } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT ipf.id_item_filial,
              ipf.id_pedido_filial,
              ipf.id_produto,
              p.nome_produto,
              ipf.quantidade
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
      `SELECT id_produtoFornecedor AS id,
              id_produto,
              id_fornecedor,
              preco,
              prazo_entrega
       FROM ProdutoFornecedor
       WHERE ativo = 1`
    );
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar produto-fornecedor' });
  }
};

// POST /ordemCompra — criação básica de ordem (sem itens)
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

// POST /ordemCompra/itens — grava histórico e insere item usando id_fornecedor
export const criarItemOrdemCompra = async (req, res) => {
  const { id_ordem_compra, id_produto, id_fornecedor, quantidade, preco_unitario } = req.body;
  try {
    // 1) Histórico em ProdutoFornecedor
    await pool.query(
      `INSERT INTO ProdutoFornecedor
         (id_produto, id_fornecedor, preco, prazo_entrega, ativo)
       VALUES (?, ?, ?, NULL, TRUE)`,
      [id_produto, id_fornecedor, preco_unitario]
    );

    // 2) Insere item referenciando apenas id_fornecedor
    await pool.query(
      `INSERT INTO ItensOrdemCompra
         (id_ordem_compra, id_produto, id_fornecedor, quantidade, preco_unitario)
       VALUES (?, ?, ?, ?, ?)`,
      [id_ordem_compra, id_produto, id_fornecedor, quantidade, preco_unitario]
    );

    res.status(201).json({ message: 'Item da ordem criado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar item de ordem de compra' });
  }
};

// GET /ordemCompra — lista todas as ordens
export const listarOrdensCompra = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id_ordem_compra,
              data_ordem,
              data_entrega_prevista,
              valor_total,
              status,
              observacao
       FROM OrdemCompra
       ORDER BY data_ordem DESC`
    );
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar ordens de compra' });
  }
};

// DELETE /ordemCompra/:id — cancela e remove vínculos de estoque
export const cancelarOrdemCompra = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE OrdemCompra
         SET status = 'Cancelado',
             data_atualizacao = CURRENT_TIMESTAMP
       WHERE id_ordem_compra = ?`,
      [id]
    );
    await conn.query(
      `DELETE FROM OrdemCompraEstoque WHERE id_ordem_compra = ?`,
      [id]
    );
    await conn.commit();
    res.json({ message: 'Ordem de compra cancelada e vínculos removidos' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erro ao cancelar ordem de compra' });
  } finally {
    conn.release();
  }
};

// GET /ordemCompra/historico?id_ordem_compra=...
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

// GET /ordemCompra/detalhes/:id — detalhes sem duplicar (pega último vínculo)
export const listarDetalhesOrdemCompra = async (req, res) => {
  const { id } = req.params;
  try {
    // 1) Dados da Ordem
    const [ordemRows] = await pool.query(
      `SELECT id_ordem_compra,
              data_ordem,
              data_entrega_prevista,
              valor_total,
              status,
              observacao
       FROM OrdemCompra
       WHERE id_ordem_compra = ?`,
      [id]
    );
    if (!ordemRows.length) {
      return res.status(404).json({ message: 'Ordem não encontrada' });
    }
    const ordem = ordemRows[0];

    // 2) Itens + último vínculo ativo em ProdutoFornecedor
    const [itensRows] = await pool.query(
      `SELECT
         ioc.id_item_oc          AS id,
         ioc.id_produto,
         p.nome_produto,
         ioc.id_fornecedor,
         f.nome_fornecedor,
         ioc.quantidade,
         ioc.preco_unitario,
         pf.id_produtoFornecedor AS id_produto_fornecedor,
         pf.prazo_entrega
       FROM ItensOrdemCompra ioc
       JOIN Produtos p ON p.id_produto = ioc.id_produto
       JOIN Fornecedor f ON f.id_fornecedor = ioc.id_fornecedor
       JOIN ProdutoFornecedor pf ON pf.id_produto = ioc.id_produto
         AND pf.id_fornecedor = ioc.id_fornecedor
         AND pf.ativo = TRUE
       JOIN (
         SELECT id_produto, id_fornecedor, MAX(id_produtoFornecedor) AS max_pf
         FROM ProdutoFornecedor
         WHERE ativo = TRUE
         GROUP BY id_produto, id_fornecedor
       ) mx ON mx.id_produto = pf.id_produto
         AND mx.id_fornecedor = pf.id_fornecedor
         AND mx.max_pf = pf.id_produtoFornecedor
       WHERE ioc.id_ordem_compra = ?`,
      [id]
    );

    // 3) Estoques vinculados
    const [estoquesRows] = await pool.query(
      `SELECT oce.id_estoque,
              e.id_filial,
              e.quantidade,
              e.id_produto
       FROM OrdemCompraEstoque oce
       JOIN Estoque e ON e.id_estoque = oce.id_estoque
       WHERE oce.id_ordem_compra = ?`,
      [id]
    );

    // 4) Retorna tudo junto
    res.json({
      data: {
        ...ordem,
        itens: itensRows,
        estoques_vinculados: estoquesRows
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar detalhes da ordem' });
  }
};

// POST /ordemCompra/complete — cria ordem + itens (histórico em ProdutoFornecedor)
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

    // calcula valor total
    const valor_total = itens.reduce(
      (sum, i) => sum + i.preco_unitario * i.quantidade,
      0
    );

    // insere ordem
    const [ordemResult] = await conn.query(
      `INSERT INTO OrdemCompra
         (data_ordem, data_entrega_prevista, valor_total, status, observacao)
       VALUES (?, ?, ?, 'Pendente', ?)`,
      [data_ordem, data_entrega_prevista, valor_total, observacao]
    );
    const id_ordem = ordemResult.insertId;

    // vincula pedidos
    for (const id_ped of pedidos_filial) {
      await conn.query(
        `INSERT INTO OrdemCompraPedidoFilial
           (id_ordem_compra, id_pedido_filial)
         VALUES (?, ?)`,
        [id_ordem, id_ped]
      );
    }

    // cada item: grava histórico e insere usando id_fornecedor
    for (const { id_produto, id_fornecedor, quantidade, preco_unitario } of itens) {
      await conn.query(
        `INSERT INTO ProdutoFornecedor
           (id_produto, id_fornecedor, preco, ativo)
         VALUES (?, ?, ?, TRUE)`,
        [id_produto, id_fornecedor, preco_unitario]
      );
      await conn.query(
        `INSERT INTO ItensOrdemCompra
           (id_ordem_compra, id_produto, id_fornecedor, quantidade, preco_unitario)
         VALUES (?, ?, ?, ?, ?)`,
        [id_ordem, id_produto, id_fornecedor, quantidade, preco_unitario]
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

// PATCH /ordemCompra/complete/:id — atualiza ordem completa
export const atualizarOrdemCompleta = async (req, res) => {
  const id_ordem_compra = parseInt(req.params.id, 10);
  const { status, data_entrega_prevista, id_filial = null, itens = [] } = req.body;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1) Atualiza status e data_entrega_prevista
    await conn.query(
      `UPDATE OrdemCompra
         SET status = ?, data_entrega_prevista = ?
       WHERE id_ordem_compra = ?`,
      [status, data_entrega_prevista, id_ordem_compra]
    );

    // 2) Se “Em Separação no CD”: cria estoques e vincula
    if (status === 'Em Separação no CD') {
      for (const item of itens) {
        const estoque_minimo = Math.ceil(item.quantidade * 0.2);
        const estoque_maximo = item.quantidade * 2;
        const [estoqueRes] = await conn.query(
          `INSERT INTO Estoque
             (id_produto, id_fornecedor, id_filial, local_armazenamento,
              quantidade, estoque_minimo, estoque_maximo)
           VALUES (?, ?, 1, ?, ?, ?, ?)`,
          [
            item.id_produto,
            item.id_fornecedor,
            item.local_armazenamento,
            item.quantidade,
            estoque_minimo,
            estoque_maximo
          ]
        );
        const id_estoque = estoqueRes.insertId;
        await conn.query(
          `INSERT INTO OrdemCompraEstoque
             (id_ordem_compra, id_estoque)
           VALUES (?, ?)`,
          [id_ordem_compra, id_estoque]
        );
      }
    }

    // 3) Se “Recebido na Filial”: atualiza id_filial dos estoques ligados
    if (status === 'Recebido na Filial' && id_filial) {
      const [estoques] = await conn.query(
        `SELECT e.id_estoque
         FROM Estoque e
         JOIN OrdemCompraEstoque oce ON oce.id_estoque = e.id_estoque
         WHERE oce.id_ordem_compra = ?`,
        [id_ordem_compra]
      );
      for (const { id_estoque } of estoques) {
        await conn.query(
          `UPDATE Estoque
             SET id_filial = ?
           WHERE id_estoque = ?`,
          [id_filial, id_estoque]
        );
      }
    }

    // 4) Atualiza itens (mantendo id_fornecedor)
    for (const item of itens) {
      await conn.query(
        `UPDATE ItensOrdemCompra
           SET id_fornecedor = ?, quantidade = ?, preco_unitario = ?
         WHERE id_ordem_compra = ? AND id_produto = ?`,
        [
          item.id_fornecedor,
          item.quantidade,
          item.preco_unitario,
          id_ordem_compra,
          item.id_produto
        ]
      );
    }

    await conn.commit();
    res.json({ message: 'Ordem de compra atualizada com sucesso.' });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar ordem: ' + err.message });
  } finally {
    conn.release();
  }
};