import React, { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { pencil, trash, closeOutline, pricetag, addOutline } from 'ionicons/icons';
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

  // Função para fechar modal e recarregar dados
  const fecharModal = () => {
    setCategoriaEditando(null);
    carregarCategorias(); // Recarrega todas as categorias ao fechar o modal
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
        fecharModal(); // Usa a função fecharModal que recarrega os dados
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
        <div className="grid-container mt-8">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="category-grid-item">
              <div className="category-content">
                <span className="game-tag compact-tag">{categoria.nome}</span>
              </div>
              <div className="category-actions">
                <button
                  type="button"
                  onClick={() => setCategoriaEditando(categoria)}
                  className="action-btn edit"
                  title="Editar categoria"
                >
                  <IonIcon icon={pencil} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(categoria.id)}
                  className="action-btn delete"
                  title="Excluir categoria"
                >
                  <IonIcon icon={trash} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal editado para seguir o padrão de GerenciarUsuarios */}
        {categoriaEditando && (
          <div className="wrapper-modal">
            <div className="modal-container glass-modal">
              <div className="modal-header">
                <h3>Editar Categoria</h3>
                <button 
                  onClick={fecharModal}
                  className="modal-close-btn"
                  aria-label="Fechar"
                >
                  <IonIcon icon={closeOutline} />
                </button>
              </div>

              <form onSubmit={handleEdit}>
                <div className="modal-body">
                  <div className="form-group">
                    <div className="form-icon">
                      <IonIcon icon={pricetag} />
                    </div>
                    <div className="input-box modal-input">
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
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="glass-action-btn cancel"
                    onClick={fecharModal}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="glass-action-btn save"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GerenciarCategorias;