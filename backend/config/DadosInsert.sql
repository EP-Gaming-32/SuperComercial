-- #####################################################################
-- ##       SCRIPT DE INSERÇÃO COM DADOS REAIS/PLAUSÍVEIS             ##
-- #####################################################################

-- =====================================================================
-- 1. Inserindo Grupos de Produtos
-- Base para a categorização dos produtos.
-- =====================================================================
INSERT INTO Grupos (nome_grupo) VALUES
('Papelaria e Escritório'), -- ID 1
('Informática e Periféricos'),  -- ID 2
('Copa e Cozinha'),             -- ID 3
('Limpeza e Higiene'),          -- ID 4
('Mobiliário Corporativo');     -- ID 5

-- =====================================================================
-- 2. Inserindo 15 Filiais com nomes de bairros de Curitiba
-- =====================================================================
INSERT INTO Filial (nome_filial, endereco_filial, telefone_filial, email_filial, gestor_filial) VALUES
('Filial Capão Raso', 'Av. República Argentina, 5000', '4133481010', 'capaoraso@suaempresa.com', 'Mariana Costa'),
('Filial Pinheirinho', 'Av. Winston Churchill, 200', '4133122020', 'pinheirinho@suaempresa.com', 'Roberto Almeida'),
('Filial Centro', 'R. Marechal Deodoro, 150', '4132223030', 'centro@suaempresa.com', 'Lucas Ferreira'),
('Filial Batel', 'Av. do Batel, 1800', '4130774040', 'batel@suaempresa.com', 'Beatriz Lima'),
('Filial Água Verde', 'Av. Pres. Getúlio Vargas, 3000', '4133425050', 'aguaverde@suaempresa.com', 'Fernando Martins'),
('Filial Portão', 'R. República Argentina, 3500', '4132296060', 'portao@suaempresa.com', 'Júlia Souza'),
('Filial Santa Felicidade', 'Av. Manoel Ribas, 5800', '4133727070', 'santafelicidade@suaempresa.com', 'Ricardo Oliveira'),
('Filial Boqueirão', 'Av. Mal. Floriano Peixoto, 9000', '4133868080', 'boqueirao@suaempresa.com', 'Camila Santos'),
('Filial Cajuru', 'Av. Prefeito Maurício Fruet, 2150', '4133619090', 'cajuru@suaempresa.com', 'Guilherme Pereira'),
('Filial CIC', 'R. Des. Cid Campêlo, 4500', '4133471110', 'cic@suaempresa.com', 'Vanessa Rocha'),
('Filial Uberaba', 'Av. Sen. Salgado Filho, 4560', '4133761212', 'uberaba@suaempresa.com', 'André Gonçalves'),
('Filial Bigorrilho', 'R. Padre Anchieta, 2500', '4133361313', 'bigorrilho@suaempresa.com', 'Laura Azevedo'),
('Filial Juvevê', 'R. Nicolau Maeder, 500', '4132541414', 'juveve@suaempresa.com', 'Thiago Borges'),
('Filial Cabral', 'Av. Paraná, 800', '4132531515', 'cabral@suaempresa.com', 'Rafaela Nunes'),
('Filial Rebouças', 'Av. Sete de Setembro, 2775', '4133621616', 'reboucas@suaempresa.com', 'Marcelo Vieira');

