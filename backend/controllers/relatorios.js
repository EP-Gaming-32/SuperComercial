// backend/controllers/relatorios.js

import pool from '../config/db.js'; // Verifique se o caminho está correto

// RELATÓRIO: Pedidos por filial (histórico por mês)
export const relatorioPedidosPorFilial = async (req, res) => {
    const { id_filial } = req.query;
    try {
        const [rows] = await pool.query(
            `SELECT
                DATE_FORMAT(p.data_pedido, '%Y-%m') AS mes,
                f.id_filial,
                f.nome_filial,
                COUNT(p.id_pedido_filial) AS total_pedidos,
                COALESCE(SUM(oc.valor_total), 0) AS valor_total_pedidos
                FROM PedidoFilial p
                LEFT JOIN Filial f ON p.id_filial = f.id_filial
                LEFT JOIN OrdemCompraPedidoFilial ocpf ON p.id_pedido_filial = ocpf.id_pedido_filial
                LEFT JOIN OrdemCompra oc ON ocpf.id_ordem_compra = oc.id_ordem_compra
                ${id_filial ? 'WHERE p.id_filial = ?' : ''}
                GROUP BY mes, f.id_filial, f.nome_filial
                ORDER BY mes, f.id_filial;`,
            id_filial ? [id_filial] : []
        );
        res.json(rows);
    } catch (error) {
        console.error('Erro em relatorioPedidosPorFilial:', error);
        res.status(500).json({ error: 'Erro interno ao gerar relatório de pedidos por filial' });
    }
};

// RELATÓRIO: Estoque por filial (detalhado por produto)
export const relatorioEstoquePorFilial = async (req, res) => {
    const { id_filial } = req.query;
    try {
        let query = `
            SELECT
                f.id_filial,
                f.nome_filial,
                p.id_produto,
                p.nome_produto,
                e.quantidade,
                e.status_estoque
            FROM Estoque e
            LEFT JOIN Filial f ON e.id_filial = f.id_filial
            LEFT JOIN Produtos p ON e.id_produto = p.id_produto
        `;
        const params = [];
        if (id_filial) {
            query += ` WHERE e.id_filial = ?`;
            params.push(id_filial);
        }
        query += ` ORDER BY f.nome_filial, p.nome_produto;`;
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Erro em relatorioEstoquePorFilial:', error);
        res.status(500).json({ error: 'Erro interno ao gerar relatório de estoque por filial' });
    }
};

// RELATÓRIO: Fornecedores por filial
export const relatorioFornecedoresPorFilial = async (req, res) => {
    const { id_filial } = req.query;
    try {
        const conditions = ['1=1'];
        const params = [];
        if (id_filial) {
            conditions.push('pf.id_filial = ?');
            params.push(id_filial);
        }
        const [rows] = await pool.query(
            `SELECT DISTINCT
                f.id_filial,
                f.nome_filial,
                fo.id_fornecedor,
                fo.nome_fornecedor
                FROM Filial f
                JOIN PedidoFilial pf ON f.id_filial = pf.id_filial
                JOIN OrdemCompraPedidoFilial ocpf ON pf.id_pedido_filial = ocpf.id_pedido_filial
                JOIN OrdemCompra oc ON ocpf.id_ordem_compra = oc.id_ordem_compra
                JOIN ItensOrdemCompra ioc ON oc.id_ordem_compra = ioc.id_ordem_compra
                JOIN Fornecedor fo ON ioc.id_fornecedor = fo.id_fornecedor
                WHERE ${conditions.join(' AND ')}
                ORDER BY f.nome_filial, fo.nome_fornecedor;`,
            params
        );
        res.json(rows);
    } catch (error) {
        console.error('Erro em relatorioFornecedoresPorFilial:', error);
        res.status(500).json({ error: 'Erro interno ao gerar relatório de fornecedores por filial' });
    }
};

