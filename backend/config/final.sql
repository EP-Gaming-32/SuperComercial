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
    nome_grupo VARCHAR(100) NOT NULL UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
    tipo_pessoa ENUM('Jurídica', 'Física') NOT NULL,
    cnpj_cpf VARCHAR(20) NOT NULL UNIQUE,
    observacao TEXT,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Pedido das Filiais
CREATE TABLE PedidoFilial (
    id_pedido_filial INT AUTO_INCREMENT PRIMARY KEY,
    id_filial INT NOT NULL,
    data_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pendente','Atendido','Cancelado') NOT NULL DEFAULT 'Pendente',
    observacao TEXT,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_filial) REFERENCES Filial(id_filial)
);

CREATE TABLE ItensPedidoFilial (
    id_item_filial INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido_filial INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    FOREIGN KEY (id_pedido_filial) REFERENCES PedidoFilial(id_pedido_filial) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES Produtos(id_produto)
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

-- Vínculo entre PedidoFilial e OrdemCompra
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
    prazo_entrega INT NULL,
    condicoes_pagamento VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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

INSERT INTO FormaPagamento (descricao) VALUES
('Dinheiro'),
('Cartão de Crédito'),
('Cartão de Débito'),
('PIX'),
('Boleto'),
('Transferência Bancária');

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

-- Histórico de ativação/inativação de Produtos
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


ALTER TABLE ProdutoFornecedor
MODIFY COLUMN prazo_entrega INT NULL;