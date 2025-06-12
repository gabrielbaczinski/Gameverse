// componentes/RedefinirSenha.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ToastAlert from '../componentes/Toast'; // Update import path
import '../componentes/style.css';

function RedefinirSenha() {
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'error'
  });
  const navigate = useNavigate();

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        showToast('Se o email estiver cadastrado, você receberá um link para redefinir sua senha.', 'success');
        setTimeout(() => navigate('/login'), 2500);
      } else {
        const errorData = await response.json().catch(() => null);
        showToast(errorData?.message || 'Não foi possível processar sua solicitação. Tente novamente.');
      }
    } catch (error) {
      showToast('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="wrapper2">
      <div className="login-box text-center">
        <form onSubmit={handleSubmit}>
          <h2>Redefinir Senha</h2>

          <ToastAlert 
            show={toast.show}
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />

          <div className="element-box">
            <div className="input-box">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                style={{ color: "#fff", background: "transparent" }}
              />
              <label>Email</label>
            </div>
          </div>

          <div className="element-box flex justify-between">
            <Link to="/login" className="text-white underline">Voltar para o Login</Link>
            <Link to="/cadastro" className="text-white underline">Cadastre-se</Link>
          </div>

          <div className="element-box">
            <button
              type="submit"
              className="w-40 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Enviar Link de Redefinição
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RedefinirSenha;