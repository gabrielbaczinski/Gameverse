import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { IonIcon } from '@ionic/react';
import { gameControllerOutline, addCircleOutline, checkmarkCircleOutline, searchOutline, closeOutline, lockClosedOutline, chevronDownOutline, chevronUpOutline, personCircleOutline } from 'ionicons/icons';
import ToastAlert from '../componentes/Toast';

function TelaAvaliacoes() {
  const [jogos, setJogos] = useState([]);
  const [jogosAvaliacoes, setJogosAvaliacoes] = useState({});
  const [jogosUsuario, setJogosUsuario] = useState([]);
  const [jogoExpandido, setJogoExpandido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Função para mostrar toast
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Função para buscar avaliações de um jogo
  const buscarAvaliacoes = useCallback(async (jogoId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/jogos/${jogoId}/avaliacoes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      // Calcular média
      let media = 0;
      if (response.data.length > 0) {
        const soma = response.data.reduce((acc, av) => acc + av.pontuacao, 0);
        media = (soma / response.data.length).toFixed(1);
      }
      
      return {
        avaliacoes: response.data,
        media: media,
        total: response.data.length
      };
    } catch (error) {
      console.error(`Erro ao carregar avaliações para jogo ${jogoId}:`, error);
      return {
        avaliacoes: [],
        media: 0,
        total: 0,
        error: error.message
      };
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        
        // Buscar jogos do usuário
        const respJogosUsuario = await axios.get('http://localhost:5000/api/jogos', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        });
        
        setJogosUsuario(respJogosUsuario.data.map(j => j.id));
        
        // Buscar todos os jogos
        const respTodosJogos = await axios.get('http://localhost:5000/api/jogos/todos', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        });
        
        const jogosData = respTodosJogos.data;
        setJogos(jogosData);
        
        // Buscar avaliações para cada jogo (limitado a 10 para performance)
        const avaliacoesPromises = {};
        const jogosParaAvaliar = jogosData.slice(0, 10); // Pegar só os primeiros 10 jogos inicialmente
        
        for (const jogo of jogosParaAvaliar) {
          avaliacoesPromises[jogo.id] = buscarAvaliacoes(jogo.id);
        }
        
        // Resolver todas as promessas
        const avaliacoesResolvidas = {};
        for (const [id, promise] of Object.entries(avaliacoesPromises)) {
          avaliacoesResolvidas[id] = await promise;
        }
        
        setJogosAvaliacoes(avaliacoesResolvidas);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar jogos:", err);
        setError(err.message || "Falha ao carregar jogos");
        setLoading(false);
        showToast("Erro ao carregar jogos: " + (err.message || "Falha desconhecida"), "error");
      }
    };

    carregarDados();
  }, [buscarAvaliacoes]);

  // Função para carregar avaliações quando expandir um jogo
  const handleExpandirJogo = async (jogoId) => {
    // Se já está expandido, apenas feche
    if (jogoExpandido === jogoId) {
      setJogoExpandido(null);
      return;
    }
    
    setJogoExpandido(jogoId);
    
    // Se ainda não carregamos avaliações para este jogo, carregue agora
    if (!jogosAvaliacoes[jogoId]) {
      try {
        const avaliacoes = await buscarAvaliacoes(jogoId);
        setJogosAvaliacoes(prev => ({
          ...prev,
          [jogoId]: avaliacoes
        }));
      } catch (error) {
        console.error(`Erro ao expandir jogo ${jogoId}:`, error);
      }
    }
  };

  // Função para adicionar jogo ao catálogo
  const adicionarAoCatalogo = async (jogo) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/jogos/adicionar-ao-catalogo`, 
        { jogoId: jogo.id },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }}
      );
      
      if (response.status === 200) {
        setJogosUsuario(prev => [...prev, jogo.id]);
        showToast(`"${jogo.nome}" adicionado ao seu catálogo!`, 'success');
      }
    } catch (error) {
      console.error('Erro ao adicionar jogo:', error);
      showToast(error.response?.data?.error || 'Erro ao adicionar jogo', 'error');
    }
  };

  // Filtrar jogos
  const jogosFiltrados = jogos.filter(jogo => 
    jogo?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    jogo?.genero?.toLowerCase().includes(busca.toLowerCase())
  );

  // Obter o usuário atual
  const usuarioAtualId = parseInt(localStorage.getItem('userId'));

  return (
    <div className="avaliacao-global-wrapper">
      <ToastAlert 
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
      
      <h1 className="page-title">Avaliações Globais</h1>
      
      {/* Barra de busca */}
      <div className="search-container">
        <div className="search-box">
          <div className="search-input-wrapper">
            <IonIcon icon={searchOutline} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar jogos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="search-input"
            />
            {busca && (
              <button 
                onClick={() => setBusca('')} 
                className="clear-search-btn"
              >
                <IonIcon icon={closeOutline} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Exibir estado atual */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando jogos e avaliações...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>Erro ao carregar jogos: {error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Tentar novamente
          </button>
        </div>
      ) : jogos.length === 0 ? (
        <div className="no-content">
          <p>Nenhum jogo encontrado.</p>
        </div>
      ) : (
        <div className="avaliacao-grid">
          {jogosFiltrados.map(jogo => {
            const avaliacoesData = jogosAvaliacoes[jogo.id];
            
            return (
              <div key={jogo.id} className="avaliacao-card glass-card">
                <div className="avaliacao-card-header">
                  <div className="avaliacao-game-image">
                    <img 
                      src={jogo.imagem?.startsWith('http') ? jogo.imagem : `http://localhost:5000${jogo.imagem}`}
                      alt={jogo.nome}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150?text=Sem+Imagem";
                      }}
                    />
                    
                    {/* Badge de privacidade - apenas para jogos do usuário atual */}
                    {jogo.userId === parseInt(localStorage.getItem('userId')) && jogo.privado === 1 && (
                      <div className="privado-badge">
                        <IonIcon icon={lockClosedOutline} />
                        <span>Privado</span>
                      </div>
                    )}
                    
                    {/* Badge com média das avaliações */}
                    {avaliacoesData && avaliacoesData.total > 0 && (
                      <div className="avaliacao-badge">
                        <span className="avaliacao-badge-valor">{avaliacoesData.media}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="avaliacao-game-info">
                    <h2 className="avaliacao-title">{jogo.nome}</h2>
                    <p className="avaliacao-year">{jogo.ano}</p>
                    <p className="avaliacao-desc">{jogo.genero}</p>
                    
                    {/* Exibição da média de avaliações */}
                    {avaliacoesData && (
                      <div className="avaliacao-sumario">
                        <div className="rating-controls">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <IonIcon 
                              key={n} 
                              icon={gameControllerOutline} 
                              className={`rating-icon ${avaliacoesData.media >= n ? 'active' : ''}`} 
                            />
                          ))}
                        </div>
                        
                        <span className="avaliacao-count">
                          {avaliacoesData.total} {avaliacoesData.total === 1 ? 'avaliação' : 'avaliações'}
                        </span>
                      </div>
                    )}
                    
                    {/* Botão para adicionar ao catálogo */}
                    {!jogosUsuario.includes(jogo.id) ? (
                      <button 
                        className="add-to-catalog-btn"
                        onClick={() => adicionarAoCatalogo(jogo)}
                      >
                        <IonIcon icon={addCircleOutline} />
                        Adicionar ao meu catálogo
                      </button>
                    ) : (
                      <div className="already-in-catalog">
                        <IonIcon icon={checkmarkCircleOutline} />
                        Já está no seu catálogo
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Botão para expandir/colapsar */}
                <div className="avaliacao-actions">
                  <button 
                    className="toggle-details-btn"
                    onClick={() => handleExpandirJogo(jogo.id)}
                  >
                    {jogoExpandido === jogo.id ? (
                      <>
                        Esconder avaliações 
                        <IonIcon icon={chevronUpOutline} className="toggle-icon" />
                      </>
                    ) : (
                      <>
                        Ver avaliações
                        <IonIcon icon={chevronDownOutline} className="toggle-icon" />
                      </>
                    )}
                  </button>
                </div>
                
                {/* Seção expandida de avaliações */}
                {jogoExpandido === jogo.id && avaliacoesData && (
                  <div className="avaliacao-expandida">
                    <h4 className="avaliacao-section-title">Avaliações da Comunidade</h4>
                    
                    {avaliacoesData.total === 0 ? (
                      <p className="sem-avaliacoes">Nenhuma avaliação encontrada para este jogo.</p>
                    ) : (
                      <div className="avaliacoes-lista">
                        {avaliacoesData.avaliacoes.map(avaliacao => (
                          <div key={avaliacao.id} className="avaliacao-item">
                            <div className="avaliacao-header">
                              <div className="avaliacao-usuario">
                                <IonIcon icon={personCircleOutline} className="usuario-icon" />
                                <span className="usuario-nome">{avaliacao.usuario_nome}</span>
                                {avaliacao.usuario_id === usuarioAtualId && (
                                  <span className="usuario-badge">Você</span>
                                )}
                              </div>
                              <div className="avaliacao-pontuacao">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <IonIcon 
                                    key={n} 
                                    icon={gameControllerOutline} 
                                    className={`rating-icon ${avaliacao.pontuacao >= n ? 'active' : ''}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {avaliacao.texto && (
                              <div className="avaliacao-conteudo">
                                <p className="avaliacao-texto">{avaliacao.texto}</p>
                              </div>
                            )}
                            
                            <div className="avaliacao-footer">
                              <span className="avaliacao-data">
                                {new Date(avaliacao.data_criacao).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TelaAvaliacoes;