// RELATÓRIO: Pagamentos por filial
export const relatorioPagamentosPorFilial = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
                f.id_filial,
                f.nome_filial,
                fp.descricao AS forma_pagamento,
                COUNT(me.id_movimentacao) AS total_movimentacoes,
                COALESCE(SUM(me.quantidade), 0) AS total_quantidade
                FROM MovimentacaoEstoque me
                JOIN Estoque e
                    ON me.id_estoque = e.id_estoque
                JOIN Filial f
                    ON e.id_filial = f.id_filial
                LEFT JOIN FormaPagamento fp
                    ON me.id_forma_pagamento = fp.id_forma_pagamento
                WHERE me.tipo_movimentacao = 'Vendido'
                GROUP BY
                    f.id_filial,
                    f.nome_filial,
                    fp.descricao
                ORDER BY
                    f.nome_filial,
                    fp.descricao;`
        );

        res.json(rows);
    } catch (error) {
        console.error('Erro em relatorioPagamentosPorFilial (movimentações Vendido):', error);
        res.status(500).json({ error: 'Erro interno ao gerar relatório de formas de pagamento por filial' });
    }
};

// RELATÓRIO: Previsão de Pedidos (baseado no histórico de PedidoFilial)
export const relatorioPrevisaoPedido = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                f.id_filial,
                f.nome_filial,
                DATE_FORMAT(p.data_pedido, '%Y-%m') AS mes,
                COUNT(*) AS total_pedidos
            FROM PedidoFilial p
            JOIN Filial f ON p.id_filial = f.id_filial
            GROUP BY f.id_filial, f.nome_filial, mes
            ORDER BY f.id_filial, mes;
        `);

        const agrupado = {};
        rows.forEach(r => {
            const key = r.id_filial;
            agrupado[key] = agrupado[key] || { nome_filial: r.nome_filial, historico: [] };
            agrupado[key].historico.push({ mes: r.mes, total_pedidos: r.total_pedidos });
        });

        const resultado = Object.entries(agrupado).map(([id, { nome_filial, historico }]) => {
            const ult3 = historico.slice(-3);
            const media = Math.round(ult3.reduce((sum, h) => sum + h.total_pedidos, 0) / (ult3.length || 1));
            const proximos = ['2025-06', '2025-07', '2025-08'].map(m => ({ mes: m, total_pedidos: media, previsao: true }));
            return { id_filial: Number(id), nome_filial, dados: [...historico.map(h => ({ ...h, previsao: false })), ...proximos] };
        });

        res.json(resultado);
    } catch (error) {
        console.error('Erro em relatorioPrevisaoPedido:', error);
        res.status(500).json({ error: 'Erro interno ao gerar relatório de previsão de pedidos' });
    }
};

