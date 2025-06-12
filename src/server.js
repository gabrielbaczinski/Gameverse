const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs'); // Para hashear senhas
const crypto = require('crypto');   // Para gerar tokens de redefinição
const nodemailer = require('nodemailer'); // Para enviar emails
const multer = require('multer'); // Para fazer upload de arquivos

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
  const query = "SELECT * FROM jogos WHERE userId = ?";
  db.query(query, [req.userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar jogos" });
    res.json(results);
  });
});

// Inserir novo jogo
app.post("/api/jogos", authenticate, upload.single('imagem'), async (req, res) => {
  const { titulo, descricao, categorias } = req.body;
  const imagemUrl = req.file ? req.file.filename : null;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Inserir jogo
    const [result] = await conn.query(
      "INSERT INTO jogos (titulo, descricao, imagem_url, usuario_id) VALUES (?, ?, ?, ?)",
      [titulo, descricao, imagemUrl, req.user.id]
    );

    const jogoId = result.insertId;

    // Inserir categorias do jogo
    if (categorias) {
      const categoriasArray = JSON.parse(categorias);
      for (const categoriaId of categoriasArray) {
        await conn.query(
          "INSERT INTO jogo_categorias (jogo_id, categoria_id) VALUES (?, ?)",
          [jogoId, categoriaId]
        );
      }
    }

    await conn.commit();
    res.status(201).json({
      message: "Jogo criado com sucesso",
      toast: {
        message: "Jogo criado com sucesso!",
        type: "success"
      }
    });
  } catch (error) {
    await conn.rollback();
    console.error("Erro ao criar jogo:", error);
    res.status(500).json({
      error: "Erro ao criar jogo",
      toast: {
        message: "Erro ao criar jogo",
        type: "error"
      }
    });
  } finally {
    conn.release();
  }
});

// Endpoint para buscar jogos com suas categorias
app.get("/api/jogos", authenticate, async (req, res) => {
  try {
    const query = `
      SELECT 
        j.*,
        GROUP_CONCAT(DISTINCT c.nome) as categorias,
        GROUP_CONCAT(DISTINCT c.id) as categoria_ids
      FROM jogos j
      LEFT JOIN jogo_categorias jc ON j.id = jc.jogo_id
      LEFT JOIN categorias c ON jc.categoria_id = c.id
      GROUP BY j.id
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Erro ao buscar jogos:", err);
        return res.status(500).json({ error: "Erro ao buscar jogos" });
      }

      const jogosFormatados = results.map(jogo => ({
        ...jogo,
        categorias: jogo.categorias ? jogo.categorias.split(',') : [],
        categoria_ids: jogo.categoria_ids ? jogo.categoria_ids.split(',').map(Number) : []
      }));

      res.json(jogosFormatados);
    });
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

app.put("/api/jogos/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const { nome, ano, genero, imagem } = req.body;
  const userId = req.userId;

  const query = `
    UPDATE jogos 
    SET nome = ?, ano = ?, genero = ?, imagem = ?
    WHERE id = ? AND userId = ?
  `;

  db.query(query, [nome, ano, genero, imagem, id, userId], (err, result) => {
    if (err) return res.status(500).json({ error: "Erro ao atualizar jogo" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Jogo não encontrado" });

    const selectQuery = "SELECT * FROM jogos WHERE id = ? AND userId = ?";
    db.query(selectQuery, [id, userId], (err, rows) => {
      if (err) return res.status(500).json({ error: "Erro ao buscar jogo atualizado" });
      res.status(200).json(rows[0]);
    });
  });
});

app.delete("/api/jogos/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const query = "DELETE FROM jogos WHERE id = ? AND userId = ?";

  db.query(query, [id, userId], (err, result) => {
    if (err) return res.status(500).json({ error: "Erro ao deletar jogo" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Jogo não encontrado" });

    res.status(200).json({ message: "Jogo deletado com sucesso" });
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
  const { nome, email } = req.body;
  
  const query = "UPDATE usuarios SET nome = ?, email = ? WHERE id = ?";
  db.query(query, [nome, email, id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erro ao atualizar usuário" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Usuário não encontrado" });
    
    // Retorna os dados atualizados
    const selectQuery = "SELECT id, nome, email FROM usuarios WHERE id = ?";
    db.query(selectQuery, [id], (err, rows) => {
      if (err) return res.status(500).json({ error: "Erro ao buscar usuário atualizado" });
      res.status(200).json(rows[0]);
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
app.get("/api/categorias", authenticate, (req, res) => {
  const query = "SELECT * FROM categorias ORDER BY nome";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar categorias:", err);
      return res.status(500).json({ 
        error: "Erro ao buscar categorias",
        toast: {
          message: "Erro ao carregar categorias",
          type: "error"
        }
      });
    }
    res.json(results);
  });
});

// Criar categoria
app.post("/api/categorias", authenticate, (req, res) => {
  const { nome, descricao } = req.body;

  if (!nome) {
    return res.status(400).json({
      error: "Nome é obrigatório",
      toast: {
        message: "Nome da categoria é obrigatório",
        type: "error"
      }
    });
  }

  const query = "INSERT INTO categorias (nome, descricao) VALUES (?, ?)";
  db.query(query, [nome, descricao], (err, result) => {
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
      descricao,
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
  const { nome, descricao } = req.body;

  const query = "UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?";
  db.query(query, [nome, descricao, id], (err, result) => {
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

  const query = "DELETE FROM categorias WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erro ao deletar categoria:", err);
      return res.status(500).json({
        error: "Erro ao deletar categoria",
        toast: {
          message: "Erro ao deletar categoria",
          type: "error"
        }
      });
    }

    res.json({
      message: "Categoria deletada com sucesso",
      toast: {
        message: "Categoria deletada com sucesso!",
        type: "success"
      }
    });
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
