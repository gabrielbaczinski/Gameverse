import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import ToastAlert from './Toast';
import './style.css';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'error'
  });
  const [passwordStrength, setPasswordStrength] = useState({
    isStrong: false,
    message: '',
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });
  const [passwordMatch, setPasswordMatch] = useState(true);

  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password)
    };

    const isStrong = Object.values(checks).every(check => check);
    
    let message = 'A senha deve conter:';
    if (!checks.length) message += '\n- Mínimo de 8 caracteres';
    if (!checks.uppercase) message += '\n- Uma letra maiúscula';
    if (!checks.lowercase) message += '\n- Uma letra minúscula';
    if (!checks.number) message += '\n- Um número';
    if (!checks.special) message += '\n- Um caractere especial (!@#$%^&*)';

    setPasswordStrength({ isStrong, message, checks });
    return isStrong;
  };

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const validatePasswords = (password, confirmPassword) => {
    const doesMatch = password === confirmPassword;
    setPasswordMatch(doesMatch);
    if (!doesMatch) {
      showToast('As senhas não coincidem');
    }
    return doesMatch;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setSenha(newPassword);
    checkPasswordStrength(newPassword);
    if (confirmarSenha) {
      validatePasswords(newPassword, confirmarSenha);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmValue = e.target.value;
    setConfirmarSenha(confirmValue);
    validatePasswords(senha, confirmValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordStrength.isStrong) {
      showToast('Por favor, escolha uma senha forte.');
      return;
    }

    if (senha !== confirmarSenha) {
      showToast('As senhas não coincidem!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Cadastro realizado com sucesso!', 'success');
        // Reset form
        setNome('');
        setEmail('');
        setSenha('');
        setConfirmarSenha('');
      } else {
        showToast(data.message || 'Erro ao realizar cadastro');
      }
    } catch (error) {
      showToast('Erro de conexão com o servidor');
    }
  };

  return (
    <div className="wrapper2">
      <div className="cadastro-box">
        <form onSubmit={handleSubmit}>
          <h2>Cadastro</h2>

          <ToastAlert 
            show={toast.show}
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />

          <div className="element-box">
            <div className="input-box">
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder=" "
              />
              <label>Nome</label>
            </div>
          </div>

          <div className="element-box">
            <div className="input-box">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
              />
              <label>Email</label>
            </div>
          </div>

          <div className="element-box-row">
            <div className="input-box">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={senha}
                onChange={handlePasswordChange}
                placeholder=" "
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
                />
              </button>
              {senha && (
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
            <div className="input-box">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmarSenha}
                onChange={handleConfirmPasswordChange}
                placeholder=" "
                style={{ borderColor: !passwordMatch && confirmarSenha ? '#ff4444' : '' }}
              />
              <label>Confirmar Senha</label>
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
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Cadastrar
            </button>
          </div>

          <div className="element-box" style={{ textAlign: 'center' }}>
            <Link to="/login" className="text-white hover:underline">
              Já tem uma conta? Entrar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Cadastro;
