import pool from '../config/db.js';

// Listar pedidos de filial com paginação e filtros
export const listarPedidoFilial = async (req, res) => {
    // Adicionado 'data_pedido' aqui para garantir que ele seja desestruturado
    const { id_filial, status, data_pedido, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    try {
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
        // ADIÇÃO CRÍTICA: LÓGICA DE VALIDAÇÃO E FILTRO DE DATA NO BACKEND
        // ===============================================
        if (data_pedido) {
            const trimmedDate = data_pedido.trim();
            const dateParts = trimmedDate.split('/');
            
            // 1. Validação do formato básico (DD/MM/YYYY) e tipos
            // Verifica se tem 3 partes e se cada parte tem o comprimento esperado,
            // e se todas as partes podem ser convertidas para número.
            if (dateParts.length !== 3 || 
                dateParts[0].length !== 2 || 
                dateParts[1].length !== 2 || 
                dateParts[2].length !== 4 ||
                isNaN(parseInt(dateParts[0], 10)) ||
                isNaN(parseInt(dateParts[1], 10)) ||
                isNaN(parseInt(dateParts[2], 10))) {
                 console.warn(`Data de pedido recebida com formato básico inválido: ${data_pedido}`);
                 return res.status(400).json({ message: "Formato de data inválido. Use DD/MM/AAAA." });
            }

            const dia = parseInt(dateParts[0], 10);
            const mes = parseInt(dateParts[1], 10);
            const ano = parseInt(dateParts[2], 10);

            // 2. Validação semântica da data: Verifica se a data realmente existe no calendário.
            // Usamos Date.UTC para evitar problemas de fuso horário na validação.
            // O mês em JavaScript Date é 0-indexado (Janeiro é 0, Fevereiro é 1, etc.).
            const d = new Date(Date.UTC(ano, mes - 1, dia)); 

            const isValidDate = 
                d.getUTCFullYear() === ano &&        // O ano obtido do objeto Date é igual ao ano original?
                d.getUTCMonth() === (mes - 1) &&     // O mês obtido do objeto Date é igual ao mês original?
                d.getUTCDate() === dia;              // O dia obtido do objeto Date é igual ao dia original?

            if (isValidDate) {
                // Formata a data para o padrão 'AAAA-MM-DD', que é ideal para MySQL
                // Usamos dateParts[1] e dateParts[0] diretamente para garantir os zeros à esquerda (ex: 06)
                const formattedDate = `${ano}-${dateParts[1]}-${dateParts[0]}`; 
                clauses.push(`DATE(pf.data_pedido) = ?`); // Compara apenas a parte da data, ignorando a hora
                params.push(formattedDate);
            } else {
                // Se a data é sintaticamente correta (ex: 31/02/2024), mas não existe semanticamente
                console.warn(`Data de pedido semanticamente inválida recebida: ${data_pedido}`);
                return res.status(400).json({ message: "Data inválida ou inexistente. Verifique o dia, mês e ano." });
            }
        }
        // ===============================================

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
        const countParams = []; 

        // REPLICAR AS CLÁUSULAS WHERE NA QUERY DE CONTAGEM
        if (clauses.length > 0) {
            countSql += ` WHERE ` + clauses.join(' AND ');
            // Adicionar os mesmos parâmetros usados para as cláusulas WHERE
            // (excluindo os parâmetros de LIMIT e OFFSET que são apenas para a query principal)
            const nonPaginationParams = params.slice(0, params.length - 2); 
            countParams.push(...nonPaginationParams);
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

// Visualizar pedido de filial específico com produtos
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

// Criar novo pedido de filial com produtos
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

// Atualizar pedido de filial
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

// Cancelar pedido de filial (remoção lógica)
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