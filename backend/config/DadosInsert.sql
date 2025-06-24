    -- 1) Usuários
    INSERT INTO Usuarios (Nome, Email, Telefone, Celular, Senha) VALUES
    ('João da Silva',   'joao.silva@mail.com',    '4132340000', '41988887777',  UNHEX(SHA2('senha123',256))),
    ('Maria Oliveira',  'maria.oliveira@mail.com', '4132341111', '41999996666',  UNHEX(SHA2('maria456',256))),
    ('Carlos Pereira',  'carlos.pereira@mail.com','4132342222', '41977775555',  UNHEX(SHA2('c@rlos789',256)));

    -- 2) Grupos de Produtos
    INSERT INTO Grupos (nome_grupo) VALUES
    ('Higiene Pessoal'),
    ('Eletrônicos'),
    ('Alimentos');

    -- 3) Produtos
    INSERT INTO Produtos (sku, nome_produto, id_grupo, valor_produto, codigo_barras) VALUES
    ('HG001', 'Sabonete Neutro',        1,  3.50, '7891234500012'),
    ('HG002', 'Shampoo Revitalizante',  1, 12.90, '7891234500029'),
    ('EL001', 'Monitor LG 24”',         2, 899.00,'7891234500104'),
    ('EL002', 'Teclado Mecânico RGB',   2, 249.90,'7891234500111'),
    ('AL001', 'Arroz Tipo 1 – 1kg',      3,  5.20, '7891234500203'),
    ('AL002', 'Feijão Carioca – 1kg',    3,  7.80, '7891234500210');

    -- 4) Filiais (16)
    INSERT INTO Filial (nome_filial, endereco_filial, telefone_filial, email_filial, gestor_filial, observacao) VALUES
    ('Centro de Distribuição', 'Rua Central, 1000, Curitiba, PR', '4132000000', 'cd@supercomercial.com.br', 'Ana Costa', 'Matriz'),
    ('Filial Capão Raso',      'Av. das Torres, 500, Capão Raso',    '4132000100', 'capao@supercomercial.com.br', 'Bruno Lima', ''),
    ('Filial Portão',          'Rua Brasil, 200, Portão',            '4132000200', 'portao@supercomercial.com.br', 'Carla Souza', ''),
    ('Filial Vila Izabel',     'Rua XV de Novembro, 300, Vila Izabel','4132000300','vilaizabel@supercomercial.com.br','Diego Melo',''),
    ('Filial Batel',           'Av. do Batel, 400, Batel',           '4132000400', 'batel@supercomercial.com.br', 'Eduarda Alves',''),
    ('Filial Água Verde',      'Rua Guatemala, 150, Água Verde',     '4132000500', 'aguaverde@supercomercial.com.br','Felipe Dias',''),
    ('Filial Rebouças',        'Av. Iguaçu, 600, Rebouças',          '4132000600', 'reboucas@supercomercial.com.br','Gabriela Rocha',''),
    ('Filial Cajuru',          'Rua Presidente Faria, 700, Cajuru',  '4132000700', 'cajuru@supercomercial.com.br','Hélio Tavares',''),
    ('Filial Boqueirão',       'Av. das Nações, 800, Boqueirão',     '4132000800', 'boqueirao@supercomercial.com.br','Isabela Martins',''),
    ('Filial Santa Felicidade','Rua das Flores, 90, Santa Felicidade','4132000900','santafel@supercomercial.com.br','Joana Prado',''),
    ('Filial Alto da XV',      'Rua Vicente Machado, 120, Alto da XV','4132001000','altdaxv@supercomercial.com.br','Kleber Santos',''),
    ('Filial Jardim Social',   'Rua Trajano Reis, 50, Jardim Social', '4132001100','jardimsocial@supercomercial.com.br','Larissa Pinto',''),
    ('Filial Ecoville',        'Rua João Negrão, 30, Ecoville',       '4132001200','ecoville@supercomercial.com.br','Marcos Costa',''),
    ('Filial Sítio Cercado',   'Av. das Torres, 2200, Sítio Cercado', '4132001300','sitiocercado@supercomercial.com.br','Natália Freitas',''),
    ('Filial Fazendinha',      'Rua das Camélias, 10, Fazendinha',    '4132001400','fazendinha@supercomercial.com.br','Otávio Lima',''),
    ('Filial Umbará',          'Av. das Araucárias, 450, Umbará',      '4132001500','umbara@supercomercial.com.br','Paula Ramos','');

    -- 5) Fornecedores
    INSERT INTO Fornecedor (nome_fornecedor, endereco_fornecedor, telefone_fornecedor, email_fornecedor, tipo_pessoa, cnpj_cpf) VALUES
    ('Fornecedor A Ltda', 'Rua da Indústria, 100, Curitiba', '4132100000','contato@fornecedora.com.br','Jurídica','12345678000199'),
    ('Fornecedor B Ltda', 'Av. do Comércio, 200, Curitiba',   '4132101000','vendas@fornecedorb.com.br','Jurídica','22345678000188'),
    ('Mercado Central',   'Praça da Espanha, 300, Curitiba',  '4132102000','central@mercado.com.br','Jurídica','32345678000177');

    -- 6) Produto ↔ Fornecedor
    INSERT INTO ProdutoFornecedor (id_produto, id_fornecedor, preco, prazo_entrega, condicoes_pagamento) VALUES
    (1, 1, 2.80,  3, '30 dias'),
    (2, 1, 10.50, 5, '45 dias'),
    (3, 2, 850.0, 7, '30 dias'),
    (4, 2, 230.0,  5, '30 dias'),
    (5, 3, 4.50,  2, 'À vista'),
    (6, 3, 6.90,  2, 'À vista');

    -- 7) Lotes
    INSERT INTO Lote (id_produto, codigo_lote, data_expedicao, data_validade, quantidade) VALUES
    (1, 'L001-202506', '2025-06-01','2026-06-01', 100),
    (2, 'L002-202506', '2025-06-02','2026-06-02', 200),
    (5, 'L005-202506', '2025-06-03','2026-06-03', 150);

    -- 8) Estoque (em CD, filial=1)
    INSERT INTO Estoque (id_produto,id_fornecedor,id_filial,id_lote,local_armazenamento,quantidade,estoque_minimo,estoque_maximo) VALUES
    (1,1,1,1,'Prateleira A',  80, 20, 200),
    (2,1,1,2,'Prateleira B', 150, 30, 300),
    (5,3,1,3,'Chão',         120, 50, 250);

    -- 9) Pedidos de Filial + Itens
    INSERT INTO PedidoFilial (id_filial,status,observacao) VALUES
    (2,'Pendente','Solicitação mensal'),
    (3,'Pendente','Reabastecer estoque');

    INSERT INTO ItensPedidoFilial (id_pedido_filial,id_produto,quantidade) VALUES
    (1,1,20),
    (1,5,50),
    (2,2,30);

    -- 10) Ordem de Compra + Itens + vínculo
    INSERT INTO OrdemCompra (data_entrega_prevista, status, observacao) VALUES
    ('2025-07-05','Pendente','Compra para CD');

    INSERT INTO ItensOrdemCompra (id_ordem_compra,id_produto,id_fornecedor,quantidade,preco_unitario) VALUES
    (1,1,1,20,2.80),
    (1,5,3,50,4.50);

    INSERT INTO OrdemCompraPedidoFilial (id_ordem_compra,id_pedido_filial) VALUES
    (1,1);

    -- 11) Feedback e Pagamentos
    INSERT INTO Feedback (id_ordem_compra,nota,comentario) VALUES
    (1,5,'Entrega rápida e sem avarias');

    INSERT INTO Pagamentos (id_ordem_compra,id_forma_pagamento,valor_pagamento) VALUES
    (1,4, (20*2.80+50*4.50));  -- PIX, total calculado

    -- 12) Movimentações de Estoque (saída no CD)
    INSERT INTO MovimentacaoEstoque (id_estoque,tipo_movimentacao,quantidade) VALUES
    (1,'Reposição',20),
    (3,'Reposição',50);

    -- 13) Logs de Usuário
    INSERT INTO LogUsuario (usuario_id,acao,tabela_afetada,registro_id,descricao) VALUES
    (1,'UPDATE','PedidoFilial',1,'Alterou status de PedidoFilial para Pendente'),
    (2,'INSERT','OrdemCompra',1,'Criou Ordem de Compra');

    -- 14) Tokens de Reset de Senha
    INSERT INTO PasswordResetTokens (UsuarioID,token,expires_at) VALUES
    (1,'tokenexemplo123',DATE_ADD(NOW(), INTERVAL 1 DAY));

    -- 15) Histórico de Status de Produto (execução inicial)
    INSERT INTO HistoricoStatusProduto (id_produto,ativo,motivo) VALUES
    (1,TRUE,'Registro inicial'),
    (2,TRUE,'Registro inicial');
