import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { mailOutline } from 'ionicons/icons';
import ToastAlert from './Toast';

function VerificarCodigo() {
  const [codigo, setCodigo] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'error'
  });

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/verificar-codigo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, codigo }),
      });

      const data = await response.json();

      if (response.ok) {
        setToast({
          show: true,
          message: 'Código verificado com sucesso!',
          type: 'success'
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setToast({
          show: true,
          message: data.message || 'Código inválido',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro ao verificar código',
        type: 'error'
      });
    }
  };

  return (
    <>
      <ToastAlert 
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
      <div className="wrapper">
        <div className="login-box">
          <form onSubmit={handleSubmit}>
            <h2>Verificar Código</h2>
            
            <div className="input-box">
              <IonIcon icon={mailOutline} className="icon" />
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

            <div className="element-box mt-5">
              <p className="text-white text-sm mb-4">
                Digite o código de 6 dígitos enviado para {email}
              </p>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Verificar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default VerificarCodigo;