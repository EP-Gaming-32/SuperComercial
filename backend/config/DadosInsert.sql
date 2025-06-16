-- #####################################################################
-- ##       SCRIPT COMPLETO DE CRIAÇÃO E INSERÇÃO DE DADOS          ##
-- ##       (PODE SER EXECUTADO MÚLTIPLAS VEZES)                    ##
-- #####################################################################

-- Desativar verificação de chaves estrangeiras para permitir DROP TABLE em qualquer ordem
SET FOREIGN_KEY_CHECKS = 0;

-- Dropar tabelas se existirem para garantir um ambiente limpo a cada execução
DROP TABLE IF EXISTS PasswordResetTokens;
DROP TABLE IF EXISTS LogUsuario;
DROP TABLE IF EXISTS MovimentacaoEstoque;
DROP TABLE IF EXISTS Pagamentos;
DROP TABLE IF EXISTS FormaPagamento;
DROP TABLE IF EXISTS Feedback;
DROP TABLE IF EXISTS Estoque;
DROP TABLE IF EXISTS Lote;
DROP TABLE IF EXISTS ProdutoFornecedor;
DROP TABLE IF EXISTS OrdemCompraPedidoFilial;
DROP TABLE IF EXISTS ItensOrdemCompra;
DROP TABLE IF EXISTS HistoricoStatusOrdemCompra;
DROP TABLE IF EXISTS OrdemCompra;
DROP TABLE IF EXISTS HistoricoStatusPedidoFilial;
DROP TABLE IF EXISTS PedidoFilial;
DROP TABLE IF EXISTS Fornecedor;
DROP TABLE IF EXISTS Filial;
DROP TABLE IF EXISTS Produtos;
DROP TABLE IF EXISTS Grupos;
DROP TABLE IF EXISTS Usuarios;
-- Adicionar StatusPedido, que estava faltando no CREATE TABLE e é referenciado
DROP TABLE IF EXISTS StatusPedido;


-- Reativar verificação de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 1;

-- #####################################################################
-- ##                  CRIAÇÃO DAS TABELAS                            ##
-- #####################################################################

-- Tabela de Usuários
CREATE TABLE Usuarios (
    UsuarioID INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Telefone VARCHAR(20),
    Celular VARCHAR(20),
    Senha VARBINARY(64) NOT NULL
);

-- Tabela de Grupos
CREATE TABLE Grupos (
    id_grupo INT AUTO_INCREMENT PRIMARY KEY,
    nome_grupo VARCHAR(100) NOT NULL UNIQUE
);

-- Tabela de Produtos
CREATE TABLE Produtos (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    nome_produto VARCHAR(255) NOT NULL,
    id_grupo INT,
    valor_produto DECIMAL(10,2) NOT NULL,
    codigo_barras VARCHAR(50) NOT NULL UNIQUE,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_grupo) REFERENCES Grupos(id_grupo) ON DELETE RESTRICT
);

-- Tabela de Filiais
CREATE TABLE Filial (
    id_filial INT AUTO_INCREMENT PRIMARY KEY,
    nome_filial VARCHAR(255) NOT NULL,
    endereco_filial TEXT NOT NULL,
    telefone_filial VARCHAR(20),
    email_filial VARCHAR(100),
    gestor_filial VARCHAR(255),
    observacao TEXT,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabela de Fornecedores
CREATE TABLE Fornecedor (
    id_fornecedor INT AUTO_INCREMENT PRIMARY KEY,
    nome_fornecedor VARCHAR(255) NOT NULL,
    endereco_fornecedor TEXT NOT NULL,
    telefone_fornecedor VARCHAR(20),
    email_fornecedor VARCHAR(100),
    tipo_pessoa ENUM('juridica', 'fisica') NOT NULL,
    cnpj_cpf VARCHAR(20) NOT NULL UNIQUE,
    observacao TEXT,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabela de Status de Pedido (Adicionada, pois suas queries de histórico referenciam)
CREATE TABLE StatusPedido (
    id_status INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(50) NOT NULL UNIQUE
);

-- Pedido das Filiais
CREATE TABLE PedidoFilial (
    id_pedido_filial INT AUTO_INCREMENT PRIMARY KEY,
    id_filial INT NOT NULL,
    data_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pendente','Atendido','Cancelado') NOT NULL DEFAULT 'Pendente',
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0, -- Adicionado valor_total para PedidoFilial
    observacao TEXT,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_filial) REFERENCES Filial(id_filial)
);

CREATE TABLE HistoricoStatusPedidoFilial (
    id_historico_pf INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido_filial INT NOT NULL,
    status_antigo ENUM('Pendente','Atendido','Cancelado') NOT NULL,
    status_novo ENUM('Pendente','Atendido','Cancelado') NOT NULL,
    usuario_id INT NULL,
    motivo TEXT NULL,
    data_alteracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido_filial) REFERENCES PedidoFilial(id_pedido_filial) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(UsuarioID)
);

DELIMITER $$
CREATE TRIGGER trg_hist_pedidofilial_status
AFTER UPDATE ON PedidoFilial
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO HistoricoStatusPedidoFilial (
            id_pedido_filial, status_antigo, status_novo, usuario_id, motivo
        ) VALUES (
            NEW.id_pedido_filial,
            OLD.status,
            NEW.status,
            NULL,
            CONCAT('Alterado de ', OLD.status, ' para ', NEW.status)
        );
    END IF;
END$$
DELIMITER ;

-- Ordem de Compra (CD → Fornecedor)
CREATE TABLE OrdemCompra (
    id_ordem_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_fornecedor INT NOT NULL,
    data_ordem DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_entrega_prevista DATE,
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('Pendente','Recebido','Cancelado') NOT NULL DEFAULT 'Pendente',
    observacao TEXT,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_fornecedor) REFERENCES Fornecedor(id_fornecedor)
);

CREATE TABLE HistoricoStatusOrdemCompra (
    id_historico_oc INT AUTO_INCREMENT PRIMARY KEY,
    id_ordem_compra INT NOT NULL,
    status_antigo ENUM('Pendente','Recebido','Cancelado') NOT NULL,
    status_novo ENUM('Pendente','Recebido','Cancelado') NOT NULL,
    usuario_id INT NULL,
    motivo TEXT NULL,
    data_alteracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ordem_compra) REFERENCES OrdemCompra(id_ordem_compra) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(UsuarioID)
);

DELIMITER $$
CREATE TRIGGER trg_hist_ordemcompra_status
AFTER UPDATE ON OrdemCompra
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO HistoricoStatusOrdemCompra (
            id_ordem_compra, status_antigo, status_novo, usuario_id, motivo
        ) VALUES (
            NEW.id_ordem_compra,
            OLD.status,
            NEW.status,
            NULL,
            CONCAT('Alterado de ', OLD.status, ' para ', NEW.status)
        );
    END IF;
END$$
DELIMITER ;

CREATE TABLE ItensOrdemCompra (
    id_item_oc INT AUTO_INCREMENT PRIMARY KEY,
    id_ordem_compra INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_ordem_compra) REFERENCES OrdemCompra(id_ordem_compra) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES Produtos(id_produto)
);

-- Vínculo entre PedidoFilial e OrdemCompra (Adicionado para dar suporte a OrdemCompraPedidoFilial)
CREATE TABLE OrdemCompraPedidoFilial (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_ordem_compra INT NOT NULL,
    id_pedido_filial INT NOT NULL,
    FOREIGN KEY (id_ordem_compra) REFERENCES OrdemCompra(id_ordem_compra) ON DELETE CASCADE,
    FOREIGN KEY (id_pedido_filial) REFERENCES PedidoFilial(id_pedido_filial) ON DELETE CASCADE
);

-- Produto x Fornecedor
CREATE TABLE ProdutoFornecedor (
    id_produtoFornecedor INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_fornecedor INT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    prazo_entrega INT NOT NULL,
    condicoes_pagamento VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_produto) REFERENCES Produtos(id_produto) ON DELETE CASCADE,
    FOREIGN KEY (id_fornecedor) REFERENCES Fornecedor(id_fornecedor) ON DELETE CASCADE
);

-- Lotes
CREATE TABLE Lote (
    id_lote INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    codigo_lote VARCHAR(50) NOT NULL UNIQUE,
    data_expedicao DATE NOT NULL,
    data_validade DATE,
    quantidade INT NOT NULL CHECK (quantidade >= 0),
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES Produtos(id_produto)
);

