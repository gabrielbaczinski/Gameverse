// componentes/ResetarSenhaConfirmacao.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ToastAlert from '../componentes/Toast'; // Update import path
import '../componentes/style.css';

function ResetarSenhaConfirmacao() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'error'
  });
  const { token } = useParams();
  const navigate = useNavigate();

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (novaSenha !== confirmarNovaSenha) {
      showToast('As senhas não coincidem.');
      return;
    }
    if (novaSenha.length < 6) {
      showToast('A nova senha deve ter pelo menos 6 caracteres.');
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
        showToast(data.message + " Você será redirecionado para o login em breve.", 'success');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        showToast(data.message || 'Não foi possível redefinir a senha. O link pode ter expirado.');
      }
    } catch (error) {
      showToast('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="wrapper2">
      <div className="login-box text-center">
        <form onSubmit={handleSubmit}>
          <h2>Redefinir sua Senha</h2>

          <ToastAlert 
            show={toast.show}
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />

          <div className="element-box">
            <div className="input-box">
              <input
                type="password"
                required
                placeholder=" "
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                style={{ color: "#fff", background: "transparent" }}
              />
              <label>Nova Senha</label>
            </div>
          </div>
          <div className="element-box">
            <div className="input-box">
              <input
                type="password"
                required
                placeholder=" "
                value={confirmarNovaSenha}
                onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                style={{ color: "#fff", background: "transparent" }}
              />
              <label>Confirmar Nova Senha</label>
            </div>
          </div>

          <div className="element-box flex justify-between">
            <button
              type="button"
              className="text-white underline bg-transparent border-none"
              style={{ background: "transparent", boxShadow: "none" }}
              onClick={() => navigate('/login')}
            >
              Voltar para o Login
            </button>
            <button
              type="button"
              className="text-white underline bg-transparent border-none"
              style={{ background: "transparent", boxShadow: "none" }}
              onClick={() => navigate('/cadastro')}
            >
              Cadastre-se
            </button>
          </div>

          <div className="element-box">
            <button
              type="submit"
              className="w-40 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Redefinir Senha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetarSenhaConfirmacao;