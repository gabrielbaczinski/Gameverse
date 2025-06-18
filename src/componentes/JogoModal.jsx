import React, { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { closeOutline, closeCircleOutline, cloudUploadOutline, globeOutline, gameControllerOutline, lockClosedOutline, lockOpenOutline } from 'ionicons/icons';
import axios from 'axios';
import ToastAlert from './Toast';
import AvaliacaoJogo from '../componentes/AvaliacaoJogo';

const JogoModal = ({ jogo, onClose, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState({
    nome: jogo.nome,
    ano: jogo.ano,
    genero: jogo.genero,
    imagem: null
  });
  const [tipoImagem, setTipoImagem] = useState('upload'); // 'upload' ou 'url'
  const [imagemUrl, setImagemUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState(jogo.imagem);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [tagsJogo, setTagsJogo] = useState([]);
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);
  const [mediaAvaliacoes, setMediaAvaliacoes] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });
  const [privado, setPrivado] = useState(jogo.privado === 1);
  const usuarioAtual = parseInt(localStorage.getItem('userId'));
  const isOwner = jogo.userId === usuarioAtual;

  // Inicializar as tags do jogo
  useEffect(() => {
    setTagsJogo(jogo.categorias || []);
  }, [jogo]);

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

  // Função para alternar entre os métodos de imagem
  const alternarMetodo = (metodo) => {
    setTipoImagem(metodo);
    if (metodo === 'upload') {
      setImagemUrl('');
    } else {
      setFormData(prev => ({ ...prev, imagem: null }));
      // Mantém a preview da imagem existente se nenhuma nova for fornecida
      if (!jogo.imagem.startsWith('http')) {
        setPreviewUrl(null);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, imagem: file }));
      // Cria URL de preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // Resetar URL quando fizer upload
      setImagemUrl('');
      setTipoImagem('upload');
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImagemUrl(url);
    setPreviewUrl(url);
    setTipoImagem('url');
    // Resetar upload quando inserir URL
    setFormData(prev => ({ ...prev, imagem: null }));
  };

  // Função para exibir toast
  const showToast = (message, type = 'info') => {
    console.log(`[JogoModal] Exibindo toast: ${message} (${type})`);
    setToast({ show: true, message, type });
    
    // Limpar toast automaticamente
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    const formDataToSend = new FormData();
    formDataToSend.append("nome", formData.nome);
    formDataToSend.append("ano", formData.ano);
    formDataToSend.append("genero", formData.genero);
    
    // Enviar imagem ou URL dependendo da escolha
    if (tipoImagem === 'upload' && formData.imagem) {
      formDataToSend.append("imagem", formData.imagem);
    } else if (tipoImagem === 'url' && imagemUrl) {
      formDataToSend.append("imagemUrl", imagemUrl);
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
      // Buscar ID da categoria pelo nome
      const catResponse = await axios.get(
        `http://localhost:5000/api/categorias/busca?nome=${encodeURIComponent(categoriaSelecionada)}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        }
      );
      
      if (!catResponse.data || !catResponse.data.id) {
        showToast('Categoria não encontrada no servidor', 'error');
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

  const removerTag = async (tagName) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/jogos/${jogo.id}/categorias/${tagName}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        }
      );
      
      if (response.status === 200) {
        // Atualiza o estado local
        const novasCategorias = tagsJogo.filter(tag => tag !== tagName);
        setTagsJogo(novasCategorias);
        
        // Cria um objeto jogo atualizado para passar para onUpdate
        const jogoAtualizado = {
          ...jogo,
          categorias: novasCategorias
        };
        
        if (onUpdate) {
          onUpdate(jogoAtualizado);
        }
        
        showToast('Categoria removida com sucesso!', 'success');
      } else {
        console.warn('Status inesperado na resposta:', response.status);
        showToast('Resposta inesperada do servidor', 'warning');
      }
    } catch (error) {
      console.error('Erro ao remover categoria:', error);
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
    if (e.target.classList.contains('wrapper-modal')) {
      onClose();
    }
  };

  // Carregar média das avaliações
  useEffect(() => {
    const carregarMedia = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/jogos/${jogo.id}/avaliacoes`);
        if (response.data.length > 0) {
          const soma = response.data.reduce((acc, av) => acc + av.pontuacao, 0);
          setMediaAvaliacoes(soma / response.data.length);
        }
      } catch (error) {
        console.error("Erro ao carregar avaliações:", error);
      }
    };
    
    carregarMedia();
  }, [jogo.id]);

  // Adicione esta função
  const togglePrivacidade = async () => {
    try {
      const novoStatus = !privado;
      const response = await axios.put(
        `http://localhost:5000/api/jogos/${jogo.id}/privado`,
        { privado: novoStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      
      if (response.status === 200) {
        setPrivado(novoStatus);
        // Se tiver um handler de atualização, chame-o
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error("Erro ao alterar status de privacidade:", error);
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

            {/* Opções de método de imagem */}
            <div className="form-group">
              <label className="form-label">Alterar Imagem</label>
              <div className="method-selector">
                <button 
                  type="button"
                  className={`method-btn ${tipoImagem === 'upload' ? 'active' : ''}`}
                  onClick={() => alternarMetodo('upload')}
                >
                  <IonIcon icon={cloudUploadOutline} className="text-xl" />
                  Upload
                </button>
                
                <button 
                  type="button"
                  className={`method-btn ${tipoImagem === 'url' ? 'active' : ''}`}
                  onClick={() => alternarMetodo('url')}
                >
                  <IonIcon icon={globeOutline} className="text-xl" />
                  URL
                </button>
              </div>

              {/* Input condicional baseado no tipo */}
              {tipoImagem === 'upload' ? (
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="imagem-input-modal"
                    name="imagem"
                    onChange={handleImageChange}
                    className="hidden-file-input"
                    accept="image/*"
                  />
                  <label htmlFor="imagem-input-modal" className="file-upload-btn">
                    <IonIcon icon={cloudUploadOutline} />
                    Selecionar Imagem
                  </label>
                  {formData.imagem && (
                    <span className="selected-file-name">
                      {formData.imagem.name}
                    </span>
                  )}
                </div>
              ) : (
                <div className="input-box modal-input">
                  <input
                    type="text"
                    value={imagemUrl}
                    onChange={handleImageUrlChange}
                    placeholder=" "
                  />
                  <label>URL da Imagem</label>
                </div>
              )}
            </div>

            {/* Visualização da imagem */}
            {previewUrl && (
              <div className="form-group text-center">
                <div className="image-preview">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-xs max-h-48 rounded"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150?text=Imagem+não+encontrada";
                      showToast('A URL da imagem parece ser inválida.', 'warning');
                    }}
                  />
                </div>
              </div>
            )}

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

            {/* Adicione esta seção apenas se o usuário for o dono do jogo */}
            {isOwner && (
              <div className="privacidade-toggle">
                <div className="privacidade-header">
                  <h4>Visibilidade na Lista de Avaliações</h4>
                </div>
                <label className="switch-label">
                  <span>
                    <IonIcon icon={privado ? lockClosedOutline : lockOpenOutline} />
                    {privado ? 'Jogo Privado' : 'Jogo Público'}
                  </span>
                  <div className="switch">
                    <input 
                      type="checkbox" 
                      checked={privado}
                      onChange={togglePrivacidade}
                    />
                    <span className="slider"></span>
                  </div>
                </label>
                <p className="privacidade-info">
                  {privado 
                    ? "Seu jogo não aparecerá na lista global de avaliações dos outros usuários" 
                    : "Seu jogo está visível para todos na lista de avaliações"}
                </p>
              </div>
            )}

            <div className="separador-secao"></div>
            <div onClick={(e) => e.stopPropagation()}>
              <AvaliacaoJogo 
                jogoId={jogo.id} 
                onUpdate={() => {
                  // Pode usar para recarregar o jogo após uma atualização
                  // de avaliação, se necessário
                }} 
              />
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

const CardJogo = ({ jogo }) => {
  const [mediaAvaliacoes, setMediaAvaliacoes] = useState(null);
  
  useEffect(() => {
    // Carregar média das avaliações
    const carregarMedia = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/jogos/${jogo.id}/avaliacoes`);
        if (response.data.length > 0) {
          const soma = response.data.reduce((acc, av) => acc + av.pontuacao, 0);
          setMediaAvaliacoes(soma / response.data.length);
        }
      } catch (error) {
        console.error("Erro ao carregar avaliações:", error);
      }
    };
    
    carregarMedia();
  }, [jogo.id]);

  return (
    <div className="game-card glass-card">
      {/* Conteúdo existente */}
      
      {/* Badge de avaliação */}
      {mediaAvaliacoes && (
        <div className="rating-badge">
          <span className="rating-value">{mediaAvaliacoes.toFixed(1)}</span>
          <IonIcon icon={gameControllerOutline} className="rating-icon" />
        </div>
      )}
    </div>
  );
};

export default JogoModal;
export { CardJogo };