-- =====================================================================
-- 3. Inserindo 15 Fornecedores reais ou plausíveis
-- =====================================================================
INSERT INTO Fornecedor (nome_fornecedor, endereco_fornecedor, telefone_fornecedor, email_fornecedor, tipo_pessoa, cnpj_cpf) VALUES
('Kalunga Comércio e Indústria Gráfica Ltda', 'Rua da Mooca, 766, São Paulo-SP', '1129555000', 'vendas@kalunga.com.br', 'juridica', '43.211.316/0001-24'),
('Brasko Papéis', 'Rod. BR-116, 12000, Curitiba-PR', '4133494900', 'contato@brasko.com.br', 'juridica', '02.518.106/0001-19'),
('Gimba.com', 'Av. dos Autonomistas, 1400, Osasco-SP', '1134652000', 'atendimento@gimba.com', 'juridica', '48.529.704/0001-34'),
('InfoDistribuidora S.A.', 'Av. das Nações, 500, São Paulo-SP', '1140041010', 'comercial@infodistribuidora.com', 'juridica', '15.456.789/0001-10'),
('Logitech do Brasil', 'R. Funchal, 418, São Paulo-SP', '1132258000', 'suporte@logitech.com', 'juridica', '08.675.248/0001-93'),
('3M do Brasil Ltda', 'Rod. Anhanguera, km 110, Sumaré-SP', '1938567000', 'faleconosco@3m.com', 'juridica', '45.985.371/0001-08'),
('Intelbras S.A.', 'Rod. BR-101, km 210, São José-SC', '4832819500', 'contato@intelbras.com.br', 'juridica', '82.901.000/0001-27'),
('Café Pilão - JDE Brasil', 'Av. Eng. Luís Carlos Berrini, 105, São Paulo-SP', '08007280203', 'sac@jdecoffee.com', 'juridica', '33.113.804/0001-72'),
('Melitta do Brasil', 'Av. Paulista, 1842, São Paulo-SP', '0800140202', 'sac@melitta.com.br', 'juridica', '61.077.042/0001-01'),
('Ypê Química Amparo', 'Av. Waldyr Beira, 1000, Amparo-SP', '1938074000', 'sac@ype.ind.br', 'juridica', '43.461.993/0001-00'),
('Gazin Atacado', 'Rod. PR-082, 4554, Douradina-PR', '4436638000', 'atacado@gazin.com.br', 'juridica', '77.941.490/0001-55'),
('Flexform Cadeiras', 'Rua dos Plásticos, 100, Guarulhos-SP', '1124233300', 'vendas@flexform.com.br', 'juridica', '50.787.037/0001-83'),
('Marelli Ambientes Corporativos', 'Al. das Indústrias, 200, Caxias do Sul-RS', '5432181000', 'contato@marelli.com.br', 'juridica', '88.665.231/0001-70'),
('Osram do Brasil', 'Av. dos Autonomistas, 4900, Osasco-SP', '08007772600', 'sac.br@osram.com', 'juridica', '60.869.832/0001-44'),
('Positivo Tecnologia S.A.', 'Rua João Bettega, 5200, Curitiba-PR', '4133167700', 'relacoes@positivo.com.br', 'juridica', '81.243.735/0001-48');

-- =====================================================================
-- 4. Inserindo 35 Produtos, associando-os aos grupos criados
-- =====================================================================
INSERT INTO Produtos (sku, nome_produto, id_grupo, valor_produto, codigo_barras) VALUES
('PAP001', 'Papel Sulfite A4 75g Resma 500 fls', 1, 29.90, '7891234560011'),
('PAP002', 'Caneta Esferográfica Azul BIC', 1, 1.80, '7891234560028'),
('INF001', 'Mouse com Fio USB Logitech M90', 2, 39.90, '7891234560035'),
('INF002', 'Teclado com Fio USB Dell KB216', 2, 79.90, '7891234560042'),
('INF003', 'Monitor LED 21.5" Full HD LG', 2, 750.00, '7891234560059'),
('COZ001', 'Café em Pó a Vácuo 500g Pilão', 3, 18.50, '7891234560066'),
('COZ002', 'Açúcar Refinado 1kg União', 3, 5.20, '7891234560073'),
('COZ003', 'Copo Plástico Descartável 200ml (100 un)', 3, 8.90, '7891234560080'),
('LIM001', 'Detergente Líquido 500ml Ypê Neutro', 4, 2.50, '7891234560097'),
('LIM002', 'Desinfetante Pinho Sol 1L Original', 4, 11.90, '7891234560103'),
('MOB001', 'Cadeira de Escritório Giratória Presidente', 5, 899.90, '7891234560110'),
('MOB002', 'Mesa de Escritório 1,20m x 0,60m', 5, 450.00, '7891234560127'),
('INF004', 'Webcam Full HD 1080p Logitech C920', 2, 499.00, '7891234560134'),
('PAP003', 'Grampeador para 20 folhas Maped', 1, 25.00, '7891234560141'),
('LIM003', 'Álcool em Gel 70% 500ml', 4, 15.00, '7891234560158'),
('PAP004', 'Bloco Adesivo Post-it 76x76mm Amarelo', 1, 9.50, '7891234560165'),
('PAP005', 'Corretivo Líquido 18ml Mercur', 1, 4.20, '7891234560172'),
('PAP006', 'Marcador de Texto Amarelo Faber-Castell', 1, 3.80, '7891234560189'),
('INF005', 'Headset com Microfone USB Intelbras', 2, 129.90, '7891234560196'),
-- OBS: A partir daqui, SKUs e Códigos de Barra são ilustrativos
('INF006', 'Pen Drive 32GB SanDisk Cruzer Blade', 2, 45.00, '7891234560202'),
('INF007', 'Filtro de Linha 6 Tomadas Bivolt ForceLine', 2, 35.00, '7891234560219'),
('COZ004', 'Chá Matte Leão Fuze 25 sachês', 3, 7.80, '7891234560226'),
('COZ005', 'Adoçante Líquido Zero-Cal 100ml', 3, 9.10, '7891234560233'),
('COZ006', 'Guardanapo de Papel Folha Dupla (50 un)', 3, 6.50, '7891234560240'),
('LIM004', 'Saco de Lixo 50L Reforçado (20 un)', 4, 12.00, '7891234560257'),
('LIM005', 'Pano Multiuso Perfex Rolo com 50 panos', 4, 19.90, '7891234560264'),
('LIM006', 'Sabonete Líquido Erva Doce 500ml', 4, 14.50, '7891234560271'),
('MOB003', 'Armário Baixo 2 Portas 80x40x75cm', 5, 380.00, '7891234560288'),
('MOB004', 'Gaveteiro Volante 3 Gavetas', 5, 290.00, '7891234560295'),
('PAP007', 'Tesoura Mundial 18cm Inox', 1, 13.00, '7891234560301'),
('PAP008', 'Régua Acrílica 30cm Waleu', 1, 2.90, '7891234560318'),
('INF008', 'Mousepad Ergonômico com Apoio de Pulso', 2, 28.00, '7891234560325'),
('COZ007', 'Bebedouro de Galão de Água Esmaltec', 3, 350.00, '7891234560332'),
('LIM007', 'Esponja de Limpeza Dupla Face (pct 3 un)', 4, 4.50, '7891234560349'),
('MOB005', 'Apoio para Pés Ergonômico', 5, 85.00, '7891234560356');

-- =====================================================================
-- 5. Inserindo Estoque para 35 produtos na Filial Capão Raso (id_filial = 1)
-- =====================================================================
INSERT INTO Estoque (id_produto, id_fornecedor, id_filial, local_armazenamento, quantidade, estoque_minimo, estoque_maximo) VALUES
(1, 2, 1, 'Corredor A1', 200, 50, 400),
(2, 1, 1, 'Corredor A1', 500, 100, 1000),
(3, 5, 1, 'Corredor B1', 80, 20, 150),
(4, 15, 1, 'Corredor B1', 75, 20, 150),
(5, 4, 1, 'Corredor B2', 40, 10, 80),
(6, 8, 1, 'Copa', 100, 20, 200),
(7, 8, 1, 'Copa', 150, 30, 300),
(8, 2, 1, 'Copa', 300, 50, 500),
(9, 10, 1, 'DML', 250, 50, 400),
(10, 10, 1, 'DML', 180, 40, 300),
(11, 12, 1, 'Depósito M1', 15, 5, 30),
(12, 13, 1, 'Depósito M1', 25, 5, 50),
(13, 5, 1, 'Corredor B2', 60, 15, 100),
(14, 1, 1, 'Corredor A2', 150, 30, 250),
(15, 10, 1, 'DML', 200, 40, 350),
(16, 6, 1, 'Corredor A2', 400, 80, 600),
(17, 3, 1, 'Corredor A1', 120, 25, 200),
(18, 1, 1, 'Corredor A1', 300, 60, 500),
(19, 7, 1, 'Corredor B1', 90, 20, 180),
(20, 15, 1, 'Corredor B2', 250, 50, 400),
(21, 4, 1, 'Corredor B1', 100, 20, 200),
(22, 9, 1, 'Copa', 80, 15, 150),
(23, 9, 1, 'Copa', 70, 15, 120),
(24, 2, 1, 'Copa', 150, 30, 300),
(25, 10, 1, 'DML', 200, 40, 300),
(26, 6, 1, 'DML', 100, 20, 180),
(27, 10, 1, 'DML', 130, 25, 250),
(28, 13, 1, 'Depósito M2', 30, 10, 60),
(29, 12, 1, 'Depósito M2', 45, 15, 70),
(30, 1, 1, 'Corredor A2', 90, 20, 150),
(31, 3, 1, 'Corredor A2', 110, 30, 200),
(32, 5, 1, 'Corredor B2', 75, 15, 130),
(33, 11, 1, 'Depósito M1', 10, 2, 20),
(34, 6, 1, 'DML', 220, 50, 400),
(35, 12, 1, 'Depósito M2', 60, 10, 100);

-- =====================================================================
-- 6. Exemplo de um Pedido completo da Filial Capão Raso
-- =====================================================================
-- Passo A: Criar o cabeçalho do pedido na tabela 'PedidoFilial'
-- (Usando id_filial = 1 para 'Filial Capão Raso')
INSERT INTO PedidoFilial (id_filial, observacao, status) VALUES
(1, 'Reposição de material de escritório e informática para o financeiro.', 'Pendente');

-- Captura o ID do pedido que acabamos de criar para usar na inserção dos itens.
SET @ultimo_id_pedido = LAST_INSERT_ID();

-- Passo B: Inserir os itens neste pedido
-- (Usando os IDs dos produtos criados na etapa 4)
INSERT INTO ItensPedidoFilial (id_pedido_filial, id_produto, quantidade) VALUES
(@ultimo_id_pedido, 1, 50),  -- 50 resmas de Papel A4
(@ultimo_id_pedido, 2, 100), -- 100 canetas BIC
(@ultimo_id_pedido, 4, 10),  -- 10 teclados Dell
(@ultimo_id_pedido, 14, 20); -- 20 grampeadores
