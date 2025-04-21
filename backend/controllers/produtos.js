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
