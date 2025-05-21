import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../login.css'; // usar o CSS do login para manter estilo igual

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      setMensagemErro('As senhas não coincidem!');
      setMensagemSucesso('');
      return;
    }

    const user = { nome, email, senha };

    try {
      const response = await fetch('http://localhost:5000/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        setMensagemSucesso('Usuário cadastrado com sucesso!');
        setMensagemErro('');
        setNome('');
        setEmail('');
        setSenha('');
        setConfirmarSenha('');
      } else {
        const data = await response.json();
        setMensagemErro(data.message || 'Erro ao cadastrar usuário.');
        setMensagemSucesso('');
      }
    } catch (error) {
      setMensagemErro('Erro de conexão com o servidor.');
      setMensagemSucesso('');
    }
  };

  return (
    <section>
      {[...Array(200)].map((_, i) => (
        <span key={i}></span>
      ))}

      <div className="signin">
        <div className="content">
          <h2>Cadastro</h2>

          {mensagemErro && (
            <div style={{ color: 'red', marginBottom: '10px' }}>{mensagemErro}</div>
          )}
          {mensagemSucesso && (
            <div style={{ color: 'lime', marginBottom: '10px' }}>{mensagemSucesso}</div>
          )}

          <form className="form" onSubmit={handleSubmit}>
            <div className="inputBox">
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <i>Nome</i>
            </div>

            <div className="inputBox">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <i>Email</i>
            </div>

            <div className="inputBox">
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <i>Senha</i>
            </div>

            <div className="inputBox">
              <input
                type="password"
                required
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
              <i>Confirmar Senha</i>
            </div>

            <div className="inputBox">
              <input type="submit" value="Cadastrar" />
            </div>

            <div className="links" style={{ justifyContent: 'center' }}>
              <Link to="/login">Já tem uma conta? Entrar</Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Cadastro;
