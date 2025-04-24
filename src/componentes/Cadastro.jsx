import React, { useState } from "react";
import "./../componentes/style.css"; // ajuste o caminho conforme a sua estrutura
import { IonIcon } from '@ionic/react';
import { person, mail, lockClosed } from 'ionicons/icons';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        alert('Usuário cadastrado com sucesso!');
        setNome('');
        setEmail('');
        setSenha('');
      } else {
        alert('Erro ao cadastrar usuário.');
      }
    } catch (error) {
      alert('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="wrapper1">
      <div className="login-box">
        <form onSubmit={handleSubmit}>
          <h2>Cadastro</h2>

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
