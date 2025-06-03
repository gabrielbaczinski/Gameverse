// componentes/ResetarSenhaConfirmacao.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../login.css'; // Reutilize ou crie um CSS específico

function ResetarSenhaConfirmacao() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const { token } = useParams(); // Pega o token da URL
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (novaSenha !== confirmarNovaSenha) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/resetar-senha-confirmacao/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novaSenha }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem(data.message + " Você será redirecionado para o login em breve.");
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setErro(data.message || 'Não foi possível redefinir a senha. O link pode ter expirado.');
      }
    } catch (error) {
      setErro('Erro de conexão com o servidor.');
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
          <h2>Redefinir sua Senha</h2>
          <form className="form" onSubmit={handleSubmit}>
            <div className="inputBox">
              <input
                type="password"
                required
                placeholder=" "
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />
              <i>Nova Senha</i>
            </div>
            <div className="inputBox">
              <input
                type="password"
                required
                placeholder=" "
                value={confirmarNovaSenha}
                onChange={(e) => setConfirmarNovaSenha(e.target.value)}
              />
              <i>Confirmar Nova Senha</i>
            </div>
            {erro && <p style={{ color: 'red', textAlign: 'center' }}>{erro}</p>}
            {mensagem && <p style={{ color: 'green', textAlign: 'center' }}>{mensagem}</p>}
            <div className="inputBox">
              <input type="submit" value="Redefinir Senha" />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ResetarSenhaConfirmacao;