-- Estoque
CREATE TABLE Estoque (
    id_estoque INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_fornecedor INT NOT NULL,
    id_filial INT NOT NULL,
    id_lote INT,
    local_armazenamento VARCHAR(255),
    quantidade INT NOT NULL CHECK (quantidade >= 0),
    estoque_minimo INT NOT NULL,
    estoque_maximo INT NOT NULL,
    status_estoque ENUM('normal', 'baixo', 'critico') GENERATED ALWAYS AS (
        CASE
            WHEN quantidade <= estoque_minimo THEN 'critico'
            WHEN quantidade <= estoque_maximo * 0.3 THEN 'baixo'
            ELSE 'normal'
        END
    ) STORED,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES Produtos(id_produto),
    FOREIGN KEY (id_fornecedor) REFERENCES Fornecedor(id_fornecedor),
    FOREIGN KEY (id_filial) REFERENCES Filial(id_filial),
    FOREIGN KEY (id_lote) REFERENCES Lote(id_lote) ON DELETE SET NULL
);

-- Feedback das Ordens de Compra
CREATE TABLE Feedback (
    id_feedback INT AUTO_INCREMENT PRIMARY KEY,
    id_ordem_compra INT NOT NULL,
    nota INT CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    data_feedback DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ordem_compra) REFERENCES OrdemCompra(id_ordem_compra)
);

-- Formas de Pagamento
CREATE TABLE FormaPagamento (
    id_forma_pagamento INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(50) NOT NULL UNIQUE
);

-- Pagamentos
CREATE TABLE Pagamentos (
    id_pagamento INT AUTO_INCREMENT PRIMARY KEY,
    id_ordem_compra INT NOT NULL,
    id_forma_pagamento INT NOT NULL,
    valor_pagamento DECIMAL(10,2) NOT NULL,
    data_pagamento DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ordem_compra) REFERENCES OrdemCompra(id_ordem_compra),
    FOREIGN KEY (id_forma_pagamento) REFERENCES FormaPagamento(id_forma_pagamento)
);

-- Movimentacao de Estoque
CREATE TABLE MovimentacaoEstoque (
    id_movimentacao INT AUTO_INCREMENT PRIMARY KEY,
    id_estoque INT NOT NULL,
    tipo_movimentacao ENUM('entrada', 'saida') NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade >= 0),
    data_movimentacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_estoque) REFERENCES Estoque(id_estoque) ON DELETE CASCADE
);

-- Log de Usuários
CREATE TABLE LogUsuario (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    acao VARCHAR(100) NOT NULL,
    tabela_afetada VARCHAR(100),
    registro_id INT,
    descricao TEXT,
    data_acao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(UsuarioID)
);

-- Token para redefinir senha
CREATE TABLE PasswordResetTokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    UsuarioID INT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID) ON DELETE CASCADE
);

-- Histórico de ativação/inativação de Produtos (TRIGGER)
CREATE TABLE HistoricoStatusProduto (
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    ativo BOOLEAN NOT NULL,
    usuario_id INT,
    motivo TEXT,
    data_status DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES Produtos(id_produto),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(UsuarioID)
);

DELIMITER $$
CREATE TRIGGER trg_historico_status_produto
AFTER UPDATE ON Produtos
FOR EACH ROW
BEGIN
    IF OLD.ativo <> NEW.ativo THEN
        INSERT INTO HistoricoStatusProduto (
            id_produto, ativo, usuario_id, motivo
        ) VALUES (
            NEW.id_produto, NEW.ativo, NULL, 'Atualização automática via trigger'
        );
    END IF;
END$$
DELIMITER ;


-- #####################################################################
-- ##                  INSERÇÃO DE DADOS INICIAIS                     ##
-- #####################################################################

-- =====================================================================
-- Inserindo Status de Pedido (Novo)
-- Necessário para PedidoFilial e OrdemCompra
-- =====================================================================
INSERT INTO StatusPedido (descricao) VALUES
('Pendente'),
('Atendido'),
('Cancelado'),
('Em Processamento'),
('Em Transporte');


-- =====================================================================
-- 1. Inserindo Grupos de Produtos
-- =====================================================================
INSERT INTO Grupos (nome_grupo) VALUES
('Papelaria e Escritório'),
('Informática e Periféricos'),
('Copa e Cozinha'),
('Limpeza e Higiene'),
('Mobiliário Corporativo');


