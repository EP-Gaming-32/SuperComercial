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
    // <<--- ADIÇÃO AQUI: FILTRO PARA CODIGO_BARRAS ---
    if (filters.codigo_barras) {
        clauses.push('p.codigo_barras LIKE ?');
        params.push(`%${filters.codigo_barras}%`);
    }
    // <<------------------------------------------------

    return clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
};

// Helper para gerar SKU automaticamente (já existente)
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

    let newSku = `<span class="math-inline">\{groupPrefix\}\-</span>{productInitials}-${generateUniqueSuffix()}`;

    let isUnique = false;
    let counter = 0;
    const MAX_ATTEMPTS = 5;

    while (!isUnique && counter < MAX_ATTEMPTS) {
        try {
            const [existingSkuRows] = await pool.query('SELECT sku FROM Produtos WHERE sku = ?', [newSku]);
            if (existingSkuRows.length === 0) {
                isUnique = true;
            } else {
                newSku = `<span class="math-inline">\{groupPrefix\}\-</span>{productInitials}-${generateUniqueSuffix()}`;
                counter++;
            }
        } catch (dbError) {
            console.error('Erro de BD ao verificar unicidade do SKU:', dbError);
            throw new Error('Erro ao verificar unicidade do SKU no banco de dados.');
        }
    }

    if (!isUnique) {
        newSku = `<span class="math-inline">\{groupPrefix\}\-</span>{productInitials}-${Date.now().toString().slice(-6)}`;
        console.warn(`SKU gerado após múltiplas colisões: ${newSku}`);
    }

    return newSku;
};

