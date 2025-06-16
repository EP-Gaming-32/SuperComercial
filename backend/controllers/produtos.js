import pool from '../config/db.js';

// Helper para construir cláusulas WHERE dinâmicas (já existente)
const buildWhereClause = (filters, params) => {
    const clauses = ['p.ativo = TRUE'];

    if (filters.id_grupo) {
        clauses.push('p.id_grupo = ?');
        params.push(parseInt(filters.id_grupo, 10));
    }
    if (filters.nome_produto) {
        clauses.push('p.nome_produto LIKE ?');
        params.push(`%${filters.nome_produto}%`);
    }
    if (filters.id_fornecedor) {
        clauses.push('pf.id_fornecedor = ? AND pf.ativo = TRUE');
        params.push(filters.id_fornecedor);
    }

    return clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
};

// Helper para gerar SKU automaticamente
const generateSku = async (nomeProduto, idGrupo) => {
    let groupPrefix = '';
    let productInitials = '';

    if (idGrupo) {
        try {
            const [groupRows] = await pool.query('SELECT nome_grupo FROM Grupos WHERE id_grupo = ?', [idGrupo]);
            if (groupRows.length > 0) {
                const groupName = groupRows[0].nome_grupo;
                groupPrefix = groupName.substring(0, 3).replace(/\s/g, '').toUpperCase();
            } else {
                groupPrefix = 'NGRP';
            }
        } catch (error) {
            console.error('Erro ao buscar nome do grupo para SKU:', error);
            groupPrefix = 'ERRG';
        }
    } else {
        groupPrefix = 'SGRP';
    }

    if (nomeProduto) {
        const words = nomeProduto.split(' ').filter(word => word.length > 0);
        if (words.length > 0) {
            productInitials = words.map(word => word[0]).join('').toUpperCase();
            if (productInitials.length > 5) {
                productInitials = productInitials.substring(0, 5);
            }
        } else {
            productInitials = 'NOPROD';
        }
    } else {
        productInitials = 'NOPROD';
    }

    const generateUniqueSuffix = () => Math.random().toString(36).substring(2, 6).toUpperCase();

    let newSku = `${groupPrefix}-${productInitials}-${generateUniqueSuffix()}`;

    let isUnique = false;
    let counter = 0;
    const MAX_ATTEMPTS = 5;

    while (!isUnique && counter < MAX_ATTEMPTS) {
        try {
            const [existingSkuRows] = await pool.query('SELECT sku FROM Produtos WHERE sku = ?', [newSku]);
            if (existingSkuRows.length === 0) {
                isUnique = true;
            } else {
                newSku = `${groupPrefix}-${productInitials}-${generateUniqueSuffix()}`;
                counter++;
            }
        } catch (dbError) {
            console.error('Erro de BD ao verificar unicidade do SKU:', dbError);
            throw new Error('Erro ao verificar unicidade do SKU no banco de dados.');
        }
    }

    if (!isUnique) {
        newSku = `${groupPrefix}-${productInitials}-${Date.now().toString().slice(-6)}`;
        console.warn(`SKU gerado após múltiplas colisões: ${newSku}`);
    }

    return newSku;
};

export const listarProdutos = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { nome_produto, id_grupo, id_fornecedor } = req.query;
    const values = [];
    const whereClause = buildWhereClause({ nome_produto, id_grupo, id_fornecedor }, values);

    try {
        const [countResult] = await pool.query(
            `SELECT COUNT(DISTINCT p.id_produto) AS total
             FROM Produtos p
             LEFT JOIN ProdutoFornecedor pf ON pf.id_produto = p.id_produto
             ${whereClause}`,
            values
        );
        const totalRecords = countResult[0].total;

        const [rows] = await pool.query(
            `SELECT
                p.*,
                g.nome_grupo,
                f.nome_fornecedor
            FROM Produtos p
            LEFT JOIN Grupos g ON p.id_grupo = g.id_grupo
            LEFT JOIN ProdutoFornecedor pf ON pf.id_produto = p.id_produto AND pf.ativo = TRUE
            LEFT JOIN Fornecedor f ON pf.id_fornecedor = f.id_fornecedor
            ${whereClause}
            ORDER BY p.id_produto
            LIMIT ? OFFSET ?`,
            [...values, limit, offset]
        );

        const totalPages = Math.ceil(totalRecords / limit);
        res.json({ data: rows, page, limit, totalRecords, totalPages });
    } catch (error) {
        console.error('Erro em listar produtos', error);
        res.status(500).json({ error: 'Erro interno listar produtos' });
    }
};

export const listarProdutosUnicos = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { nome_produto, id_grupo } = req.query;
    const values = [];
    const whereClause = buildWhereClause({ nome_produto, id_grupo }, values);

    try {
        const [countResult] = await pool.query(
            `SELECT COUNT(*) AS total
             FROM Produtos p
             ${whereClause}`,
            values
        );
        const totalRecords = countResult[0].total;

        const [rows] = await pool.query(
            `SELECT
                p.*,
                g.nome_grupo
            FROM Produtos p
            LEFT JOIN Grupos g ON p.id_grupo = g.id_grupo
            ${whereClause}
            ORDER BY p.id_produto
            LIMIT ? OFFSET ?`,
            [...values, limit, offset]
        );

        const totalPages = Math.ceil(totalRecords / limit);
        res.json({ data: rows, page, limit, totalRecords, totalPages });
    } catch (error) {
        console.error('Erro em listar produtos únicos', error);
        res.status(500).json({ error: 'Erro interno ao listar produtos' });
    }
};

