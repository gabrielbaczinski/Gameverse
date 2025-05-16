// telas/Perfil.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

function Perfil() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

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
          console.error('Erro ao carregar perfil:', err);
          navigate('/login');
        });
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Meu Perfil</h2>
        
        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-semibold mb-1">Nome</label>
          <input
            type="text"
            value={nome}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 text-sm font-semibold mb-1">Email</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50"
          />
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200"
        >
          Sair
        </button>
      </div>
    </div>
  );
}

export default Perfil;