-- =====================================================================
-- 2. Inserindo Filiais (com IDs específicos para facilitar testes)
-- =====================================================================
INSERT INTO Filial (id_filial, nome_filial, endereco_filial, telefone_filial, email_filial, gestor_filial) VALUES
(1, 'Filial Capão Raso', 'Av. República Argentina, 5000', '4133481010', 'capaoraso@suaempresa.com', 'Mariana Costa'),
(2, 'Filial Pinheirinho', 'Av. Winston Churchill, 200', '4133122020', 'pinheirinho@suaempresa.com', 'Roberto Almeida'),
(3, 'Filial Centro', 'R. Marechal Deodoro, 150', '4132223030', 'centro@suaempresa.com', 'Lucas Ferreira'),
(4, 'Filial Batel', 'Av. do Batel, 1800', '4130774040', 'batel@suaempresa.com', 'Beatriz Lima'),
(5, 'Filial Água Verde', 'Av. Pres. Getúlio Vargas, 3000', '4133425050', 'aguaverde@suaempresa.com', 'Fernando Martins'),
(6, 'Filial Portão', 'R. República Argentina, 3500', '4132296060', 'portao@suaempresa.com', 'Júlia Souza'),
(7, 'Filial Santa Felicidade', 'Av. Manoel Ribas, 5800', '4133727070', 'santafelicidade@suaempresa.com', 'Ricardo Oliveira'),
(8, 'Filial Boqueirão', 'Av. Mal. Floriano Peixoto, 9000', '4133868080', 'boqueirao@suaempresa.com', 'Camila Santos'),
(9, 'Filial Cajuru', 'Av. Prefeito Maurício Fruet, 2150', '4133619090', 'cajuru@suaempresa.com', 'Guilherme Pereira'),
(10, 'Filial CIC', 'R. Des. Cid Campêlo, 4500', '4133471110', 'cic@suaempresa.com', 'Vanessa Rocha'),
(11, 'Filial Uberaba', 'Av. Sen. Salgado Filho, 4560', '4133761212', 'uberaba@suaempresa.com', 'André Gonçalves'),
(12, 'Filial Bigorrilho', 'R. Padre Anchieta, 2500', '4133361313', 'bigorrilho@suaempresa.com', 'Laura Azevedo'),
(13, 'Filial Juvevê', 'R. Nicolau Maeder, 500', '4132541414', 'juveve@suaempresa.com', 'Thiago Borges'),
(14, 'Filial Cabral', 'Av. Paraná, 800', '4132531515', 'cabral@suaempresa.com', 'Rafaela Nunes'),
(15, 'Filial Rebouças', 'Av. Sete de Setembro, 2775', '4133621616', 'reboucas@suaempresa.com', 'Marcelo Vieira');


-- =====================================================================
-- 3. Inserindo Fornecedores
-- =====================================================================
INSERT INTO Fornecedor (id_fornecedor, nome_fornecedor, endereco_fornecedor, telefone_fornecedor, email_fornecedor, tipo_pessoa, cnpj_cpf) VALUES
(1, 'Kalunga Comércio e Indústria Gráfica Ltda', 'Rua da Mooca, 766, São Paulo-SP', '1129555000', 'vendas@kalunga.com.br', 'juridica', '43.211.316/0001-24'),
(2, 'Brasko Papéis', 'Rod. BR-116, 12000, Curitiba-PR', '4133494900', 'contato@brasko.com.br', 'juridica', '02.518.106/0001-19'),
(3, 'Gimba.com', 'Av. dos Autonomistas, 1400, Osasco-SP', '1134652000', 'atendimento@gimba.com', 'juridica', '48.529.704/0001-34'),
(4, 'InfoDistribuidora S.A.', 'Av. das Nações, 500, São Paulo-SP', '1140041010', 'comercial@infodistribuidora.com', 'juridica', '15.456.789/0001-10'),
(5, 'Logitech do Brasil', 'R. Funchal, 418, São Paulo-SP', '1132258000', 'suporte@logitech.com', 'juridica', '08.675.248/0001-93'),
(6, '3M do Brasil Ltda', 'Rod. Anhanguera, km 110, Sumaré-SP', '1938567000', 'faleconosco@3m.com', 'juridica', '45.985.371/0001-08'),
(7, 'Intelbras S.A.', 'Rod. BR-101, km 210, São José-SC', '4832819500', 'contato@intelbras.com.br', 'juridica', '82.901.000/0001-27'),
(8, 'Café Pilão - JDE Brasil', 'Av. Eng. Luís Carlos Berrini, 105, São Paulo-SP', '08007280203', 'sac@jdecoffee.com', 'juridica', '33.113.804/0001-72'),
(9, 'Melitta do Brasil', 'Av. Paulista, 1842, São Paulo-SP', '0800140202', 'sac@melitta.com.br', 'juridica', '61.077.042/0001-01'),
(10, 'Ypê Química Amparo', 'Av. Waldyr Beira, 1000, Amparo-SP', '1938074000', 'sac@ype.ind.br', 'juridica', '43.461.993/0001-00'),
(11, 'Gazin Atacado', 'Rod. PR-082, 4554, Douradina-PR', '4436638000', 'atacado@gazin.com.br', 'juridica', '77.941.490/0001-55'),
(12, 'Flexform Cadeiras', 'Rua dos Plásticos, 100, Guarulhos-SP', '1124233300', 'vendas@flexform.com.br', 'juridica', '50.787.037/0001-83'),
(13, 'Marelli Ambientes Corporativos', 'Al. das Indústrias, 200, Caxias do Sul-RS', '5432181000', 'contato@marelli.com.br', 'juridica', '88.665.231/0001-70'),
(14, 'Osram do Brasil', 'Av. dos Autonomistas, 4900, Osasco-SP', '08007772600', 'sac.br@osram.com', 'juridica', '60.869.832/0001-44'),
(15, 'Positivo Tecnologia S.A.', 'Rua João Bettega, 5200, Curitiba-PR', '4133167700', 'relacoes@positivo.com.br', 'juridica', '81.243.735/0001-48');


