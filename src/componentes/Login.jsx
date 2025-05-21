// componentes/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import '../login.css'; // Supondo que você tenha o CSS baseado no "Hacker Login Form"

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = { email, senha };

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token && data.id) {
          login(data.token, data.id);
          navigate('/catalogo');
        } else {
          alert('Token ou ID não recebido do servidor.');
        }
      } else {
        alert('Email ou senha inválidos.');
      }
    } catch (error) {
      alert('Erro de conexão com o servidor.');
      console.error(error);
    }
  };

  return (
    <section>
      {[...Array(200)].map((_, i) => (
        <span key={i}></span>
      ))}

      <div className="signin">
        <div className="content">
          <h2>Login</h2>
          <form className="form" onSubmit={handleSubmit}>
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
              <i>Password</i>
            </div>
            <div className="links">
              <a href="#">Esqueceu a senha?</a>
              <Link to="/cadastro">Cadastre-se</Link>
            </div>
            <div className="inputBox">
              <input type="submit" value="Login" />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Login;
