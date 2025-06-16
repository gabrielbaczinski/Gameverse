import React, { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { closeOutline, closeCircleOutline } from 'ionicons/icons';
import axios from 'axios';
import ToastAlert from './Toast';

export default function JogoModal({ jogo, onClose, onUpdate, onDelete }) {
  const [formData, setFormData] = useState({
    nome: jogo.nome,
    ano: jogo.ano,
    genero: jogo.genero,
    imagem: null
  });
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [tagsJogo, setTagsJogo] = useState(jogo.categorias || []);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'error'
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

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
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
    if (!categoriaSelecionada) {
      showToast('Selecione uma categoria', 'error');
      return;
    }
    
    try {
      const categoriaObj = categorias.find(c => c.id === parseInt(categoriaSelecionada));
      
      if (!categoriaObj) {
        showToast('Categoria inválida', 'error');
        return;
      }

      if (tagsJogo.includes(categoriaObj.nome)) {
        showToast('Categoria já existe neste jogo', 'error');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/jogos/${jogo.id}/categorias`,
        { categorias: [parseInt(categoriaSelecionada)] },
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setTagsJogo([...tagsJogo, categoriaObj.nome]);
        setCategoriaSelecionada('');
        showToast('Categoria adicionada com sucesso', 'success');
      }
    } catch (error) {
      showToast('Erro ao adicionar categoria', 'error');
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
        setTagsJogo(tagsJogo.filter(tag => tag !== tagName));
        showToast('Categoria removida com sucesso', 'success');
      }
    } catch (error) {
      showToast('Erro ao remover categoria', 'error');
    }
  };

  return (
    <div className="wrapper-modal">
      <div className="modal-container">
        <ToastAlert 
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
        
        <form onSubmit={handleSubmit}>
          <button 
            type="button"
            onClick={onClose} 
            className="absolute w-7 h-7 top-2 right-2 p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <IonIcon icon={closeOutline} className="w-5 h-5" />
          </button>

          <h2>Editar Jogo</h2>

          <div className="element-box">
            <div className="input-box">
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

          <div className="element-box">
            <div className="input-box">
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

          <div className="element-box">
            <div className="input-box">
              <input
                type="text"
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label>Gênero</label>
            </div>
          </div>

          <div className="element-box">
            <div className="input-box">
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

          <div className="element-box">
            <div className="input-box">
              <select
                value={categoriaSelecionada}
                onChange={(e) => setCategoriaSelecionada(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={adicionarTag}
              className="mt-2 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Adicionar Categoria
            </button>
          </div>

          <div className="tags-container">
            {tagsJogo.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <IonIcon
                  icon={closeCircleOutline}
                  className="tag-remove"
                  onClick={() => removerTag(tag)}
                />
              </span>
            ))}
          </div>

          <div className="element-box flex gap-2">
            <button 
              type="submit" 
              className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Tem certeza que deseja excluir este jogo?')) {
                  onDelete(jogo.id);
                  onClose();
                }
              }}
              className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Excluir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