export const criarProduto = async (req, res) => {
    const {
        nome_produto,
        id_grupo,
        valor_produto,
        codigo_barras,
        id_fornecedor,
        condicoes_pagamento
    } = req.body;

    if (!nome_produto || !valor_produto) {
        return res.status(400).json({ message: 'Campos obrigatórios faltando: nome_produto, valor_produto' });
    }

    let generatedSku;
    try {
        generatedSku = await generateSku(nome_produto, id_grupo);
    } catch (skuError) {
        console.error('Erro ao gerar SKU:', skuError);
        return res.status(500).json({ error: skuError.message || 'Erro interno ao gerar SKU do produto' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO Produtos
             (sku, nome_produto, id_grupo, valor_produto, codigo_barras)
             VALUES (?, ?, ?, ?, ?)`,
            [generatedSku, nome_produto, id_grupo || null, valor_produto, codigo_barras || null]
        );
        const productId = result.insertId;

        if (id_fornecedor) {
            await pool.query(
                `INSERT INTO ProdutoFornecedor
                 (id_produto, id_fornecedor, condicoes_pagamento, preco)
                 VALUES (?, ?, ?, ?)`,
                [productId, id_fornecedor, condicoes_pagamento || null, valor_produto]
            );
        }

        res.status(201).json({ message: 'Produto registrado com sucesso!', id_produto: productId, sku: generatedSku });
    } catch (error) {
        console.error('Erro em criar produto', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Código de barras duplicado. Verifique os dados e tente novamente.' });
        }
        res.status(500).json({ error: 'Erro interno ao criar produto' });
    }
};

export const visualizarProduto = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT
                p.*,
                g.nome_grupo,
                pf.id_fornecedor,
                f.nome_fornecedor,
                pf.condicoes_pagamento,
                pf.preco AS preco_fornecedor
            FROM Produtos p
            LEFT JOIN Grupos g ON p.id_grupo = g.id_grupo
            LEFT JOIN ProdutoFornecedor pf ON pf.id_produto = p.id_produto AND pf.ativo = TRUE
            LEFT JOIN Fornecedor f ON pf.id_fornecedor = f.id_fornecedor
            WHERE p.id_produto = ? AND p.ativo = TRUE`,
            [id]
        );
        if (!rows.length) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Erro em visualizar produto', error);
        res.status(500).json({ message: 'Erro interno ao visualizar produto' });
    }
};

export const atualizarProduto = async (req, res) => {
    const { id } = req.params;
    const dados = req.body;
    const {
        id_fornecedor,
        condicoes_pagamento
    } = req.body;

    const camposPermitidos = [
        'sku', 'nome_produto', 'id_grupo', 'valor_produto', 'codigo_barras'
    ];

    const fields = [];
    const values = [];
    for (const campo of camposPermitidos) {
        if (dados[campo] !== undefined) {
            fields.push(`${campo} = ?`);
            values.push(dados[campo]);
        }
    }

    if (!fields.length) {
        return res.status(400).json({ message: 'Nenhuma alteração feita' });
    }

    try {
        const [result] = await pool.query(
            `UPDATE Produtos
             SET ${fields.join(', ')}, data_atualizacao = CURRENT_TIMESTAMP
             WHERE id_produto = ? AND ativo = TRUE`,
            [...values, id]
        );
        if (!result.affectedRows) {
            return res.status(404).json({ message: 'Produto não encontrado ou inativo' });
        }

        if (id_fornecedor) {
            const [pfUpdateResult] = await pool.query(
                `UPDATE ProdutoFornecedor
                 SET condicoes_pagamento = ?, preco = ?, data_atualizacao = CURRENT_TIMESTAMP
                 WHERE id_produto = ? AND id_fornecedor = ? AND ativo = TRUE`,
                [condicoes_pagamento || null, dados.valor_produto, id, id_fornecedor]
            );

            if (pfUpdateResult.affectedRows === 0) {
                const [pfReactivateResult] = await pool.query(
                    `UPDATE ProdutoFornecedor SET ativo = TRUE, data_atualizacao = CURRENT_TIMESTAMP
                     WHERE id_produto = ? AND id_fornecedor = ? AND ativo = FALSE`,
                    [id, id_fornecedor]
                );

                if (pfReactivateResult.affectedRows === 0) {
                    await pool.query(
                        `INSERT INTO ProdutoFornecedor
                         (id_produto, id_fornecedor, condicoes_pagamento, preco)
                         VALUES (?, ?, ?, ?)`,
                        [id, id_fornecedor, condicoes_pagamento || null, dados.valor_produto]
                    );
                }
            }
        } else if (dados.valor_produto !== undefined || condicoes_pagamento !== undefined) {
            await pool.query(
                `UPDATE ProdutoFornecedor
                 SET condicoes_pagamento = ?, preco = ?, data_atualizacao = CURRENT_TIMESTAMP
                 WHERE id_produto = ? AND ativo = TRUE LIMIT 1`,
                [condicoes_pagamento || null, dados.valor_produto, id]
            );
        }

        res.json({ message: 'Produto atualizado com sucesso' });
    } catch (error) {
        console.error('Erro em atualizar produto', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'SKU ou código de barras duplicado' });
        }
        res.status(500).json({ message: 'Erro interno ao atualizar produto' });
    }
};

export const removerProduto = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query(
            `UPDATE Produtos
             SET ativo = FALSE, data_atualizacao = CURRENT_TIMESTAMP
             WHERE id_produto = ? AND ativo = TRUE`,
            [id]
        );
        if (!result.affectedRows) {
            return res.status(404).json({ message: 'Produto não encontrado ou já inativo' });
        }
        res.json({ message: 'Produto inativado com sucesso' });
    } catch (error) {
        console.error('Erro em remover produto', error);
        res.status(500).json({ message: 'Erro interno ao inativar produto' });
    }
};