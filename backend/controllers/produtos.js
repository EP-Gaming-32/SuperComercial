import pool from "../config/db.js";

export const listarProdutos = async(req, res) =>{//funcao para retornar os produtos no banco

    const page = parseInt(req.query.page, 10) || 1;// variavel para pagina atual, padrao 1
    const limit = parseInt(req.query.limit, 10) || 10;// variavel para o limite de entries por pagina, padrao 10
    const offset = (page - 1) * limit;// variavel para o calculo da paginaçao

    try{
        //query para receber total de entries
        const [countResult] = await pool.query(
            'SELECT COUNT(*) AS total FROM Produtos'
        );
        // variavel para total de entries
        const totalRecords = countResult[0].total;

        //query para receber os produtos com limit e offset para paginacao
        const [rows] = await pool.query(
            'SELECT * FROM Produtos LIMIT ? OFFSET ?',
            [limit, offset]
        );

        // variavel para o calculo de total de paginas arredondado
        const totalPages = Math.ceil(totalRecords / limit);

        //estrutura da resposta json
        res.json({
            data: rows, // os dados do banco em si
            page,   //a pagina atual
            limit,  //limit de entries por pagina
            totalRecords,   //total de entries
            totalPages  //total de paginas
        });
    } catch(error){
        console.error("erro em listar produtos", error);
        res.status(500).json({error: "erro interno listar produtos" });
    }

};

//funcao para registrar produto no banco
export const criarProduto = async(req, res) =>{

    //recebe os campos do front
    const { sku, nome_produto, id_grupo, valor_produto, prazo_validade, unidade_medida, codigo_barras} = req.body;

    //checa campos obrigatorios
    if (!sku || !nome_produto || !valor_produto) {
        return req.status(400).json({message: "Campos Obrigatórios Faltando"})
    }

    try {
        //query para inserir o entry no banco
        const [result] = await pool.query(
            `INSERT INTO Produtos
            (sku, nome_produto, id_grupo, valor_produto, prazo_validade, unidade_medida, codigo_barras)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            //array para passar os valores do request para o query no lugar dos ?
            [sku, nome_produto, id_grupo || null, valor_produto, prazo_validade || null, unidade_medida || null, codigo_barras || null]
        );

        //estrutura da resposta
        res.status(201).json({
            message: "Produto Registrado Com Sucesso!", id_produto: result.insertId
        });

    } catch(error){
        console.error("Erro em criar produto", error);

        if (error.code === 'ER_DUP_ENTRY'){
            return res.status(409).json({error: "SKU Duplicado"})
        }
        res.status(500).json({error: "erro interno criar produto"})
    }
};

//funcao para atualizar produto
export const atualizarProduto = async(req, res) =>{

    //pega o id do produto a ser atualizado
    const {id} = req.params;
    //pega os valores do produto
    const dados = req.body;

    //define quais campos podem ser alterados
    const camposPermitidos = [
        'sku',
        'nome_produto',
        'id_grupo',
        'valor_produto',
        'prazo_validade',
        'unidade_medida',
        'codigo_barras'
    ];

    //variavel para armazenar os campos e valores para atualizar
    const fields = [];
    const values = [];

    //checa se ha alterações nos campos permitidos e controi o query dinamicamente
    for (const campo of camposPermitidos){
        if (dados[campo] !== undefined){
            fields.push(`${campo} = ?`);
            values.push(dados[campo]);
        }
    }

    //caso n haja alteração, retorna 
    if (fields.length === 0){
        return res.json({
            message: "Nenhuma alteração feita"
        })
    }

    try{
        //query dinamico com os campos alterados
        const [result] = await pool.query(
            `UPDATE Produtos SET ${fields.join(',')} WHERE id_produto = ?`,
            [...values, id]
        );
        
        //chega se o entry existe, caso não retorna erro
        if (result.affectedRows === 0){
            return res.status(404).json({message: "Produto nao encontrado!"})
        }

        //resposta.json
        res.json({message: "Produto atualizado!"})
    } catch(error){
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ message: 'Erro interno ao atualizar produto' });
    }
};