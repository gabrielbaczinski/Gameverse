import React, { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { pencil, trash, closeOutline } from 'ionicons/icons';
import ToastAlert from '../componentes/Toast';
import axios from 'axios';

function GerenciarCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'error'
  });

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categorias', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setCategorias(response.data);
    } catch (error) {
      showToast('Erro ao carregar categorias', 'error');
    }
  };

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/categorias',
        { nome: novaCategoria },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        setToast({
          show: true,
          message: 'Categoria criada com sucesso!',
          type: 'success'
        });
        carregarCategorias();
        setNovaCategoria('');
      }
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.error || 'Erro ao criar categoria',
        type: 'error'
      });
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/api/categorias/${categoriaEditando.id}`,
        { nome: categoriaEditando.nome },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setToast({
          show: true,
          message: 'Categoria atualizada com sucesso!',
          type: 'success'
        });
        carregarCategorias();
        setCategoriaEditando(null);
      }
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.error || 'Erro ao atualizar categoria',
        type: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/categorias/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (response.status === 200) {
        showToast('Categoria excluída com sucesso!', 'success');
        carregarCategorias();
      }
    } catch (error) {
      showToast('Erro ao excluir categoria', 'error');
    }
  };

  return (
    <div className="wrapper">
      <div className="cadastro-box">
        <ToastAlert {...toast} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
        
        <h2>Gerenciar Categorias</h2>

        {/* Form for adding new categories */}
        <form onSubmit={handleSubmit}>
          <div className="element-box">
            <div className="input-box">
              <input
                type="text"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                placeholder=" "
                required
              />
              <label>Nova Categoria</label>
            </div>
          </div>

          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">
            Adicionar
          </button>
        </form>

        {/* List of categories */}
        <div className="grid gap-4 mt-8">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <span className="text-white">{categoria.nome}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Setting categoria:', categoria); // Debug log
                    setCategoriaEditando(categoria);
                  }}
                  className="p-2 text-blue-500 hover:text-blue-400"
                >
                  <IonIcon icon={pencil} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(categoria.id)}
                  className="p-2 text-red-500 hover:text-red-400"
                >
                  <IonIcon icon={trash} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {categoriaEditando && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="wrapper-modal">
              <div className="modal-container">
                <button 
                  type="button"
                  onClick={() => setCategoriaEditando(null)}
                  className="absolute w-7 h-7 top-2 right-2 p-1 hover:bg-gray-700 rounded-full"
                >
                  <IonIcon icon={closeOutline} />
                </button>

                <h2>Editar Categoria</h2>

                <form onSubmit={handleEdit}>
                  <div className="element-box">
                    <div className="input-box">
                      <input
                        type="text"
                        value={categoriaEditando.nome}
                        onChange={(e) => setCategoriaEditando(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder=" "
                        required
                      />
                      <label>Nome da Categoria</label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      type="submit" 
                      className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoriaEditando(null)}
                      className="flex-1 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GerenciarCategorias;