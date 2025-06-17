import React, { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { closeOutline, closeCircleOutline } from 'ionicons/icons';
import axios from 'axios';
import ToastAlert from './Toast';

const JogoModal = ({ jogo, onClose, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState({
    nome: jogo.nome,
    ano: jogo.ano,
    genero: jogo.genero,
    imagem: null
  });
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [novaTag, setNovaTag] = useState('');
  const [tagsJogo, setTagsJogo] = useState([]);
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info' // padrão
  });

  useEffect(() => {
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

    carregarCategorias();
  }, []);

  // Efeito para carregar categorias disponíveis
  useEffect(() => {
    const carregarCategoriasDisponiveis = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categorias');
        setCategoriasDisponiveis(response.data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    
    carregarCategoriasDisponiveis();
  }, []);

  // Função para exibir toast
  const showToast = (message, type = 'info') => {
    console.log(`[JogoModal] Exibindo toast: ${message} (${type})`);
    setToast({ show: true, message, type });
    
    // Limpar toast automaticamente
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagem: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    const formDataToSend = new FormData();
    formDataToSend.append("nome", formData.nome);
    formDataToSend.append("ano", formData.ano);
    formDataToSend.append("genero", formData.genero);
    if (formData.imagem) {
      formDataToSend.append("imagem", formData.imagem);
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/jogos/${jogo.id}`,
        formDataToSend,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.status === 200) {
        showToast(response.data.toast.message, 'success');
        onUpdate(response.data);
        onClose();
      }
    } catch (error) {
      showToast('Erro ao atualizar jogo', 'error');
      console.error("Erro ao atualizar:", error);
    }
  };

  const adicionarTag = async () => {
    // Log para debug
    console.log('Categoria selecionada:', categoriaSelecionada);
    console.log('Categorias disponíveis:', categoriasDisponiveis);
    
    if (!categoriaSelecionada) {
      showToast('Selecione uma categoria válida', 'warning');
      return;
    }

    // Verificar se a categoria já está adicionada
    if (tagsJogo.includes(categoriaSelecionada)) {
      showToast('Esta categoria já foi adicionada', 'warning');
      return;
    }

    try {
      // Buscar ID da categoria diretamente do servidor pelo nome
      // Isso é mais confiável do que tentar encontrar no array local
      const catResponse = await axios.get(
        `http://localhost:5000/api/categorias/busca?nome=${encodeURIComponent(categoriaSelecionada)}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        }
      );
      
      if (!catResponse.data || !catResponse.data.id) {
        showToast('Categoria não encontrada no servidor', 'error');
        console.error('Resposta da API de categorias:', catResponse.data);
        return;
      }
      
      const categoriaId = catResponse.data.id;
      
      // Adicionar categoria ao jogo usando o ID
      const response = await axios.post(
        `http://localhost:5000/api/jogos/${jogo.id}/categorias`,
        { categorias: [categoriaId] },
        {
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}` 
          }
        }
      );

      if (response.status === 200) {
        // Atualiza o estado local
        const novasCategorias = [...tagsJogo, categoriaSelecionada];
        setTagsJogo(novasCategorias);
        setCategoriaSelecionada(''); // Limpa a seleção
        
        // Notifica o componente pai
        const jogoAtualizado = {
          ...jogo,
          categorias: novasCategorias
        };
        
        if (onUpdate) {
          onUpdate(jogoAtualizado);
        }
        
        showToast('Categoria adicionada com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      showToast('Erro ao adicionar categoria: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  // Modifique a função removerTag para passar o jogo atualizado:
  const removerTag = async (tagName) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/jogos/${jogo.id}/categorias/${tagName}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        }
      );
      
      // Verifique o status explicitamente
      if (response.status === 200) {
        // Atualiza o estado local
        const novasCategorias = tagsJogo.filter(tag => tag !== tagName);
        setTagsJogo(novasCategorias);
        
        // Cria um objeto jogo atualizado para passar para onUpdate
        const jogoAtualizado = {
          ...jogo,
          categorias: novasCategorias
        };
        
        // Notifica o componente pai COM o jogo atualizado
        if (onUpdate) {
          onUpdate(jogoAtualizado);
        }
        
        // Exibe toast de sucesso
        showToast('Categoria removida com sucesso!', 'success');
      } else {
        // Caso improvável, mas para cobrir todos os casos
        console.warn('Status inesperado na resposta:', response.status);
        showToast('Resposta inesperada do servidor', 'warning');
      }
    } catch (error) {
      console.error('Erro ao remover categoria:', error);
      
      // Exibe mensagem de erro específica
      const errorMsg = error.response?.data?.error || 'Erro ao remover categoria';
      showToast(errorMsg, 'error');
    }
  };

  const excluirJogo = () => {
    if (window.confirm('Tem certeza que deseja excluir este jogo?')) {
      onDelete(jogo.id);
    }
  };

  const handleBackdropClick = (e) => {
    // Verifica se o clique foi fora da modal
    if (e.target.classList.contains('wrapper-modal')) {
      onClose();
    }
  };

  return (
    <div className="wrapper-modal" onClick={handleBackdropClick}>
      <ToastAlert
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
      
      <div className="modal-container glass-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Editar Jogo</h3>
          <button 
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Fechar"
          >
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <div className="input-box modal-input">
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder=" "
                  required
                />
                <label>Nome</label>
              </div>
            </div>

            <div className="form-group">
              <div className="input-box modal-input">
                <input
                  type="number"
                  name="ano"
                  value={formData.ano}
                  onChange={handleChange}
                  placeholder=" "
                  required
                />
                <label>Ano</label>
              </div>
            </div>

            <div className="form-group">
              <div className="input-box modal-input">
                <input
                  type="text"
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  placeholder=" "
                  required
                />
                <label>Descrição</label>
              </div>
            </div>

            <div className="form-group">
              <div className="input-box modal-input">
                <input
                  type="file"
                  name="imagem"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="pt-2"
                />
                <label>Nova Imagem</label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Adicionar Categoria</label>
              <div className="category-input-group">
                <div className="category-select-container">
                  <select
                    value={categoriaSelecionada}
                    onChange={(e) => setCategoriaSelecionada(e.target.value)}
                    className="category-select"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.nome}>
                        {cat.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={adicionarTag}
                  className="add-category-btn"
                  disabled={!categoriaSelecionada}
                >
                  Adicionar
                </button>
              </div>
            </div>

            <div className="tags-container">
              {tagsJogo.map((tag, index) => (
                <span key={index} className="game-tag">
                  {tag}
                  <IonIcon
                    icon={closeCircleOutline}
                    className="tag-remove"
                    onClick={() => removerTag(tag)}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="glass-action-btn delete"
              onClick={excluirJogo}
            >
              Excluir
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
  );
}

export default JogoModal;