-- =====================================================================
-- 4. Inserindo Produtos
-- =====================================================================
INSERT INTO Produtos (id_produto, sku, nome_produto, id_grupo, valor_produto, codigo_barras) VALUES
(1, 'PAP001', 'Papel Sulfite A4 75g Resma 500 fls', 1, 29.90, '7891234560011'),
(2, 'PAP002', 'Caneta Esferográfica Azul BIC', 1, 1.80, '7891234560028'),
(3, 'INF001', 'Mouse com Fio USB Logitech M90', 2, 39.90, '7891234560035'),
(4, 'INF002', 'Teclado com Fio USB Dell KB216', 2, 79.90, '7891234560042'),
(5, 'INF003', 'Monitor LED 21.5" Full HD LG', 2, 750.00, '7891234560059'),
(6, 'COZ001', 'Café em Pó a Vácuo 500g Pilão', 3, 18.50, '7891234560066'),
(7, 'COZ002', 'Açúcar Refinado 1kg União', 3, 5.20, '7891234560073'),
(8, 'COZ003', 'Copo Plástico Descartável 200ml (100 un)', 3, 8.90, '7891234560080'),
(9, 'LIM001', 'Detergente Líquido 500ml Ypê Neutro', 4, 2.50, '7891234560097'),
(10, 'LIM002', 'Desinfetante Pinho Sol 1L Original', 4, 11.90, '7891234560103'),
(11, 'MOB001', 'Cadeira de Escritório Giratória Presidente', 5, 899.90, '7891234560110'),
(12, 'MOB002', 'Mesa de Escritório 1,20m x 0,60m', 5, 450.00, '7891234560127'),
(13, 'INF004', 'Webcam Full HD 1080p Logitech C920', 2, 499.00, '7891234560134'),
(14, 'PAP003', 'Grampeador para 20 folhas Maped', 1, 25.00, '7891234560141'),
(15, 'LIM003', 'Álcool em Gel 70% 500ml', 4, 15.00, '7891234560158'),
(16, 'PAP004', 'Bloco Adesivo Post-it 76x76mm Amarelo', 1, 9.50, '7891234560165'),
(17, 'PAP005', 'Corretivo Líquido 18ml Mercur', 1, 4.20, '7891234560172'),
(18, 'PAP006', 'Marcador de Texto Amarelo Faber-Castell', 1, 3.80, '7891234560189'),
(19, 'INF005', 'Headset com Microfone USB Intelbras', 2, 129.90, '7891234560196'),
(20, 'INF006', 'Pen Drive 32GB SanDisk Cruzer Blade', 2, 45.00, '7891234560202'),
(21, 'INF007', 'Filtro de Linha 6 Tomadas Bivolt ForceLine', 2, 35.00, '7891234560219'),
(22, 'COZ004', 'Chá Matte Leão Fuze 25 sachês', 3, 7.80, '7891234560226'),
(23, 'COZ005', 'Adoçante Líquido Zero-Cal 100ml', 3, 9.10, '7891234560233'),
(24, 'COZ006', 'Guardanapo de Papel Folha Dupla (50 un)', 3, 6.50, '7891234560240'),
(25, 'LIM004', 'Saco de Lixo 50L Reforçado (20 un)', 4, 12.00, '7891234560257'),
(26, 'LIM005', 'Pano Multiuso Perfex Rolo com 50 panos', 4, 19.90, '7891234560264'),
(27, 'LIM006', 'Sabonete Líquido Erva Doce 500ml', 4, 14.50, '7891234560271'),
(28, 'MOB003', 'Armário Baixo 2 Portas 80x40x75cm', 5, 380.00, '7891234560288'),
(29, 'MOB004', 'Gaveteiro Volante 3 Gavetas', 5, 290.00, '7891234560295'),
(30, 'PAP007', 'Tesoura Mundial 18cm Inox', 1, 13.00, '7891234560301'),
(31, 'PAP008', 'Régua Acrílica 30cm Waleu', 1, 2.90, '7891234560318'),
(32, 'INF008', 'Mousepad Ergonômico com Apoio de Pulso', 2, 28.00, '7891234560325'),
(33, 'COZ007', 'Bebedouro de Galão de Água Esmaltec', 3, 350.00, '7891234560332'),
(34, 'LIM007', 'Esponja de Limpeza Dupla Face (pct 3 un)', 4, 4.50, '7891234560349'),
(35, 'MOB005', 'Apoio para Pés Ergonômico', 5, 85.00, '7891234560356');


