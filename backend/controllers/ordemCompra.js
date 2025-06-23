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
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Atualiza o status da ordem
    await conn.query(
      `UPDATE OrdemCompra
         SET status = 'Cancelado',
             data_atualizacao = CURRENT_TIMESTAMP
       WHERE id_ordem_compra = ?`,
      [id]
    );

    // 🔥 Remove os vínculos da ordem com os estoques
    await conn.query(
      `DELETE FROM OrdemCompraEstoque
       WHERE id_ordem_compra = ?`,
      [id]
    );

    await conn.commit();
    res.json({ message: 'Ordem de compra cancelada e vínculo removido' });

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
    // 1) Buscar dados da ordem
    const [ordemRows] = await pool.query(
      `SELECT id_ordem_compra, data_ordem, data_entrega_prevista,
              valor_total, status, observacao
       FROM OrdemCompra
       WHERE id_ordem_compra = ?`,
      [id]
    );
    if (!ordemRows.length) return res.status(404).json({ message: 'Ordem não encontrada' });
    const ordem = ordemRows[0];

    // 2) Buscar itens da ordem + vínculo em ProdutoFornecedor
    const [itensRows] = await pool.query(
      `SELECT
         ioc.id_item_oc    AS id,
         ioc.id_produto,
         p.nome_produto,
         ioc.id_fornecedor,
         f.nome_fornecedor,
         ioc.quantidade,
         ioc.preco_unitario,
         pf.id_produtoFornecedor AS id_produto_fornecedor,
         pf.prazo_entrega
       FROM ItensOrdemCompra ioc
       JOIN Produtos p   ON p.id_produto = ioc.id_produto
       JOIN Fornecedor f ON f.id_fornecedor = ioc.id_fornecedor
       LEFT JOIN ProdutoFornecedor pf
         ON pf.id_produto   = ioc.id_produto
        AND pf.id_fornecedor = ioc.id_fornecedor
        AND pf.ativo = TRUE
       WHERE ioc.id_ordem_compra = ?`,
      [id]
    );

    // 3) Buscar estoques vinculados
    const [estoquesRows] = await pool.query(
      `SELECT oce.id_estoque, e.id_filial, e.quantidade, e.id_produto
       FROM OrdemCompraEstoque oce
       JOIN Estoque e ON e.id_estoque = oce.id_estoque
       WHERE oce.id_ordem_compra = ?`,
      [id]
    );

    // 4) Retornar
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
        `INSERT INTO OrdemCompraPedidoFilial (id_ordem_compra, id_pedido_filial)
         VALUES (?, ?)`,
        [id_ordem, id_ped]
      );
    }

    // insere fornecedores e itens
    for (const { id_produto, id_fornecedor, quantidade, preco_unitario } of itens) {
      // grava vínculo em ProdutoFornecedor (histórico)
      await conn.query(
        `INSERT INTO ProdutoFornecedor
           (id_produto, id_fornecedor, preco, ativo)
         VALUES (?, ?, ?, TRUE)`,
        [id_produto, id_fornecedor, preco_unitario]
      );
      // insere item de ordem apontando para id_fornecedor
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

export const atualizarOrdemCompleta = async (req, res) => {
  const id_ordem_compra = parseInt(req.params.id, 10);
  const { status, data_entrega_prevista, id_filial = null, itens = [] } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Atualiza status e previsão
    await conn.query(
      `UPDATE OrdemCompra
         SET status = ?, data_entrega_prevista = ?
       WHERE id_ordem_compra = ?`,
      [status, data_entrega_prevista, id_ordem_compra]
    );

    // 2) Se “Em Separação no CD”: cria Estoque na filial 1 (CD)
    if (status === 'Em Separação no CD') {
      for (const item of itens) {
        const estoque_minimo = Math.ceil(item.quantidade * 0.2);
        const estoque_maximo = item.quantidade * 2;

        const [estoqueRes] = await conn.query(
          `INSERT INTO Estoque
            (id_produto, id_fornecedor, id_filial,
              local_armazenamento, quantidade, estoque_minimo, estoque_maximo)
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

        // 🔗 Cria vínculo com a ordem
        await conn.query(
          `INSERT INTO OrdemCompraEstoque (id_ordem_compra, id_estoque)
          VALUES (?, ?)`,
          [id_ordem_compra, id_estoque]
        );
      }
    }

    // 3) Se “Recebido na Filial”: move o estoque da filial 1 para a filial de destino
    if (status === 'Recebido na Filial' && id_filial) {
      const [estoques] = await conn.query(
        `SELECT e.id_estoque
        FROM Estoque e
        JOIN OrdemCompraEstoque oce ON oce.id_estoque = e.id_estoque
        WHERE oce.id_ordem_compra = ?`,
        [id_ordem_compra]
      );

      for (const estoque of estoques) {
        await conn.query(
          `UPDATE Estoque
          SET id_filial = ?
          WHERE id_estoque = ?`,
          [id_filial, estoque.id_estoque]
        );
      }
    }

    // 4) Atualiza cada item da ordem (fornecedor, quantidade e preço)
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