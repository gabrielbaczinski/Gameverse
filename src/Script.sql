-- Tabela: usuarios
CREATE TABLE usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  reset_password_token VARCHAR(255) DEFAULT NULL,
  reset_password_expires DATETIME DEFAULT NULL,
  verificado TINYINT(1) DEFAULT 0,
  codigoVerificacao VARCHAR(6) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: categorias
CREATE TABLE categorias (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: jogos
CREATE TABLE jogos (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  ano INT NOT NULL,
  genero VARCHAR(255) NOT NULL,
  imagem VARCHAR(255) DEFAULT NULL,
  userId INT DEFAULT NULL,
  PRIMARY KEY (id),
  KEY (userId),
  CONSTRAINT jogos_ibfk_1 FOREIGN KEY (userId) REFERENCES usuarios (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: jogo_categorias
CREATE TABLE jogo_categorias (
  jogo_id INT NOT NULL,
  categoria_id INT NOT NULL,
  PRIMARY KEY (jogo_id, categoria_id),
  KEY (categoria_id),
  CONSTRAINT jogo_categorias_ibfk_1 FOREIGN KEY (jogo_id) REFERENCES jogos (id) ON DELETE CASCADE,
  CONSTRAINT jogo_categorias_ibfk_2 FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