export const listarProdutos = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // <<--- MUDANÇA AQUI: EXTRAINDO codigo_barras DO req.query ---
    const { nome_produto, id_grupo, id_fornecedor, codigo_barras } = req.query;
    const values = [];
    // <<--- MUDANÇA AQUI: PASSANDO codigo_barras PARA buildWhereClause ---
    const whereClause = buildWhereClause({ nome_produto, id_grupo, id_fornecedor, codigo_barras }, values);

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
    const whereClause = buildWhereClause({ nome_produto, id_grupo }, values); // Note: this buildWhereClause is local, not the general one above.

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

    try {
        // --- INÍCIO: VERIFICAÇÃO DE DUPLICIDADE (CRIAR) ---
        // 1. Verificar por nome_produto existente (se for considerado único)
        const [existingByName] = await pool.query(
            `SELECT id_produto FROM Produtos WHERE nome_produto = ? AND ativo = TRUE`,
            [nome_produto]
        );
        if (existingByName.length > 0) {
            return res.status(409).json({ message: 'Produto já cadastrado com este nome.' });
        }

        // 2. Verificar por código_barras existente (se fornecido)
        if (codigo_barras) {
            const [existingByBarcode] = await pool.query(
                `SELECT id_produto FROM Produtos WHERE codigo_barras = ? AND ativo = TRUE`,
                [codigo_barras]
            );
            if (existingByBarcode.length > 0) {
                return res.status(409).json({ message: 'Produto já cadastrado com este código de barras.' });
            }
        }
        // --- FIM: VERIFICAÇÃO DE DUPLICIDADE (CRIAR) ---

        // Geração do SKU
        let generatedSku;
        try {
            generatedSku = await generateSku(nome_produto, id_grupo);
        } catch (skuError) {
            console.error('Erro ao gerar SKU:', skuError);
            return res.status(500).json({ message: skuError.message || 'Erro interno ao gerar SKU do produto' }); // Mudado para 'message'
        }

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

        res.status(201).json({ message: 'Produto registrado com sucesso!', id_produto: productId, sku: generatedSku }); // Mudado para 'message'
    } catch (error) {
        console.error('Erro em criar produto', error);
        // O ER_DUP_ENTRY aqui pode pegar SKU duplicado se o generateSku falhou em garantir unicidade,
        // ou codigo_barras duplicado se ele não foi tratado acima.
        if (error.code === 'ER_DUP_ENTRY') {
            // Tentar identificar qual campo causou a duplicação
            if (error.sqlMessage.includes('sku')) { // Se a mensagem do erro SQL contém 'sku'
                return res.status(409).json({ message: 'SKU duplicado. Tente novamente ou entre em contato com o suporte.' });
            } else if (error.sqlMessage.includes('codigo_barras')) { // Se a mensagem do erro SQL contém 'codigo_barras'
                return res.status(409).json({ message: 'Código de barras duplicado. Verifique os dados e tente novamente.' });
            }
            // Fallback para outros tipos de ER_DUP_ENTRY
            return res.status(409).json({ message: 'Entrada duplicada. Verifique os dados e tente novamente.' });
        }
        res.status(500).json({ message: 'Erro interno ao criar produto' }); // Mudado para 'message'
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
        sku, // Necessário para a verificação de duplicidade
        nome_produto, // Necessário para a verificação de duplicidade
        codigo_barras, // Necessário para a verificação de duplicidade
        id_fornecedor,
        condicoes_pagamento
    } = req.body; // Desestrutura também os campos que serão usados para verificação de duplicidade

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
        return res.status(400).json({ message: 'Nenhuma alteração feita.' });
    }

    try {
        // --- INÍCIO: VERIFICAÇÃO DE DUPLICIDADE (ATUALIZAR) ---
        // 1. Verificar por nome_produto existente (que não seja o do próprio produto)
        if (nome_produto !== undefined) {
            const [existingByName] = await pool.query(
                `SELECT id_produto FROM Produtos WHERE nome_produto = ? AND id_produto != ? AND ativo = TRUE`,
                [nome_produto, id]
            );
            if (existingByName.length > 0) {
                return res.status(409).json({ message: 'Nome do produto já cadastrado para outro produto ativo.' });
            }
        }

        // 2. Verificar por SKU existente (que não seja o do próprio produto)
        if (sku !== undefined && sku) { // Apenas verifica se SKU foi fornecido
            const [existingBySku] = await pool.query(
                `SELECT id_produto FROM Produtos WHERE sku = ? AND id_produto != ? AND ativo = TRUE`,
                [sku, id]
            );
            if (existingBySku.length > 0) {
                return res.status(409).json({ message: 'SKU já cadastrado para outro produto ativo.' });
            }
        }

        // 3. Verificar por código_barras existente (que não seja o do próprio produto)
        if (codigo_barras !== undefined && codigo_barras) { // Apenas verifica se código_barras foi fornecido
            const [existingByBarcode] = await pool.query(
                `SELECT id_produto FROM Produtos WHERE codigo_barras = ? AND id_produto != ? AND ativo = TRUE`,
                [codigo_barras, id]
            );
            if (existingByBarcode.length > 0) {
                return res.status(409).json({ message: 'Código de barras já cadastrado para outro produto ativo.' });
            }
        }
        // --- FIM: VERIFICAÇÃO DE DUPLICIDADE (ATUALIZAR) ---

        const [result] = await pool.query(
            `UPDATE Produtos
             SET ${fields.join(', ')}, data_atualizacao = CURRENT_TIMESTAMP
             WHERE id_produto = ? AND ativo = TRUE`,
            [...values, id]
        );
        if (!result.affectedRows) {
            return res.status(404).json({ message: 'Produto não encontrado, inativo ou nenhum dado foi alterado.' }); // Adicionado mensagem mais clara
        }

        if (id_fornecedor) {
            const [pfUpdateResult] = await pool.query(
                `UPDATE ProdutoFornecedor
                 SET condicoes_pagamento = ?, preco = ?, data_atualizacao = CURRENT_TIMESTAMP
                 WHERE id_produto = ? AND id_fornecedor = ? AND ativo = TRUE`,
                [condicoes_pagamento || null, dados.valor_produto, id, id_fornecedor]
            );

            if (pfUpdateResult.affectedRows === 0) {
                // Tenta reativar se inativo
                const [pfReactivateResult] = await pool.query(
                    `UPDATE ProdutoFornecedor SET ativo = TRUE, data_atualizacao = CURRENT_TIMESTAMP
                     WHERE id_produto = ? AND id_fornecedor = ? AND ativo = FALSE`,
                    [id, id_fornecedor]
                );

                if (pfReactivateResult.affectedRows === 0) {
                    // Se não reativou, insere como novo vínculo
                    await pool.query(
                        `INSERT INTO ProdutoFornecedor
                         (id_produto, id_fornecedor, condicoes_pagamento, preco)
                         VALUES (?, ?, ?, ?)`,
                        [id, id_fornecedor, condicoes_pagamento || null, dados.valor_produto]
                    );
                }
            }
        } else if (dados.valor_produto !== undefined || condicoes_pagamento !== undefined) {
            // Caso não seja fornecedor específico, mas valor/condição global do produto mudou
            await pool.query(
                `UPDATE ProdutoFornecedor
                 SET condicoes_pagamento = ?, preco = ?, data_atualizacao = CURRENT_TIMESTAMP
                 WHERE id_produto = ? AND ativo = TRUE LIMIT 1`, // LIMIT 1 para evitar múltiplos updates se houver mais de um fornecedor para o mesmo produto
                [condicoes_pagamento || null, dados.valor_produto, id]
            );
        }

        res.json({ message: 'Produto atualizado com sucesso' });
    } catch (error) {
        console.error('Erro em atualizar produto', error);
        // O ER_DUP_ENTRY aqui pode pegar SKU ou código de barras duplicado, se a verificação acima não for 100% abrangente
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.sqlMessage.includes('sku')) {
                return res.status(409).json({ message: 'SKU duplicado para outro produto. Verifique os dados e tente novamente.' });
            } else if (error.sqlMessage.includes('codigo_barras')) {
                return res.status(409).json({ message: 'Código de barras duplicado para outro produto. Verifique os dados e tente novamente.' });
            }
            return res.status(409).json({ message: 'Entrada duplicada. Verifique os dados e tente novamente.' });
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