const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());

// Configuração do banco de dados
const db = mysql.createConnection({
  host: "localhost",  // Ajuste o host, usuário, senha e banco conforme necessário
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

// Endpoint para pegar os jogos
app.get("/api/jogos", (req, res) => {
  const query = "SELECT * FROM jogos";  // Ajuste o nome da tabela conforme necessário
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: "Erro ao buscar jogos" });
      return;
    }
    res.json(results);
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

app.use(express.json()); // Necessário para interpretar JSON no body da requisição

app.post("/api/jogos", (req, res) => {
  const { nome, ano, genero, imagem } = req.body;

  const query = "INSERT INTO jogos (nome, ano, genero, imagem) VALUES (?, ?, ?, ?)";
  const values = [nome, ano, genero, imagem];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Erro ao inserir jogo:", err);
      return res.status(500).json({ error: "Erro ao inserir jogo" });
    }

    res.status(201).json({ message: "Jogo criado com sucesso!", id: result.insertId });
  });
});

app.post("/api/usuarios", (req, res) => {
    const { nome, email, senha } = req.body;
  
    const query = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
    const values = [nome, email, senha];
  
    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Erro ao inserir usuário:", err);
        return res.status(500).json({ error: "Erro ao inserir usuário" });
      }
  
      res.status(201).json({ message: "Usuário cadastrado com sucesso!", id: result.insertId });
    });
  });
  
  app.post("/api/login", (req, res) => {
    const { email, senha } = req.body;
  
    const query = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
    const values = [email, senha];
  
    db.query(query, values, (err, results) => {
      if (err) {
        console.error("Erro ao buscar usuário:", err);
        return res.status(500).json({ error: "Erro interno do servidor" });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }
  
      // Aqui você pode gerar um token se quiser (JWT por exemplo)
      const usuario = results[0];
      res.status(200).json({ message: "Login realizado com sucesso", usuario });
    });
  });
  