// RELATÓRIO: Status por Estoque (normal, baixo, crítico) - AGORA FILTRA POR CATEGORIA (id_grupo)
export const relatorioStatusPorEstoque = async (req, res) => {
    const { id_filial, id_grupo } = req.query; // Adicionado id_grupo
    try {
        let query = `
            SELECT
                e.status_estoque AS name,
                COUNT(*) AS value
            FROM Estoque e
            JOIN Produtos p ON e.id_produto = p.id_produto
            JOIN Grupos g ON p.id_grupo = g.id_grupo
        `;
        const params = [];
        const conditions = [];

        if (id_filial) {
            conditions.push('e.id_filial = ?');
            params.push(id_filial);
        }
        if (id_grupo) { // Adiciona filtro por grupo
            conditions.push('g.id_grupo = ?');
            params.push(id_grupo);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` GROUP BY e.status_estoque;`;
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Erro em relatorioStatusPorEstoque:', error);
        res.status(500).json({ error: 'Erro interno ao buscar status de estoque' });
    }
};

// RELATÓRIO: Estoque Por Produto - AGORA FILTRA POR CATEGORIA (id_grupo)
export const relatorioEstoquePorProduto = async (req, res) => {
    const { id_filial, id_grupo } = req.query; // Adicionado id_grupo
    try {
        let query = `
            SELECT
                p.nome_produto AS name,
                e.quantidade AS estoque_quantidade
            FROM Estoque e
            JOIN Produtos p ON p.id_produto = e.id_produto
            JOIN Grupos g ON p.id_grupo = g.id_grupo -- Adicionado JOIN com Grupos
        `;
        const params = [];
        const conditions = [];

        if (id_filial) {
            conditions.push('e.id_filial = ?');
            params.push(id_filial);
        }
        if (id_grupo) { // Adiciona filtro por grupo
            conditions.push('g.id_grupo = ?');
            params.push(id_grupo);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY estoque_quantidade DESC LIMIT 5;`; // Adicionado ORDER BY e LIMIT para "Top 5"
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Erro em relatorioEstoquePorProduto:', error);
        res.status(500).json({ error: 'Erro interno ao buscar estoque por produto' });
    }
};

// RELATÓRIO: Compras por Mês
export const relatorioComprasPorMes = async (req, res) => {
    const { id_filial } = req.query;
    try {
        let query = `
            SELECT
                MONTH(oc.data_ordem) AS mes,
                DATE_FORMAT(oc.data_ordem, '%b') AS month_abbr,
                SUM(oc.valor_total) AS valor_total_compras
            FROM OrdemCompra oc
            JOIN OrdemCompraPedidoFilial ocpf ON oc.id_ordem_compra = ocpf.id_ordem_compra
            JOIN PedidoFilial pf ON ocpf.id_pedido_filial = pf.id_pedido_filial
        `;
        const params = [];
        if (id_filial) {
            query += ` WHERE pf.id_filial = ?`;
            params.push(id_filial);
        }
        query += ` GROUP BY mes, month_abbr ORDER BY mes;`;
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Erro em relatorioComprasPorMes:', error);
        res.status(500).json({ error: 'Erro interno ao buscar compras por mês' });
    }
};

// RELATÓRIO: Estoque Crítico / Alertas
export const relatorioEstoqueAlertas = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const { nome_produto, id_produto, id_fornecedor, id_filial, id_grupo } = req.query; // Adicionado id_grupo
    const conditions = [`e.status_estoque IN ('Critico','Baixo')`];
    const values = [];

    // Base query para JOINs
    const joinClauses = `
        JOIN Produtos p ON e.id_produto = p.id_produto
        JOIN Fornecedor f ON e.id_fornecedor = f.id_fornecedor
        JOIN Filial fi ON e.id_filial = fi.id_filial
        LEFT JOIN Grupos g ON p.id_grupo = g.id_grupo -- Adicionado JOIN com Grupos
    `;

    if (nome_produto) {
        conditions.push(`p.nome_produto LIKE ?`);
        values.push(`%${nome_produto}%`);
    }
    if (id_produto) {
        conditions.push(`e.id_produto = ?`);
        values.push(id_produto);
    }
    if (id_fornecedor) {
        conditions.push(`e.id_fornecedor = ?`);
        values.push(id_fornecedor);
    }
    if (id_filial) {
        conditions.push(`e.id_filial = ?`);
        values.push(id_filial);
    }
    if (id_grupo) { // Adiciona filtro por grupo
        conditions.push(`g.id_grupo = ?`);
        values.push(id_grupo);
    }

    const where = `WHERE ` + conditions.join(' AND ');
    try {
        const [countResult] = await pool.query(
            `SELECT COUNT(*) AS total FROM Estoque e
             ${joinClauses}
             ${where}`, values
        );
        const totalRecords = countResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit);
        const [rows] = await pool.query(
            `SELECT
                p.nome_produto,
                f.nome_fornecedor,
                fi.nome_filial,
                e.quantidade,
                e.status_estoque
            FROM Estoque e
            ${joinClauses}
            ${where}
            LIMIT ? OFFSET ?`, [...values, limit, offset]
        );
        res.json({ data: rows, page, limit, totalRecords, totalPages });
    } catch (error) {
        console.error('Erro em relatorioEstoqueAlertas:', error);
        res.status(500).json({ error: 'Erro interno ao listar alertas de estoque' });
    }
};

// RELATÓRIO: Produtos Vencidos
export const relatorioProdutosVencidosDanificados = async (req, res) => {
    const { id_filial } = req.query;
    try {
        const params = [];
        let filtroFilial = '';
        if (id_filial) {
            filtroFilial = 'AND e.id_filial = ?';
            params.push(id_filial);
        }

        const [rows] = await pool.query(
            `
            SELECT
                f.id_filial,
                f.nome_filial,
                -- soma de todos os movimentos ‘Vencido’
                COALESCE(SUM(CASE WHEN me.tipo_movimentacao = 'Vencido'   THEN me.quantidade ELSE 0 END), 0) AS vencidos,
                -- soma de todos os movimentos ‘Quebrado’ (usado aqui como “danificado”)
                COALESCE(SUM(CASE WHEN me.tipo_movimentacao = 'Quebrado' THEN me.quantidade ELSE 0 END), 0) AS danificados
            FROM MovimentacaoEstoque me
            JOIN Estoque e ON me.id_estoque = e.id_estoque
            JOIN Filial f   ON e.id_filial    = f.id_filial
            WHERE me.tipo_movimentacao IN ('Vencido','Quebrado')
                ${filtroFilial}
            GROUP BY f.id_filial, f.nome_filial
            ORDER BY f.nome_filial;
            `,
            params
        );

        // Garante que, mesmo sem registros, retorna 0
        const resultado = rows.map(r => ({
            id_filial:    r.id_filial,
            nome_filial: r.nome_filial,
            vencidos:     Number(r.vencidos),
            danificados: Number(r.danificados)
        }));

        res.json(resultado);
    } catch (error) {
        console.error('Erro em relatorioProdutosVencidosDanificados:', error);
        res
            .status(500)
            .json({ error: 'Erro interno ao gerar relatório de produtos vencidos/danificados' });
    }
};

// RELATÓRIO: Produtos Mais Vendidos - AGORA TAMBÉM FILTRA POR CATEGORIA (id_grupo)
export const relatorioProdutosMaisVendidos = async (req, res) => {
    const { id_filial, id_grupo } = req.query; // Adicionado id_grupo
    try {
        let query = `
            SELECT
                f.id_filial,
                f.nome_filial,
                p.id_produto,
                p.nome_produto,
                g.nome_grupo,
                SUM(me.quantidade) AS quantidade_vendida,
                SUM(me.quantidade * p.valor_produto) AS receita_total
            FROM MovimentacaoEstoque me
            JOIN Estoque e
                ON me.id_estoque = e.id_estoque
            JOIN Filial f
                ON e.id_filial = f.id_filial
            JOIN Produtos p
                ON e.id_produto = p.id_produto
            LEFT JOIN Grupos g
                ON p.id_grupo = g.id_grupo
            WHERE me.tipo_movimentacao = 'Vendido'`;

        const params = [];
        if (id_filial) {
            query += ` AND e.id_filial = ?`;
            params.push(id_filial);
        }
        if (id_grupo) { // Adiciona filtro por grupo
            query += ` AND g.id_grupo = ?`;
            params.push(id_grupo);
        }

        query += `
            GROUP BY
                f.id_filial,
                f.nome_filial,
                p.id_produto,
                p.nome_produto,
                g.nome_grupo
            ORDER BY receita_total DESC;`;

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Erro em relatorioProdutosMaisVendidos:', error);
        res.status(500).json({ error: 'Erro interno ao gerar relatório de produtos mais vendidos' });
    }
};

// RELATÓRIO: Giro de Estoque
export const relatorioGiroEstoque = async (req, res) => {
    const { id_filial, data_inicio, data_fim, id_grupo } = req.query; // Adicionado id_grupo
    try {
        const params = [];
        const conditions = [];

        // Filtro de filial opcional
        if (id_filial) {
            conditions.push("e.id_filial = ?");
            params.push(id_filial);
        }
        // Filtro de período opcional (ex.: '2024-06-01' e '2024-12-31')
        if (data_inicio && data_fim) {
            conditions.push("me.data_movimentacao BETWEEN ? AND ?");
            params.push(data_inicio, data_fim);
        }
        // Filtro de grupo opcional
        if (id_grupo) {
            conditions.push("g.id_grupo = ?");
            params.push(id_grupo);
        }

        let whereClause = "";
        if (conditions.length > 0) {
            whereClause = `WHERE ${conditions.join(' AND ')}`;
        }

        const [rows] = await pool.query(
            `
            SELECT
                p.id_produto,
                p.nome_produto,
                g.nome_grupo,
                e.quantidade          AS quantidade_atual,
                COALESCE(
                    SUM(CASE WHEN me.tipo_movimentacao = 'Vendido' THEN me.quantidade ELSE 0 END),
                    0
                )                     AS vendas_periodo
            FROM Estoque e
            JOIN Produtos p   ON e.id_produto = p.id_produto
            LEFT JOIN Grupos  g ON p.id_grupo   = g.id_grupo
            LEFT JOIN MovimentacaoEstoque me
                ON me.id_estoque = e.id_estoque
                AND me.tipo_movimentacao = 'Vendido'
                ${(data_inicio && data_fim) ? 'AND me.data_movimentacao BETWEEN ? AND ?' : ''} -- Este filtro de período precisa ser adicionado aqui também para a sub-condição do LEFT JOIN
            ${whereClause} -- WHERE principal para todos os filtros
            GROUP BY p.id_produto, p.nome_produto, g.nome_grupo, e.quantidade
            ORDER BY vendas_periodo DESC;
            `,
            // Para o segundo conjunto de parâmetros do BETWEEN na sub-condição, você precisa garantir que eles sejam adicionados na ordem correta.
            // Para simplificar e evitar duplicação ou ordem incorreta, é melhor que o BETWEEN seja parte do WHERE principal.
            // A forma como as conditions e params estão sendo construídas para o WHERE principal já é mais robusta.
            // A sub-condição no LEFT JOIN foi removida para usar apenas o WHERE principal.
            params
        );

        // Apenas devolver o JSON cru ao front-end:
        res.json(rows);
    } catch (error) {
        console.error("Erro em relatorioGiroEstoque:", error);
        res.status(500).json({ error: "Erro interno ao gerar relatório de giro de estoque" });
    }
};
