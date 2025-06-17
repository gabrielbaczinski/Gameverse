const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only specific image formats
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.');
      error.code = 'INVALID_FILE_TYPE';
      return cb(error, false);
    }
    cb(null, true);
  }
});

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json()); // Necessário para interpretar JSON no body da requisição

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025, // porta do MailDev
  secure: false,
  auth: {
    user: null,
    pass: null
  },
  tls: {
    rejectUnauthorized: false
  }
});

const JWT_SECRET = 'meusegredoabc'; // Mantenha seguro e fora do código em produção
const generateToken = (id, email) => {
  return jwt.sign({ id: id, email: email }, JWT_SECRET, { expiresIn: '1h' }); // Aumentei para 1h
};


const verifyToken = (token) => {
  return jwt.verify(token, 'meusegredoabc');
};

// Middleware para verificar autenticação
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Formato do token inválido' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

// Endpoint para pegar jogos
app.get("/api/jogos", authenticate, (req, res) => {
  try {
    // 1. Buscar todos os jogos do usuário
    db.query(
      "SELECT * FROM jogos WHERE userId = ?",
      [req.userId],
      (err, jogos) => {
        if (err) {
          console.error("Erro ao buscar jogos:", err);
          return res.status(500).json({ message: "Erro ao buscar jogos" });
        }

        // Se não há jogos, retorne uma array vazia
        if (jogos.length === 0) {
          return res.json([]);
        }

        // 2. Para cada jogo, buscar suas categorias
        let processed = 0;
        jogos.forEach((jogo) => {
          // Observe o nome correto da tabela: jogo_categorias (singular)
          db.query(
            `SELECT c.nome 
             FROM jogo_categorias jc 
             JOIN categorias c ON jc.categoria_id = c.id 
             WHERE jc.jogo_id = ?`,
            [jogo.id],
            (err, categorias) => {
              processed++;

              // Adicionar array de categorias ao jogo
              if (err) {
                console.error(`Erro ao buscar categorias do jogo ${jogo.id}:`, err);
                jogo.categorias = [];
              } else {
                jogo.categorias = categorias.map(c => c.nome);
              }

              // Quando todos os jogos tiverem sido processados, enviar resposta
              if (processed === jogos.length) {
                res.json(jogos);
              }
            }
          );
        });
      }
    );
  } catch (error) {
    console.error("Erro ao buscar jogos:", error);
    res.status(500).json({ message: "Erro ao buscar jogos" });
  }
});

// Substitua o endpoint POST /api/jogos existente:

app.post("/api/jogos", authenticate, upload.single('imagem'), async (req, res) => {
  try {
    console.log("Dados recebidos:", req.body);
    console.log("Dados do usuário:", req.userId);
    
    const { nome, ano, genero, imagemUrl } = req.body;
    
    // Determinar o caminho da imagem
    let imagem;
    if (req.file) {
      // Caso de upload de arquivo
      imagem = `/uploads/${req.file.filename}`;
      console.log("Usando arquivo enviado:", imagem);
    } else if (imagemUrl) {
      // Caso de URL externa
      imagem = imagemUrl;
      console.log("Usando URL externa:", imagem);
    } else {
      return res.status(400).json({
        message: "É necessário fornecer uma imagem ou URL",
        type: "error"
      });
    }

    // Validação de campos obrigatórios
    if (!nome || !ano || !genero) {
      return res.status(400).json({
        message: "Nome, ano e gênero são obrigatórios",
        type: "error"
      });
    }

    // Inserir dados no banco
    const query = "INSERT INTO jogos (nome, ano, genero, imagem, userId) VALUES (?, ?, ?, ?, ?)";
    
    db.query(query, [nome, ano, genero, imagem, req.userId], (err, result) => {
      if (err) {
        console.error("Erro SQL:", err);
        return res.status(500).json({
          message: "Erro ao inserir jogo no banco: " + err.message,
          type: "error"
        });
      }

      console.log("Jogo inserido com sucesso, ID:", result.insertId);
      return res.status(201).json({
        message: "Jogo criado com sucesso!",
        id: result.insertId,
        type: "success"
      });
    });
  } catch (error) {
    console.error("Erro geral:", error);
    return res.status(500).json({
      message: "Erro interno no servidor",
      type: "error"
    });
  }
});

