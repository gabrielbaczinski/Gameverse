// componentes/ResetarSenhaConfirmacao.jsx
import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import ToastAlert from '../componentes/Toast';
import axios from 'axios';
import '../componentes/style.css';

function ResetarSenhaConfirmacao() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'error'
  });
  const { token } = useParams();
  const navigate = useNavigate();

  // Verificações de força da senha
  const passwordStrength = {
    checks: {
      length: novaSenha.length >= 8,
      uppercase: /[A-Z]/.test(novaSenha),
      lowercase: /[a-z]/.test(novaSenha),
      number: /\d/.test(novaSenha),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(novaSenha)
    }
  };

  const handlePasswordChange = (e) => {
    setNovaSenha(e.target.value);
  };

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
    if (!Object.values(passwordStrength.checks).every(Boolean)) {
      showToast('A senha não atende aos critérios de segurança.');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/resetar-senha-confirmacao/${token}`, {
        novaSenha
      });

      if (response.data.success) {
        showToast(response.data.message + " Você será redirecionado para o login em breve.", 'success');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        showToast(response.data.message || 'Não foi possível redefinir a senha. O link pode ter expirado.');
      }
    } catch (error) {
      showToast('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="wrapper">
      <div className="senha-box text-center">
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
                type={showPassword ? "text" : "password"}
                required
                value={novaSenha}
                onChange={handlePasswordChange}
                placeholder=" "
              />
              <label>Nova Senha</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
              >
                <IonIcon 
                  icon={showPassword ? eyeOffOutline : eyeOutline} 
                  className="w-5 h-5"
                />
              </button>
              {novaSenha && (
                <div className="password-strength-popup">
                  <div className="strength-checks">
                    <div className={passwordStrength.checks.length ? 'valid' : 'invalid'}>
                      8+ caracteres
                    </div>
                    <div className={passwordStrength.checks.uppercase ? 'valid' : 'invalid'}>
                      Letra maiúscula
                    </div>
                    <div className={passwordStrength.checks.lowercase ? 'valid' : 'invalid'}>
                      Letra minúscula
                    </div>
                    <div className={passwordStrength.checks.number ? 'valid' : 'invalid'}>
                      Número
                    </div>
                    <div className={passwordStrength.checks.special ? 'valid' : 'invalid'}>
                      Caractere especial
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="element-box">
            <div className="input-box password-input">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder=" "
                value={confirmarNovaSenha}
                onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                style={{ color: "#fff", background: "transparent", paddingRight: "2.5rem" }}
              />
              <label>Confirmar Nova Senha</label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle-btn"
              >
                <IonIcon 
                  icon={showConfirmPassword ? eyeOffOutline : eyeOutline} 
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          <div className="element-box">
            <button
              type="submit"
              className="w-40 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Redefinir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetarSenhaConfirmacao;