import pool from '../config/db.js';

// Helper para construir cláusulas WHERE dinâmicas
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
    if (filters.codigo_barras) {
        clauses.push('p.codigo_barras LIKE ?');
        params.push(`%${filters.codigo_barras}%`);
    }

    return clauses.length > 1 ? 'WHERE ' + clauses.join(' AND ') : 'WHERE p.ativo = TRUE';
};

// Helper para gerar SKU automaticamente - CORRIGIDO
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
        } catch {
            groupPrefix = 'ERRG';
        }
    } else {
        groupPrefix = 'SGRP';
    }

    if (nomeProduto) {
        const words = nomeProduto.split(' ').filter(w => w);
        productInitials = words.map(w => w[0]).join('').toUpperCase();
        if (productInitials.length > 5) productInitials = productInitials.substring(0, 5);
    } else {
        productInitials = 'NOPROD';
    }

    const generateSuffix = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    let newSku = `${groupPrefix}-${productInitials}-${generateSuffix()}`;
    let isUnique = false;
    let attempts = 0;
    const MAX = 5;

    while (!isUnique && attempts < MAX) {
        const [rows] = await pool.query('SELECT sku FROM Produtos WHERE sku = ?', [newSku]);
        if (rows.length === 0) {
            isUnique = true;
        } else {
            newSku = `${groupPrefix}-${productInitials}-${generateSuffix()}`;
            attempts++;
        }
    }
    if (!isUnique) {
        newSku = `${groupPrefix}-${productInitials}-${Date.now().toString().slice(-6)}`;
    }
    return newSku;
};

export const listarProdutos = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const { nome_produto, id_grupo, id_fornecedor, codigo_barras } = req.query;
    const values = [];
    const where = buildWhereClause({ nome_produto, id_grupo, id_fornecedor, codigo_barras }, values);

    try {
        const [countResult] = await pool.query(
            `SELECT COUNT(DISTINCT p.id_produto) AS total
             FROM Produtos p
             LEFT JOIN ProdutoFornecedor pf ON pf.id_produto = p.id_produto ${where}`,
            values
        );
        const totalRecords = countResult[0].total;

        const [rows] = await pool.query(
            `SELECT
                p.id_produto,
                p.sku,
                p.nome_produto,
                p.id_grupo,
                p.valor_produto,
                p.codigo_barras,
                p.data_registro,
                p.data_atualizacao,
                p.ativo,
                g.nome_grupo,
                GROUP_CONCAT(DISTINCT f.nome_fornecedor SEPARATOR ', ') AS fornecedores
             FROM Produtos p
             LEFT JOIN Grupos g ON p.id_grupo = g.id_grupo
             LEFT JOIN ProdutoFornecedor pf
               ON pf.id_produto = p.id_produto
               AND pf.ativo = TRUE
             LEFT JOIN Fornecedor f ON pf.id_fornecedor = f.id_fornecedor
             ${where}
             GROUP BY p.id_produto
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
    // Esta função buildWhereClause é local e diferente da de cima, mantendo seu código.
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
        return clauses.length > 1 ? 'WHERE ' + clauses.join(' AND ') : 'WHERE p.ativo = TRUE';
    };
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
    const { nome_produto, id_grupo, valor_produto, codigo_barras, id_fornecedor, condicoes_pagamento } = req.body;
    if (!nome_produto || !valor_produto) {
        return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
    }
    try {
        const [byName] = await pool.query(
            'SELECT id_produto FROM Produtos WHERE nome_produto = ? AND ativo = TRUE',
            [nome_produto]
        );
        if (byName.length) return res.status(409).json({ message: 'Produto já cadastrado.' });

        if (codigo_barras) {
            const [byBarcode] = await pool.query(
                'SELECT id_produto FROM Produtos WHERE codigo_barras = ? AND ativo = TRUE',
                [codigo_barras]
            );
            if (byBarcode.length) return res.status(409).json({ message: 'Código de barras duplicado.' });
        }

        const sku = await generateSku(nome_produto, id_grupo);
        const [result] = await pool.query(
            `INSERT INTO Produtos
               (sku, nome_produto, id_grupo, valor_produto, codigo_barras)
             VALUES (?, ?, ?, ?, ?)`,
            [sku, nome_produto, id_grupo || null, valor_produto, codigo_barras || null]
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

        res.status(201).json({ message: 'Produto registrado com sucesso!', id_produto: productId, sku });
    } catch (err) {
        console.error('Erro em criar produto', err);
        res.status(500).json({ message: 'Erro interno ao criar produto' });
    }
};

export const visualizarProduto = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT
                p.id_produto,
                p.sku,
                p.nome_produto,
                p.id_grupo,
                p.valor_produto,
                p.codigo_barras,
                p.data_registro,
                p.data_atualizacao,
                p.ativo,
                g.nome_grupo,
                JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'id_fornecedor', f.id_fornecedor,
                    'nome_fornecedor', f.nome_fornecedor,
                    'condicoes_pagamento', pf.condicoes_pagamento,
                    'preco', pf.preco
                  )
                ) AS fornecedores
             FROM Produtos p
             LEFT JOIN Grupos g ON p.id_grupo = g.id_grupo
             LEFT JOIN ProdutoFornecedor pf
               ON pf.id_produto = p.id_produto
               AND pf.ativo = TRUE
             LEFT JOIN Fornecedor f ON pf.id_fornecedor = f.id_fornecedor
             WHERE p.id_produto = ?
               AND p.ativo = TRUE
             GROUP BY p.id_produto`,
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
    const campos = ['sku', 'nome_produto', 'id_grupo', 'valor_produto', 'codigo_barras'];
    const fields = [];
    const vals = [];
    campos.forEach(c => {
        if (dados[c] !== undefined) {
            fields.push(`${c} = ?`);
            vals.push(dados[c]);
        }
    });
    if (!fields.length) return res.status(400).json({ message: 'Nenhuma alteração feita.' });
    try {
        const [result] = await pool.query(
            `UPDATE Produtos
             SET ${fields.join(', ')}, data_atualizacao = CURRENT_TIMESTAMP
             WHERE id_produto = ? AND ativo = TRUE`,
            [...vals, id]
        );
        if (!result.affectedRows) return res.status(404).json({ message: 'Produto não encontrado ou inativo.' });
        // Lógica para fornecedor omitida (similar ao Criar)
        res.json({ message: 'Produto atualizado com sucesso' });
    } catch (err) {
        console.error('Erro em atualizar produto', err);
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