// Endpoint para buscar jogos com suas categorias
app.get("/api/jogos", authenticate, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [jogos] = await conn.query(`
      SELECT j.*, 
        GROUP_CONCAT(c.nome) as categorias
      FROM jogos j
      LEFT JOIN jogos_categorias jc ON j.id = jc.jogo_id
      LEFT JOIN categorias c ON jc.categoria_id = c.id
      WHERE j.userId = ?
      GROUP BY j.id
    `, [req.userId]);

    res.json(jogos.map(jogo => ({
      ...jogo,
      categorias: jogo.categorias ? jogo.categorias.split(',') : []
    })));
  } catch (error) {
    console.error("Erro ao buscar jogos:", error);
    res.status(500).json({ error: "Erro ao buscar jogos" });
  }
});

// Cadastrar usuário
app.post("/api/usuarios", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios." });
  }

  try {
    const hashedPassword = await bcrypt.hash(senha, 10);
    const codigoVerificacao = Math.floor(100000 + Math.random() * 900000).toString();

    const query = "INSERT INTO usuarios (nome, email, senha, codigoVerificacao) VALUES (?, ?, ?, ?)";
    db.query(query, [nome, email, hashedPassword, codigoVerificacao], async (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: "Email já cadastrado." });
        }
        console.error("Erro ao inserir usuário:", err);
        return res.status(500).json({ error: "Erro ao cadastrar usuário" });
      }

      try {
        await enviarCodigoVerificacao(email, codigoVerificacao);
        res.status(201).json({
          message: "Usuário cadastrado com sucesso! Verifique seu email.",
          id: result.insertId
        });
      } catch (emailError) {
        console.error("Erro ao enviar email:", emailError);
        res.status(201).json({
          message: "Usuário cadastrado, mas houve erro ao enviar email de verificação.",
          id: result.insertId
        });
      }
    });
  } catch (error) {
    console.error("Erro ao hashear senha:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Login com token JWT
app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;

  const query = "SELECT * FROM usuarios WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Erro no login:", err);
      return res.status(500).json({ 
        error: "Erro interno do servidor",
        toast: {
          message: "Erro ao conectar com o servidor",
          type: "error"
        }
      });
    }

    if (results.length === 0) {
      return res.status(401).json({ 
        error: "Email ou senha inválidos",
        toast: {
          message: "Email ou senha inválidos",
          type: "error"
        }
      });
    }

    const usuario = results[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ 
        error: "Email ou senha inválidos",
        toast: {
          message: "Email ou senha inválidos",
          type: "error"
        }
      });
    }

    // Gera código de verificação
    const codigoVerificacao = Math.floor(100000 + Math.random() * 900000).toString();
    
    const updateQuery = "UPDATE usuarios SET codigoVerificacao = ? WHERE id = ?";
    db.query(updateQuery, [codigoVerificacao, usuario.id], async (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ 
          error: "Erro interno do servidor",
          toast: {
            message: "Erro ao gerar código de verificação",
            type: "error"
          }
        });
      }

      try {
        await transporter.sendMail({
          from: '"GameVerse" <no-reply@gameverse.com>',
          to: email,
          subject: 'Código de Verificação - GameVerse',
          html: `
            <h1>Código de Verificação</h1>
            <p>Seu código de verificação é: <strong>${codigoVerificacao}</strong></p>
            <p>Use este código para completar seu login.</p>
          `
        });

        res.status(200).json({
          message: "Código de verificação enviado para seu email",
          requireVerification: true,
          userId: usuario.id,
          toast: {
            message: "Código de verificação enviado para seu email",
            type: "success"
          }
        });
      } catch (emailError) {
        res.status(500).json({ 
          error: "Erro ao enviar código de verificação",
          toast: {
            message: "Erro ao enviar código de verificação",
            type: "error"
          }
        });
      }
    });
  });
});

