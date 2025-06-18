-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS gameverse;
USE gameverse;

-- Tabela de usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    verificado BOOLEAN DEFAULT FALSE,
    codigoVerificacao VARCHAR(6),
    reset_password_token VARCHAR(255),
    reset_password_expires DATETIME,
    admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de categorias
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    userId INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_categoria_por_usuario (nome, userId)
);

-- Tabela de jogos
CREATE TABLE jogos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ano INT NOT NULL,
    genero VARCHAR(255),
    imagem VARCHAR(255),
    userId INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de relação entre jogos e categorias
CREATE TABLE jogo_categorias (
    jogo_id INT NOT NULL,
    categoria_id INT NOT NULL,
    PRIMARY KEY (jogo_id, categoria_id),
    FOREIGN KEY (jogo_id) REFERENCES jogos(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- Índices para melhorar o desempenho
CREATE INDEX idx_jogos_usuario ON jogos(userId);
CREATE INDEX idx_categorias_usuario ON categorias(userId);
CREATE INDEX idx_reset_token ON usuarios(reset_password_token);

-- Inserir administrador padrão
INSERT INTO usuarios (nome, email, senha, verificado, admin) 
VALUES ('Admin', 'admin@gameverse.com', '$2b$10$7JJztsUH4GR4xlR0YZ3dEuGyoT6.YL8UNwgstV3wQGCw94xHKUJ2W', true, true);
-- senha do admin é 'admin123'

-- Criar algumas categorias padrão para o admin
INSERT INTO categorias (nome, userId) VALUES 
('RPG', 1),
('Ação', 1),
('Aventura', 1),
('Esporte', 1),
('Estratégia', 1),
('Simulação', 1),
('Corrida', 1),
('Puzzle', 1);

-- Tabela de avaliações de jogos
CREATE TABLE avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jogo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    pontuacao TINYINT NOT NULL CHECK (pontuacao BETWEEN 1 AND 5),
    texto TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (jogo_id) REFERENCES jogos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_avaliacao (jogo_id, usuario_id)
);

-- Índice para melhorar performance de buscas
CREATE INDEX idx_avaliacoes_jogo ON avaliacoes(jogo_id);

-- Execute esta query no seu banco de dados
ALTER TABLE jogos ADD COLUMN privado BOOLEAN DEFAULT 0;