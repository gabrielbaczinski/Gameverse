const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json()); // Necessário para interpretar JSON no body da requisição

// Configuração do banco de dados
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "gameverse",
});

// Conexão com o banco de dados
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    return;
  }
  console.log("Conectado ao banco de dados!");
});

// Funções auxiliares para token
const generateToken = (id, email) => {
  return jwt.sign({ id: id, email: email }, 'meusegredoabc', { expiresIn: '30m'});
};

const verifyToken = (token) => {
  return jwt.verify(token, 'meusegredoabc');
};

// Middleware para verificar autenticação
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// Endpoint para pegar jogos
app.get("/api/jogos", (req, res) => {
  const query = "SELECT * FROM jogos";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar jogos" });
    res.json(results);
  });
});

// Inserir novo jogo
app.post("/api/jogos", (req, res) => {
  const { nome, ano, genero, imagem } = req.body;
  const query = "INSERT INTO jogos (nome, ano, genero, imagem) VALUES (?, ?, ?, ?)";
  db.query(query, [nome, ano, genero, imagem], (err, result) => {
    if (err) return res.status(500).json({ error: "Erro ao inserir jogo" });
    res.status(201).json({ message: "Jogo criado com sucesso!", id: result.insertId });
  });
});

// Cadastrar usuário
app.post("/api/usuarios", (req, res) => {
  const { nome, email, senha } = req.body;
  const query = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
  db.query(query, [nome, email, senha], (err, result) => {
    if (err) return res.status(500).json({ error: "Erro ao inserir usuário" });
    res.status(201).json({ message: "Usuário cadastrado com sucesso!", id: result.insertId });
  });
});

// Login com token JWT
app.post("/api/login", (req, res) => {
  const { email, senha } = req.body;
  const query = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
  db.query(query, [email, senha], (err, results) => {
    if (err) return res.status(500).json({ error: "Erro interno do servidor" });

    if (results.length === 0) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    const usuario = results[0];
    const token = generateToken(usuario.id, usuario.email);
    res.status(200).json({
      message: "Login realizado com sucesso",
      token,
      id: usuario.id // ou usuario._id, dependendo do seu banco
    });
  });
});

// GET de todos os usuários (protegido)
app.get('/api/usuarios', authenticate, (req, res) => {
  const query = "SELECT id, nome FROM usuarios";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar usuários" });
    res.status(200).json(results);
  });
});

// GET usuário por ID
app.get('/api/usuarios/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = "SELECT id, nome, email FROM usuarios WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar usuário" });
    if (results.length === 0) return res.status(404).json({ error: "Usuário não encontrado" });
    res.status(200).json(results[0]);
  });
});

app.get('/api/perfil', authenticate, (req, res) => {
  const userId = req.userId;
  const query = "SELECT id, nome, email FROM usuarios WHERE id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar perfil" });
    if (results.length === 0) return res.status(404).json({ error: "Usuário não encontrado" });
    res.status(200).json(results[0]);
  });
});



// POST para criar ou atualizar usuário
app.post('/api/usuario', (req, res) => {
  const { id, nome } = req.body;

  if (id) {
    const query = "UPDATE usuarios SET nome = ? WHERE id = ?";
    db.query(query, [nome, id], (err) => {
      if (err) return res.status(500).json({ error: "Erro ao atualizar usuário" });
      res.status(200).json({ message: "Usuário atualizado com sucesso" });
    });
  } else {
    const query = "INSERT INTO usuarios (nome) VALUES (?)";
    db.query(query, [nome], (err, result) => {
      if (err) return res.status(500).json({ error: "Erro ao inserir usuário" });
      res.status(201).json({ message: "Usuário criado com sucesso", id: result.insertId });
    });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