-- =====================================================================
-- 5. Inserindo Estoque e Lotes (com datas de validade para testes de vencimento)
-- Distribuindo estoque em várias filiais.
-- =====================================================================

-- Filial Capão Raso (id_filial = 1)
INSERT INTO Lote (id_lote, id_produto, codigo_lote, data_expedicao, data_validade, quantidade) VALUES
(101, 1, 'LOTE001PA', '2024-01-01', '2025-12-31', 200), -- Futuro
(102, 2, 'LOTE002PB', '2023-05-15', '2024-06-01', 500), -- Passado (Vencido)
(103, 3, 'LOTE003MO', '2024-02-20', '2025-10-20', 80);
INSERT INTO Estoque (id_produto, id_fornecedor, id_filial, id_lote, local_armazenamento, quantidade, estoque_minimo, estoque_maximo) VALUES
(1, 2, 1, 101, 'Corredor A1', 200, 50, 400),
(2, 1, 1, 102, 'Corredor A1', 500, 100, 1000),
(3, 5, 1, 103, 'Corredor B1', 80, 20, 150);

-- Filial Pinheirinho (id_filial = 2)
INSERT INTO Lote (id_lote, id_produto, codigo_lote, data_expedicao, data_validade, quantidade) VALUES
(201, 1, 'LOTE001PI', '2024-03-01', '2025-11-30', 150),
(202, 4, 'LOTE004TE', '2023-01-01', '2024-01-01', 75), -- Passado (Vencido)
(203, 6, 'LOTE006CF', '2024-04-10', '2025-08-15', 100);
INSERT INTO Estoque (id_produto, id_fornecedor, id_filial, id_lote, local_armazenamento, quantidade, estoque_minimo, estoque_maximo) VALUES
(1, 2, 2, 201, 'Depósito P1', 150, 40, 300),
(4, 15, 2, 202, 'Depósito P2', 75, 20, 150),
(6, 8, 2, 203, 'Copa P', 100, 20, 200);

-- Filial Centro (id_filial = 3)
INSERT INTO Lote (id_lote, id_produto, codigo_lote, data_expedicao, data_validade, quantidade) VALUES
(301, 1, 'LOTE001CE', '2024-02-01', '2025-10-31', 100),
(302, 5, 'LOTE005MO', '2023-11-01', '2024-02-28', 40), -- Passado (Vencido)
(303, 9, 'LOTE009DE', '2024-01-05', '2025-09-01', 250);
INSERT INTO Estoque (id_produto, id_fornecedor, id_filial, id_lote, local_armazenamento, quantidade, estoque_minimo, estoque_maximo) VALUES
(1, 2, 3, 301, 'Armário C1', 100, 20, 200),
(5, 4, 3, 302, 'Armário C2', 40, 10, 80),
(9, 10, 3, 303, 'Limpeza C', 250, 50, 400);


-- Mais alguns estoques sem lotes para outros produtos (apenas a Filial 1)
INSERT INTO Estoque (id_produto, id_fornecedor, id_filial, local_armazenamento, quantidade, estoque_minimo, estoque_maximo) VALUES
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
-- 6. Inserindo Pedidos de Filiais e Ordens de Compra (com datas para históricos)
-- =====================================================================

-- Inserindo Formas de Pagamento
INSERT INTO FormaPagamento (descricao) VALUES
('Dinheiro'), ('Cartão de Crédito'), ('Cartão de Débito'), ('PIX'), ('Boleto'), ('Transferência Bancária');

-- Pedidos da Filial 1 (Capão Raso)
INSERT INTO PedidoFilial (id_filial, data_pedido, status, valor_total, observacao) VALUES
(1, '2024-01-10 10:00:00', 'Atendido', 1500.00, 'Pedido mensal de rotina.'),
(1, '2024-02-15 11:30:00', 'Pendente', 800.00, 'Reposição urgente de papel.'),
(1, '2024-03-20 09:00:00', 'Cancelado', 200.00, 'Item indisponível.'),
(1, '2024-04-05 14:00:00', 'Atendido', 1200.00, 'Pedido de material de limpeza.'),
(1, '2024-05-01 16:00:00', 'Em Processamento', 950.00, 'Material de informática novo.');

-- Pedidos da Filial 2 (Pinheirinho)
INSERT INTO PedidoFilial (id_filial, data_pedido, status, valor_total, observacao) VALUES
(2, '2024-01-20 10:00:00', 'Atendido', 700.00, 'Reposição de café e açúcar.'),
(2, '2024-03-01 11:00:00', 'Pendente', 300.00, 'Material de escritório.');

-- Pedidos da Filial 3 (Centro)
INSERT INTO PedidoFilial (id_filial, data_pedido, status, valor_total, observacao) VALUES
(3, '2024-02-05 09:30:00', 'Atendido', 2000.00, 'Grandes volumes para evento.'),
(3, '2024-04-10 15:00:00', 'Pendente', 600.00, 'Cadeiras adicionais.');

-- Captura IDs dos pedidos criados
SET @id_pf_1 = (SELECT id_pedido_filial FROM PedidoFilial WHERE id_filial = 1 AND observacao LIKE 'Pedido mensal%' ORDER BY id_pedido_filial DESC LIMIT 1);
SET @id_pf_2 = (SELECT id_pedido_filial FROM PedidoFilial WHERE id_filial = 1 AND observacao LIKE 'Reposição urgente%' ORDER BY id_pedido_filial DESC LIMIT 1);
SET @id_pf_3 = (SELECT id_pedido_filial FROM PedidoFilial WHERE id_filial = 1 AND observacao LIKE 'Item indisponível%' ORDER BY id_pedido_filial DESC LIMIT 1);
SET @id_pf_4 = (SELECT id_pedido_filial FROM PedidoFilial WHERE id_filial = 1 AND observacao LIKE 'Material de limpeza%' ORDER BY id_pedido_filial DESC LIMIT 1);
SET @id_pf_5 = (SELECT id_pedido_filial FROM PedidoFilial WHERE id_filial = 1 AND observacao LIKE 'Material de informática%' ORDER BY id_pedido_filial DESC LIMIT 1);
SET @id_pf_6 = (SELECT id_pedido_filial FROM PedidoFilial WHERE id_filial = 2 AND observacao LIKE 'Reposição de café%' ORDER BY id_pedido_filial DESC LIMIT 1);
SET @id_pf_7 = (SELECT id_pedido_filial FROM PedidoFilial WHERE id_filial = 2 AND observacao LIKE 'Material de escritório%' ORDER BY id_pedido_filial DESC LIMIT 1);
SET @id_pf_8 = (SELECT id_pedido_filial FROM PedidoFilial WHERE id_filial = 3 AND observacao LIKE 'Grandes volumes%' ORDER BY id_pedido_filial DESC LIMIT 1);
SET @id_pf_9 = (SELECT id_pedido_filial FROM PedidoFilial WHERE id_filial = 3 AND observacao LIKE 'Cadeiras adicionais%' ORDER BY id_pedido_filial DESC LIMIT 1);


