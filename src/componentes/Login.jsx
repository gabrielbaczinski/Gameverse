// componentes/Login.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { IonIcon } from '@ionic/react';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import ToastAlert from './Toast';
import './style.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [codigo, setCodigo] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Adicione esta linha
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const { login: contextLogin, isAuthenticated } = useContext(AuthContext);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'error'  // should be either 'success' or 'error'
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/catalogo');
    }
  }, [isAuthenticated, navigate]);

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (showVerification) {
      try {
        const response = await fetch('http://localhost:5000/api/verificar-codigo', { // URL corrigida
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, codigo }), // Usando email em vez de userId
        });

        const data = await response.json();

        if (response.ok && data.token) {
          contextLogin(data.token, data.id);
          setToast({
            show: true,
            message: data.toast.message,
            type: data.toast.type
          });
          setTimeout(() => navigate('/catalogo'), 2000);
        } else {
          setToast({
            show: true,
            message: data.toast.message,
            type: data.toast.type
          });
        }
      } catch (error) {
        console.error('Erro durante verificação:', error);
        setToast({
          show: true,
          message: 'Erro ao verificar código',
          type: 'error'
        });
      }
    } else {
      // Faz login inicial
      try {
        const response = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha }),
        });

        const data = await response.json();
        console.log('Resposta do servidor:', data); // Debug

        if (response.ok) {
          if (data.requireVerification) {
            setUserId(data.userId);
            setShowVerification(true);
            setToast({
              show: true,
              message: data.message,
              type: 'info'
            });
          } else if (data.token) {
            contextLogin(data.token, data.id);
            setToast({
              show: true,
              message: 'Login realizado com sucesso!',
              type: 'success'
            });
            setTimeout(() => navigate('/catalogo'), 2000);
          }
        } else {
          setToast({
            show: true,
            message: data.toast?.message || 'Erro ao fazer login',
            type: data.toast?.type || 'error'
          });
        }
      } catch (error) {
        console.error('Erro durante login:', error);
        setToast({
          show: true,
          message: 'Erro ao conectar com o servidor',
          type: 'error'
        });
      }
    }
  };

  return (
    <>
      <ToastAlert 
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      <div className="wrapper">
        <div className="login-box text-center">
          <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            {showVerification ? (
              <div className="element-box">
                <div className="input-box">
                  <input
                    type="text"
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder=" "
                    maxLength={6}
                    style={{ color: "#fff", background: "transparent" }}
                  />
                  <label>Código de Verificação</label>
                </div>
              </div>
            ) : (
              <>
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

                <div className="element-box">
                  <div className="input-box password-input">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder=" "
                      style={{ color: "#fff", background: "transparent", paddingRight: "2.5rem" }}
                    />
                    <label>Senha</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle-btn"
                    >
                      <IonIcon 
                        icon={showPassword ? eyeOffOutline : eyeOutline} 
                        className="w-5 h-5"
                        style={{ color: '#fff' }}
                      />
                    </button>
                  </div>
                </div>
                <div className="element-box flex justify-between">
                  <Link to="/redefinirsenha" className="text-white underline">Esqueceu a senha?</Link>
                  <Link to="/cadastro" className="text-white underline">Cadastre-se</Link>
                </div>
              </>
            )}

            <div className="element-box mt-5">
              <button
                type="submit"
                className="w-40 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {showVerification ? 'Verificar Código' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