app.post("/api/redefinir-senha", (req, res) => { // Mantendo o nome do endpoint do seu frontend
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email é obrigatório." });
  }

  const querySelectUser = "SELECT * FROM usuarios WHERE email = ?";
  db.query(querySelectUser, [email], (err, users) => {
    if (err) {
      console.error("Erro ao buscar usuário para redefinição:", err);
      return res.status(500).json({ message: "Erro ao processar sua solicitação." });
    }

    if (users.length === 0) {
      // NÃO informe que o email não foi encontrado por questões de segurança.
      // O frontend já exibe uma mensagem genérica.
      console.log(`Tentativa de redefinição para email não cadastrado: ${email}`);
      return res.status(200).json({ message: "Se o email estiver cadastrado, você receberá um link para redefinir sua senha." });
    }

    const user = users[0];
    const resetToken = crypto.randomBytes(32).toString('hex'); // Token seguro
    const resetTokenExpiration = Date.now() + 3600000; // Expira em 1 hora (em milissegundos)

    const queryUpdateToken = "UPDATE usuarios SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?";
    db.query(queryUpdateToken, [resetToken, new Date(resetTokenExpiration), user.id], async (errUpdate) => {
      if (errUpdate) {
        console.error("Erro ao salvar token de redefinição:", errUpdate);
        return res.status(500).json({ message: "Erro ao processar sua solicitação." });
      }

    
      const resetLink = `http://localhost:3000/resetar-senha-confirmacao/${resetToken}`;

      // Configurações do email
      const mailOptions = {
        from: '"GameVerse Admin" <no-reply@gameverse.com>', // Seu email "de"
        to: user.email,
        subject: 'Redefinição de Senha - GameVerse',
        html: `
          <p>Você solicitou a redefinição de senha para sua conta GameVerse.</p>
          <p>Clique no link abaixo para criar uma nova senha:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>Se você não solicitou isso, por favor, ignore este email. Este link é válido por 1 hora.</p>
        `
      };

      try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email enviado: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // Para Ethereal

        console.log(`Link de redefinição para ${user.email}: ${resetLink}`);


        res.status(200).json({ message: "Se o email estiver cadastrado, você receberá um link para redefinir sua senha." });
      } catch (emailError) {
        console.error("Erro ao enviar email de redefinição:", emailError);
        // Mesmo que o email falhe, o token está no banco.
        // Poderia tentar reenviar ou logar, mas para o usuário, a resposta pode ser a mesma.
        res.status(500).json({ message: "Erro ao enviar email de redefinição. Tente novamente mais tarde." });
      }
    });
  });
});