-- Inserir ItensPedidoFilial (exemplo para alguns pedidos)
INSERT INTO ItensPedidoFilial (id_pedido_filial, id_produto, quantidade) VALUES
(@id_pf_1, 1, 50), (@id_pf_1, 2, 100), (@id_pf_1, 4, 10),
(@id_pf_2, 1, 30), (@id_pf_2, 14, 5);

-- Ordens de Compra (associadas a pedidos de filiais)
-- Ordem de Compra para pedido @id_pf_1 (Filial Capão Raso, associado a Fornecedor 2 - Brasko Papéis)
INSERT INTO OrdemCompra (id_fornecedor, data_ordem, data_entrega_prevista, valor_total, status, observacao) VALUES
(2, '2024-01-12 10:00:00', '2024-01-20', 1400.00, 'Recebido', 'Ordem de compra para papel e canetas.'),
(1, '2024-02-17 14:00:00', '2024-02-25', 750.00, 'Pendente', 'Ordem para papel urgente.'),
(4, '2024-05-02 10:00:00', '2024-05-10', 900.00, 'Pendente', 'Ordem de compra para monitores e teclados.');

SET @id_oc_1 = LAST_INSERT_ID() - 2; -- ID da primeira OC criada
SET @id_oc_2 = LAST_INSERT_ID() - 1; -- ID da segunda OC criada
SET @id_oc_3 = LAST_INSERT_ID();     -- ID da terceira OC criada

-- Vínculo OrdemCompra com PedidoFilial
INSERT INTO OrdemCompraPedidoFilial (id_ordem_compra, id_pedido_filial) VALUES
(@id_oc_1, @id_pf_1),
(@id_oc_2, @id_pf_2),
(@id_oc_3, @id_pf_5);

-- Inserir ItensOrdemCompra
INSERT INTO ItensOrdemCompra (id_ordem_compra, id_produto, quantidade, preco_unitario) VALUES
(@id_oc_1, 1, 50, 28.00), (@id_oc_1, 2, 100, 1.50),
(@id_oc_2, 1, 30, 27.00), (@id_oc_2, 14, 5, 23.00),
(@id_oc_3, 5, 10, 700.00), (@id_oc_3, 4, 5, 75.00);

-- Inserindo Pagamentos (Exemplo de pagamentos para Ordens de Compra)
INSERT INTO Pagamentos (id_ordem_compra, id_forma_pagamento, valor_pagamento, data_pagamento) VALUES
(@id_oc_1, 1, 1400.00, '2024-01-25 10:00:00'),
(@id_oc_1, 4, 500.00, '2024-01-26 11:00:00');

-- Adicionando mais dados para o relatório de Vencidos (Lotes com data_validade no passado)
INSERT INTO Lote (id_lote, id_produto, codigo_lote, data_expedicao, data_validade, quantidade) VALUES
(401, 7, 'LOTE401AC', '2023-01-01', '2024-01-31', 200), -- Açúcar (Vencido)
(402, 8, 'LOTE402CO', '2023-03-01', '2024-03-31', 100), -- Copo Plástico (Vencido)
(403, 10, 'LOTE403DE', '2023-05-01', '2024-05-31', 50); -- Desinfetante (Vencido)

-- Associar esses lotes vencidos a estoque em alguma filial (ex: Filial 1 - Capão Raso)
INSERT INTO Estoque (id_produto, id_fornecedor, id_filial, id_lote, local_armazenamento, quantidade, estoque_minimo, estoque_maximo) VALUES
(7, 8, 1, 401, 'Copa', 200, 10, 500),
(8, 2, 1, 402, 'Copa', 100, 10, 500),
(10, 10, 1, 403, 'DML', 50, 10, 300);


-- SELECT id_filial, nome_filial FROM Filial WHERE ativo = TRUE LIMIT 5;
-- Essa consulta estava no final do script e não é parte da inserção. Ela será removida.

-- SELECT f.nome_filial, SUM(e.quantidade) AS total_estoque FROM Estoque e JOIN Filial f ON e.id_filial = f.id_filial GROUP BY f.nome_filial, f.id_filial ORDER BY f.id_filial;
-- Esta consulta também não é parte da inserção e será removida.
