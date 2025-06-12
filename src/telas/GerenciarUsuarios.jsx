import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ToastAlert from '../componentes/Toast';

function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'error'
  });
  const navigate = useNavigate();

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/usuarios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        setToast({
          show: true,
          message: 'Erro ao carregar usuários',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro de conexão com o servidor',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;

    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setUsuarios(usuarios.filter(user => user.id !== id));
        setToast({
          show: true,
          message: 'Usuário excluído com sucesso',
          type: 'success'
        });
      } else {
        setToast({
          show: true,
          message: 'Erro ao excluir usuário',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro de conexão com o servidor',
        type: 'error'
      });
    }
  };

  const handleUpdate = async (id, novosDados) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(novosDados)
      });

      if (response.ok) {
        const usuarioAtualizado = await response.json();
        setUsuarios(usuarios.map(user => 
          user.id === id ? usuarioAtualizado : user
        ));
        setToast({
          show: true,
          message: 'Usuário atualizado com sucesso',
          type: 'success'
        });
        setUsuarioSelecionado(null);
      } else {
        setToast({
          show: true,
          message: 'Erro ao atualizar usuário',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro de conexão com o servidor',
        type: 'error'
      });
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="wrapper2">
      <div className="cadastro-box overflow-auto p-6"> {/* Added overflow-auto and padding */}
        <h1 className="text-3xl font-bold text-white mb-8">
          Gerenciar Usuários
        </h1>

        <ToastAlert 
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />

        <div className="bg-transparent rounded-lg overflow-x-auto"> {/* Made background transparent */}
          <table className="min-w-full">
            <thead className="border-b border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {usuarios.map(usuario => (
                <tr key={usuario.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {usuario.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {usuario.nome}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {usuario.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setUsuarioSelecionado(usuario)}
                      className="text-blue-400 hover:text-blue-300 mr-4 bg-transparent w-auto h-auto" // Added bg-transparent and adjusted button size
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(usuario.id)}
                      className="text-red-400 hover:text-red-300 bg-transparent w-auto h-auto" // Added bg-transparent and adjusted button size
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GerenciarUsuarios;