app.post("/api/resetar-senha-confirmacao/:token", async (req, res) => {
  const { token } = req.params;
  const { novaSenha } = req.body;

  if (!novaSenha) {
    return res.status(400).json({ message: "Nova senha é obrigatória." });
  }
  if (novaSenha.length < 6) { // Exemplo de validação de senha
    return res.status(400).json({ message: "A nova senha deve ter pelo menos 6 caracteres." });
  }


  const queryFindUserByToken = "SELECT * FROM usuarios WHERE reset_password_token = ? AND reset_password_expires > NOW()";
  db.query(queryFindUserByToken, [token], async (err, users) => {
    if (err) {
      console.error("Erro ao buscar usuário por token:", err);
      return res.status(500).json({ message: "Erro ao processar sua solicitação." });
    }

    if (users.length === 0) {
      return res.status(400).json({ message: "Token inválido ou expirado." });
    }

    const user = users[0];

    try {
      const hashedNewPassword = await bcrypt.hash(novaSenha, 10);
      const queryUpdatePassword = "UPDATE usuarios SET senha = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?";

      db.query(queryUpdatePassword, [hashedNewPassword, user.id], (errUpdate) => {
        if (errUpdate) {
          console.error("Erro ao atualizar senha:", errUpdate);
          return res.status(500).json({ message: "Erro ao redefinir sua senha." });
        }
        res.status(200).json({ message: "Senha redefinida com sucesso!" });
      });
    } catch (hashError) {
      console.error("Erro ao hashear nova senha:", hashError);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
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

app.put("/api/jogos/:id", authenticate, upload.single('imagem'), (req, res) => {
  const { id } = req.params;
  const { nome, ano, genero } = req.body;

  let sql = "UPDATE jogos SET nome = ?, ano = ?, genero = ?";
  let values = [nome, ano, genero];

  if (req.file) {
    sql += ", imagem = ?";
    values.push(`/uploads/${req.file.filename}`);
  }

  sql += " WHERE id = ?";
  values.push(id);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Erro ao atualizar jogo:", err);
      return res.status(500).json({ 
        error: "Erro ao atualizar jogo",
        toast: {
          message: "Erro ao atualizar jogo",
          type: "error"
        }
      });
    }

    // Após atualizar, buscar o jogo atualizado
    const selectSql = `
      SELECT j.*, GROUP_CONCAT(c.nome) as categorias 
      FROM jogos j
      LEFT JOIN jogo_categorias jc ON j.id = jc.jogo_id
      LEFT JOIN categorias c ON jc.categoria_id = c.id
      WHERE j.id = ?
      GROUP BY j.id
    `;

    db.query(selectSql, [id], (err, rows) => {
      if (err) {
        console.error("Erro ao buscar jogo atualizado:", err);
        return res.status(500).json({
          error: "Erro ao buscar jogo atualizado",
          toast: {
            message: "Erro ao buscar jogo atualizado",
            type: "error"
          }
        });
      }

      const jogoAtualizado = {
        ...rows[0],
        categorias: rows[0].categorias ? rows[0].categorias.split(',') : []
      };

      res.json({
        ...jogoAtualizado,
        toast: {
          message: "Jogo atualizado com sucesso!",
          type: "success"
        }
      });
    });
  });
});

// Add category to game - simple and direct
app.post("/api/jogos/:id/categorias", authenticate, (req, res) => {
  const { id } = req.params;
  const { categorias } = req.body;

  if (!categorias || !Array.isArray(categorias)) {
    return res.status(400).json({ error: "Categorias inválidas" });
  }

  const sql = "INSERT INTO jogo_categorias (jogo_id, categoria_id) VALUES (?, ?)";
  
  db.query(sql, [id, categorias[0]], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao adicionar categoria" });
    }

    res.json({ message: "Categoria adicionada com sucesso" });
  });
});

app.delete("/api/jogos/:id", authenticate, (req, res) => {
  const { id } = req.params;
  
  // Se você deseja que qualquer usuário autenticado possa excluir
  const query = "DELETE FROM jogos WHERE id = ?";
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erro ao excluir jogo:", err);
      return res.status(500).json({ 
        error: "Erro ao deletar jogo",
        toast: {
          message: "Erro ao excluir jogo",
          type: "error"
        }
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: "Jogo não encontrado",
        toast: {
          message: "Jogo não encontrado",
          type: "error"
        }
      });
    }

    res.status(200).json({ 
      message: "Jogo deletado com sucesso",
      toast: {
        message: "Jogo excluído com sucesso!",
        type: "success"
      }
    });
  });
});

// Adicione estes endpoints após os existentes

// Listar todos os usuários
app.get("/api/usuarios", authenticate, (req, res) => {
  const query = "SELECT id, nome, email FROM usuarios";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar usuários" });
    res.json(results);
  });
});

// Deletar usuário
app.delete("/api/usuarios/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM usuarios WHERE id = ?";
  
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erro ao deletar usuário" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Usuário não encontrado" });
    res.status(200).json({ message: "Usuário deletado com sucesso" });
  });
});

// Atualizar usuário
app.put("/api/usuarios/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const { nome, email, senha } = req.body;

  // Start with basic fields
  let sql = "UPDATE usuarios SET nome = ?, email = ?";
  let values = [nome, email];

  // If password is provided, update it too
  if (senha && senha.trim() !== '') {
    sql += ", senha = ?";
    const hashedPassword = bcrypt.hashSync(senha, 10);
    values.push(hashedPassword);
  }

  sql += " WHERE id = ?";
  values.push(id);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Erro ao atualizar usuário:", err);
      return res.status(500).json({ 
        error: "Erro ao atualizar usuário",
        toast: {
          message: "Erro ao atualizar usuário",
          type: "error"
        }
      });
    }

    res.json({ 
      message: "Usuário atualizado com sucesso",
      toast: {
        message: "Usuário atualizado com sucesso!",
        type: "success"
      }
    });
  });
});

app.post('/api/verificar-codigo', async (req, res) => {
  const { email, codigo } = req.body;  // Espera email e codigo

  const query = "SELECT * FROM usuarios WHERE email = ? AND codigoVerificacao = ?";
  db.query(query, [email, codigo], async (err, results) => {
    if (err) {
      console.error("Erro ao verificar código:", err);
      return res.status(500).json({ 
        message: 'Erro ao verificar código',
        toast: {
          message: 'Erro ao verificar código',
          type: 'error'
        }
      });
    }

    if (results.length === 0) {
      return res.status(400).json({ 
        message: 'Código inválido',
        toast: {
          message: 'Código inválido',
          type: 'error'
        }
      });
    }

    const usuario = results[0];
    const updateQuery = "UPDATE usuarios SET verificado = true, codigoVerificacao = NULL WHERE id = ?";
    
    db.query(updateQuery, [usuario.id], (updateErr) => {
      if (updateErr) {
        console.error("Erro ao atualizar verificação:", updateErr);
        return res.status(500).json({ 
          message: 'Erro ao verificar código',
          toast: {
            message: 'Erro ao verificar código',
            type: 'error'
          }
        });
      }

      const token = generateToken(usuario.id, usuario.email);
      
      res.status(200).json({
        message: 'Email verificado com sucesso',
        token,
        id: usuario.id,
        toast: {
          message: 'Email verificado com sucesso',
          type: 'success'
        }
      });
    });
  });
});

// Listar todas as categorias
// Endpoint para buscar categorias (filtradas por usuário)
app.get("/api/categorias", authenticate, (req, res) => {
  const userId = req.userId; // ID do usuário autenticado

  const query = "SELECT * FROM categorias WHERE userId = ? ORDER BY nome";
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Erro ao buscar categorias:", err);
      return res.status(500).json({ error: "Erro ao buscar categorias" });
    }
    
    res.json(results);
  });
});

// Endpoint para criar uma categoria
app.post("/api/categorias", authenticate, (req, res) => {
  const { nome } = req.body;
  const userId = req.userId; // ID do usuário autenticado
  
  if (!nome) {
    return res.status(400).json({ error: "Nome da categoria não fornecido" });
  }

  // Verificar se a categoria já existe para este usuário
  const checkQuery = "SELECT * FROM categorias WHERE nome = ? AND userId = ?";
  db.query(checkQuery, [nome, userId], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Erro ao verificar categoria:", checkErr);
      return res.status(500).json({ error: "Erro interno" });
    }
    
    if (checkResults.length > 0) {
      return res.status(409).json({ error: "Categoria já existe" });
    }
    
    // Inserir nova categoria associada ao usuário
    const insertQuery = "INSERT INTO categorias (nome, userId) VALUES (?, ?)";
    db.query(insertQuery, [nome, userId], (insertErr, insertResult) => {
      if (insertErr) {
        console.error("Erro ao criar categoria:", insertErr);
        return res.status(500).json({ error: "Erro ao criar categoria" });
      }
      
      res.status(201).json({
        id: insertResult.insertId,
        nome: nome,
        userId: userId,
        message: "Categoria criada com sucesso"
      });
    });
  });
});

// Criar categoria
app.post("/api/categorias", authenticate, async (req, res) => {
  const { nome } = req.body;
  
  if (!nome) {
    return res.status(400).json({
      error: "Nome é obrigatório",
      toast: {
        message: "Nome da categoria é obrigatório",
        type: "error"
      }
    });
  }

  const query = "INSERT INTO categorias (nome) VALUES (?)";
  db.query(query, [nome], (err, result) => {
    if (err) {
      console.error("Erro ao criar categoria:", err);
      return res.status(500).json({
        error: "Erro ao criar categoria",
        toast: {
          message: "Erro ao criar categoria",
          type: "error"
        }
      });
    }

    res.status(201).json({
      id: result.insertId,
      nome,
      toast: {
        message: "Categoria criada com sucesso!",
        type: "success"
      }
    });
  });
});

// Atualizar categoria
app.put("/api/categorias/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({
      error: "Nome é obrigatório",
      toast: {
        message: "Nome da categoria é obrigatório",
        type: "error"
      }
    });
  }

  const query = "UPDATE categorias SET nome = ? WHERE id = ?";
  db.query(query, [nome, id], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar categoria:", err);
      return res.status(500).json({
        error: "Erro ao atualizar categoria",
        toast: {
          message: "Erro ao atualizar categoria",
          type: "error"
        }
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Categoria não encontrada",
        toast: {
          message: "Categoria não encontrada",
          type: "error"
        }
      });
    }

    res.json({
      message: "Categoria atualizada com sucesso",
      toast: {
        message: "Categoria atualizada com sucesso!",
        type: "success"
      }
    });
  });
});

// Deletar categoria
app.delete("/api/categorias/:id", authenticate, (req, res) => {
  const { id } = req.params;

  // Removi o filtro por usuario_id pois não existe na tabela
  const query = "DELETE FROM categorias WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erro ao excluir categoria:", err);
      return res.status(500).json({
        error: "Erro ao excluir categoria",
        toast: {
          message: "Erro ao excluir categoria",
          type: "error"
        }
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Categoria não encontrada",
        toast: {
          message: "Categoria não encontrada",
          type: "error"
        }
      });
    }

    res.json({
      message: "Categoria excluída com sucesso",
      toast: {
        message: "Categoria excluída com sucesso!",
        type: "success"
      }
    });
  });
});

// Endpoint para buscar categoria pelo nome
app.get("/api/categorias/nome/:nome", authenticate, (req, res) => {
  const { nome } = req.params;
  
  const query = "SELECT * FROM categorias WHERE nome = ?";
  
  db.query(query, [nome], (err, results) => {
    if (err) {
      console.error("Erro ao buscar categoria por nome:", err);
      return res.status(500).json({ error: "Erro ao buscar categoria" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }
    
    res.json(results[0]);
  });
});

// Endpoint para buscar categoria por nome com query parameter
app.get("/api/categorias/busca", authenticate, (req, res) => {
  const { nome } = req.query;
  
  if (!nome) {
    return res.status(400).json({ error: "Nome de categoria não fornecido" });
  }
  
  console.log(`[API] Buscando categoria com nome: "${nome}"`);
  
  const query = "SELECT * FROM categorias WHERE nome = ?";
  
  db.query(query, [nome], (err, results) => {
    if (err) {
      console.error("Erro ao buscar categoria por nome:", err);
      return res.status(500).json({ error: "Erro ao buscar categoria" });
    }
    
    if (results.length === 0) {
      console.log(`[API] Categoria "${nome}" não encontrada`);
      return res.status(404).json({ error: "Categoria não encontrada" });
    }
    
    console.log(`[API] Categoria encontrada com ID: ${results[0].id}`);
    res.json(results[0]);
  });
});

// Buscar jogos por categoria
app.get("/api/categorias/:id/jogos", authenticate, async (req, res) => {
  const { id } = req.params;
  
  const conn = await db.getConnection();
  try {
    const [jogos] = await conn.query(`
      SELECT j.*, GROUP_CONCAT(c.nome) as categorias
      FROM jogos j
      INNER JOIN jogo_categorias jc ON j.id = jc.jogo_id
      INNER JOIN categorias c ON jc.categoria_id = c.id
      WHERE jc.categoria_id = ?
      GROUP BY j.id
    `, [id]);

    res.json(jogos.map(jogo => ({
      ...jogo,
      categorias: jogo.categorias ? jogo.categorias.split(',') : []
    })));
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar jogos da categoria" });
  } finally {
    conn.release();
  }
});

// Adicione esta rota para remover categorias de um jogo

app.delete("/api/jogos/:id/categorias/:nome", authenticate, (req, res) => {
  const { id, nome } = req.params;
  
  // Primeiro, encontre o ID da categoria pelo nome
  const findCategoriaQuery = "SELECT id FROM categorias WHERE nome = ?";
  
  db.query(findCategoriaQuery, [nome], (err, results) => {
    if (err) {
      console.error("Erro ao buscar categoria:", err);
      return res.status(500).json({ error: "Erro ao remover categoria" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }
    
    const categoriaId = results[0].id;
    
    // Remover a relação entre jogo e categoria
    const deleteQuery = "DELETE FROM jogo_categorias WHERE jogo_id = ? AND categoria_id = ?";
    
    db.query(deleteQuery, [id, categoriaId], (err, result) => {
      if (err) {
        console.error("Erro ao remover categoria do jogo:", err);
        return res.status(500).json({ error: "Erro ao remover categoria do jogo" });
      }
      
      res.status(200).json({ message: "Categoria removida com sucesso" });
    });
  });
});

// Endpoint para adicionar categoria a um jogo por nome
app.post("/api/jogos/:id/categorias/nome", authenticate, (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  const userId = req.userId;
  
  if (!nome) {
    return res.status(400).json({ error: "Nome da categoria não fornecido" });
  }
  
  // Buscar categoria do usuário por nome
  const checkCategoriaQuery = "SELECT id FROM categorias WHERE nome = ? AND userId = ?";
  db.query(checkCategoriaQuery, [nome, userId], (err, results) => {
    if (err) {
      console.error("Erro ao verificar categoria:", err);
      return res.status(500).json({ error: "Erro ao verificar categoria" });
    }
    
    let categoriaId;
    
    // Se a categoria não existe, criar
    if (results.length === 0) {
      const createCategoriaQuery = "INSERT INTO categorias (nome, userId) VALUES (?, ?)";
      db.query(createCategoriaQuery, [nome, userId], (createErr, createResult) => {
        if (createErr) {
          console.error("Erro ao criar categoria:", createErr);
          return res.status(500).json({ error: "Erro ao criar categoria" });
        }
        
        categoriaId = createResult.insertId;
        associarCategoria();
      });
    } else {
      // A categoria já existe
      categoriaId = results[0].id;
      associarCategoria();
    }
    
    // Função para associar a categoria ao jogo
    function associarCategoria() {
      // Verificar se a associação já existe
      const checkAssocQuery = "SELECT * FROM jogo_categorias WHERE jogo_id = ? AND categoria_id = ?";
      db.query(checkAssocQuery, [parseInt(id), categoriaId], (checkAssocErr, checkAssocResult) => {
        if (checkAssocErr) {
          console.error("Erro ao verificar associação:", checkAssocErr);
          return res.status(500).json({ error: "Erro ao verificar associação" });
        }
        
        // Se a associação já existe, não precisa fazer nada
        if (checkAssocResult.length > 0) {
          return res.status(200).json({ message: "Categoria já associada ao jogo" });
        }
        
        // Criar a associação
        const addAssocQuery = "INSERT INTO jogo_categorias (jogo_id, categoria_id) VALUES (?, ?)";
        db.query(addAssocQuery, [parseInt(id), categoriaId], (addAssocErr) => {
          if (addAssocErr) {
            console.error("Erro ao associar categoria:", addAssocErr);
            return res.status(500).json({ error: "Erro ao associar categoria ao jogo" });
          }
          
          res.status(200).json({ 
            message: "Categoria adicionada com sucesso",
            categoriaId,
            nome
          });
        });
      });
    }
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
