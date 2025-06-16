import React, { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import axios from 'axios';

function AdicionarCategoria({ jogo, onClose, onUpdate }) {
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionadas, setCategoriaSelecionadas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categorias', {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
          }
        });
        setCategorias(response.data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    carregarCategorias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/jogos/${jogo.id}/categorias`,
        { categorias: categoriaSelecionadas },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Erro ao adicionar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Adicionar Categorias - {jogo.nome}</h2>
          <button 
            onClick={onClose} 
            className="absolute w-7 h-7 top-2 right-2 p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <IonIcon icon={closeOutline} className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="modal-form-group">
            <label className="modal-label">Selecione as Categorias</label>
            <select
              multiple
              value={categoriaSelecionadas}
              onChange={(e) => setCategoriaSelecionadas(
                Array.from(e.target.selectedOptions, option => option.value)
              )}
              className="modal-input"
            >
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-400 mt-1">
              Use Ctrl + clique para selecionar múltiplas categorias
            </p>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="modal-btn modal-btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="modal-btn modal-btn-primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Categorias'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdicionarCategoria;