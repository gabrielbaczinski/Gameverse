// telas/Perfil.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import ToastAlert from '../componentes/Toast';

function Perfil() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'error'
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      navigate('/login');
    } else {
      axios
        .get(`http://localhost:5000/api/usuarios/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setNome(res.data.nome);
          setEmail(res.data.email);
        })
        .catch((err) => {
          setToast({
            show: true,
            message: 'Erro ao carregar perfil',
            type: 'error'
          });
          console.error('Erro ao carregar perfil:', err);
        });
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="wrapper2">
      <div className="cadastro-box">
        <ToastAlert 
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />

        <form className="space-y-6">
          <h2>Meu Perfil</h2>

          <div className="element-box">
            <div className="input-box">
              <input
                type="text"
                value={nome}
                readOnly
                className="filled"
                placeholder=" "
              />
              <label>Nome</label>
            </div>
          </div>

          <div className="element-box">
            <div className="input-box">
              <input
                type="email"
                value={email}
                readOnly
                className="filled"
                placeholder=" "
              />
              <label>Email</label>
            </div>
          </div>

          <div className="element-box mt-8">
            <button
              onClick={handleLogout}
              type="button"
              className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Sair
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Perfil;
