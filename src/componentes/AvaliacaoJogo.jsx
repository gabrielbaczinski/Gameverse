import React, { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { gameControllerOutline, trashOutline, createOutline } from 'ionicons/icons';
import axios from 'axios';
import '../componentes/style.css';

const AvaliacaoJogo = ({ jogoId, onUpdate }) => {
  const [avaliacaoTexto, setAvaliacaoTexto] = useState('');
  const [pontuacao, setPontuacao] = useState(0);
  const [avaliacaoExistente, setAvaliacaoExistente] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Carregar avaliações e verificar se o usuário já avaliou
  useEffect(() => {
    const carregarAvaliacoes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/jogos/${jogoId}/avaliacoes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        });
        
        setAvaliacoes(response.data);
        
        // Verificar se o usuário atual já fez uma avaliação
        const minhaAvaliacao = response.data.find(av => 
          av.usuario_id === parseInt(localStorage.getItem('userId'))
        );
        
        if (minhaAvaliacao) {
          setAvaliacaoExistente(minhaAvaliacao);
          setPontuacao(minhaAvaliacao.pontuacao);
          setAvaliacaoTexto(minhaAvaliacao.texto);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        setLoading(false);
      }
    };
    
    carregarAvaliacoes();
  }, [jogoId]);

  // Garantir que o comportamento padrão seja prevenido
  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    
    if (pontuacao < 1) {
      alert('Por favor, selecione uma pontuação.');
      return;
    }
    
    try {
      const response = await axios.post(`http://localhost:5000/api/jogos/${jogoId}/avaliacao`, 
        { pontuacao, texto: avaliacaoTexto },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }}
      );
      
      // Atualizar a lista de avaliações
      const novasAvaliacoes = await axios.get(`http://localhost:5000/api/jogos/${jogoId}/avaliacoes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      setAvaliacoes(novasAvaliacoes.data);
      
      // Atualizar estado local
      setAvaliacaoExistente(
        novasAvaliacoes.data.find(av => 
          av.usuario_id === parseInt(localStorage.getItem('userId'))
        )
      );
      
      setEditando(false);
      
      // Notificar componente pai, se necessário
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      alert('Erro ao enviar avaliação. Por favor, tente novamente.');
    }
  };

  const enviarAvaliacao = () => {
    handleSubmit();
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await axios.delete(`http://localhost:5000/api/jogos/${jogoId}/avaliacao`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      // Atualizar a lista de avaliações
      const novasAvaliacoes = await axios.get(`http://localhost:5000/api/jogos/${jogoId}/avaliacoes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      setAvaliacoes(novasAvaliacoes.data);
      setAvaliacaoExistente(null);
      setPontuacao(0);
      setAvaliacaoTexto('');
      
      // Notificar componente pai, se necessário
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      alert('Erro ao excluir avaliação. Por favor, tente novamente.');
    }
  };

  if (loading) {
    return <div className="avaliacao-loading">Carregando avaliações...</div>;
  }

  return (
    <div className="avaliacao-container glass-card">
      <h3 className="avaliacao-titulo">Avaliações</h3>
      
      {/* Seção para adicionar/editar avaliação */}
      {!avaliacaoExistente || editando ? (
        <form 
          onSubmit={handleSubmit} 
          className="avaliacao-form"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pontuacao-container">
            <div className="controls-rating">
              {[1, 2, 3, 4, 5].map((valor) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setPontuacao(valor)}
                  className={`control-icon ${pontuacao >= valor ? 'active' : ''}`}
                >
                  <IonIcon icon={gameControllerOutline} />
                </button>
              ))}
            </div>
            <span className="pontuacao-legenda">
              {pontuacao === 1 && "Não curti"}
              {pontuacao === 2 && "Médio"}
              {pontuacao === 3 && "Bom"}
              {pontuacao === 4 && "Muito bom"}
              {pontuacao === 5 && "Obra-prima!"}
            </span>
          </div>
          
          <textarea
            value={avaliacaoTexto}
            onChange={(e) => setAvaliacaoTexto(e.target.value)}
            placeholder="Conte o que achou deste jogo..."
            className="avaliacao-textarea"
            rows={4}
          />
          
          <div className="avaliacao-btns">
            {editando && (
              <button 
                type="button" 
                onClick={() => setEditando(false)} 
                className="glass-action-btn cancel"
              >
                Cancelar
              </button>
            )}
            <button 
              type="button"
              onClick={enviarAvaliacao}
              className="glass-action-btn save"
            >
              {avaliacaoExistente ? 'Atualizar' : 'Enviar avaliação'}
            </button>
          </div>
        </form>
      ) : (
        <div className="minha-avaliacao">
          <div className="avaliacao-header">
            <h4>Minha avaliação</h4>
            <div className="avaliacao-acoes">
              <button 
                onClick={() => setEditando(true)}
                className="icon-btn edit"
              >
                <IonIcon icon={createOutline} />
              </button>
              <button 
                onClick={handleDelete}
                className="icon-btn delete"
              >
                <IonIcon icon={trashOutline} />
              </button>
            </div>
          </div>
          
          <div className="controls-rating">
            {[1, 2, 3, 4, 5].map((valor) => (
              <span
                key={valor}
                className={`control-icon ${pontuacao >= valor ? 'active' : ''}`}
              >
                <IonIcon icon={gameControllerOutline} />
              </span>
            ))}
          </div>
          
          <p className="avaliacao-texto">
            {avaliacaoExistente.texto || <em>Sem comentário adicional</em>}
          </p>
        </div>
      )}
      
      {/* Lista de avaliações de outros usuários */}
      <div className="outras-avaliacoes">
        <h4>Avaliações da comunidade</h4>
        {avaliacoes.filter(av => 
          av.usuario_id !== parseInt(localStorage.getItem('userId'))
        ).length > 0 ? (
          <div className="avaliacoes-lista">
            {avaliacoes
              .filter(av => av.usuario_id !== parseInt(localStorage.getItem('userId')))
              .map(av => (
                <div key={av.id} className="avaliacao-item">
                  <div className="avaliacao-usuario-info">
                    <span className="avaliacao-nome">{av.usuario_nome}</span>
                    <div className="controls-rating small">
                      {[1, 2, 3, 4, 5].map((valor) => (
                        <span
                          key={valor}
                          className={`control-icon ${av.pontuacao >= valor ? 'active' : ''}`}
                        >
                          <IonIcon icon={gameControllerOutline} />
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="avaliacao-texto">
                    {av.texto || <em>Sem comentário adicional</em>}
                  </p>
                  <div className="avaliacao-data">
                    {new Date(av.data_criacao).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="sem-avaliacoes">Seja o primeiro a avaliar este jogo!</p>
        )}
      </div>
      
      {showDeleteConfirm && (
        <div className="confirm-modal-backdrop">
          <div className="confirm-modal glass-modal">
            <h4>Confirmar exclusão</h4>
            <p>Tem certeza que deseja excluir sua avaliação?</p>
            <div className="confirm-actions">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="glass-action-btn cancel"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete} 
                className="glass-action-btn delete"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvaliacaoJogo;