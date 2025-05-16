import React, { useState } from "react";
import "./../componentes/style.css"; // ajuste o caminho conforme a sua estrutura
import { IonIcon } from '@ionic/react';
import { person, mail, lockClosed } from 'ionicons/icons';

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
      return;
    }

    const user = {
      nome,
      email,
      senha,
    };

    try {
      const response = await fetch('http://localhost:5000/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setMensagemErro(data.message || 'Erro ao cadastrar usuário.');
        } else {
          setMensagemErro('Erro ao cadastrar usuário. Resposta inválida do servidor.');
        }
        setMensagemSucesso('');
      }
      if (response.status === 400) {
        // Erro de validação, mostre uma mensagem mais detalhada
        const errorData = await response.json();
        setMensagemErro(errorData.message || 'Erro na validação dos dados.');
      } else {
        // Outros tipos de erro
        setMensagemErro('Erro ao cadastrar usuário.');
      }
      
    }
    catch (error) {
      setMensagemErro('Erro de conexão com o servidor.');
      setMensagemSucesso('');
    }      
  };

  return (
    <div className="wrapper1">
      <div className="login-box">
        <form onSubmit={handleSubmit}>
          <h2>Cadastro</h2>

          {mensagemErro && <div className="erro">{mensagemErro}</div>}
          {mensagemSucesso && <div className="sucesso">{mensagemSucesso}</div>}

          <div className="input-box">
            <span className="icon">
              <IonIcon icon={person} />
            </span>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <label>Nome</label>
          </div>

          <div className="input-box">
            <span className="icon">
              <IonIcon icon={mail} />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email</label>
          </div>

          <div className="input-box">
            <span className="icon">
              <IonIcon icon={lockClosed} />
            </span>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <label>Senha</label>
          </div>

          <div className="input-box">
            <span className="icon">
              <IonIcon icon={lockClosed} />
            </span>
            <input
              type="password"
              required
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />
            <label>Confirmar Senha</label>
          </div>

          <button type="submit">Cadastrar</button>

          <div className="register-link">
            <p>Já tem uma conta? <a href="#">Entrar</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Cadastro;
