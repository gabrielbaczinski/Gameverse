// componentes/RedefinirSenha.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../login.css'; // Supondo que você reutilize o mesmo CSS

function RedefinirSenha() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/redefinir-senha', { // Endpoint para solicitar redefinição
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert('Se o email estiver cadastrado, você receberá um link para redefinir sua senha.');
        navigate('/login'); // Redireciona para o login após a solicitação
      } else {
        const errorData = await response.json().catch(() => null); // Tenta pegar mais detalhes do erro
        alert(errorData?.message || 'Não foi possível processar sua solicitação. Tente novamente.');
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
          <h2>Redefinir Senha</h2>
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
            <div className="links">
              <Link to="/login">Voltar para o Login</Link>
              <Link to="/cadastro">Cadastre-se</Link>
            </div>
            <div className="inputBox">
              <input type="submit" value="Enviar Link de Redefinição" />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default RedefinirSenha;