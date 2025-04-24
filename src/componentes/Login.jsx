import React, { useState } from "react";
import "./../componentes/style.css";
import { IonIcon } from '@ionic/react';
import { mail, lockClosed } from 'ionicons/icons';
import { useNavigate } from "react-router-dom";


function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = { email, senha };

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Login bem-sucedido!');
        console.log('Usuário logado:', data);
        setEmail('');
        setSenha('');
        navigate('/catalogo');

      } else {
        alert('Email ou senha inválidos.');
      }
    } catch (error) {
      alert('Erro de conexão com o servidor.');
      console.error(error);
    }
  };

  return (
    <div className="wrapper">
      <div className="login-box">
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>

          <div className="input-box">
            <span className="icon">
              <IonIcon icon={mail} />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)
              }
              
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
            <label>Password</label>
          </div>

          <div className="remember-forgot">
            <label><input type="checkbox" /> Remember me</label>
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit">Login</button>

          <div className="register-link">
            <p>Don't have an account? <a href="#">Register</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
