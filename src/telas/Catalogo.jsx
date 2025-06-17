import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import JogoModal from "../componentes/JogoModal";
import { IonIcon } from '@ionic/react';
import { pricetag, searchOutline, closeOutline } from 'ionicons/icons';
import ToastAlert from "../componentes/Toast";

function Catalogo() {
  const [jogos, setJogos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jogoSelecionado, setJogoSelecionado] = useState(null);
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Referência para controlar se o componente está montado
  const isMountedRef = useRef(true);
  
  // Efeito para limpar a referência quando o componente for desmontado
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Função helper para mostrar o toast mais segura
  const showToast = useCallback((message, type = 'info') => {
    if (!isMountedRef.current) return; // Não mostra toast se componente foi desmontado
    
    console.log(`Exibindo toast: "${message}" (tipo: ${type})`);
    
    // Limpe qualquer timer existente para evitar conflitos
    if (window.toastTimer) {
      clearTimeout(window.toastTimer);
    }
    
    // Defina o novo toast
    setToast({ show: true, message, type });
    
    // Configure o timer para fechar e armazene sua referência
    window.toastTimer = setTimeout(() => {
      if (isMountedRef.current) { // Verifica novamente antes de atualizar estado
        setToast(prev => ({ ...prev, show: false }));
      }
    }, 3000);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    // Log para depuração
    console.log("Buscando jogos...");
    
    axios
      .get("http://localhost:5000/api/jogos", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Jogos recebidos:", response.data);
        // Verifique se cada jogo tem categorias
        response.data.forEach(jogo => {
          console.log(`Jogo ${jogo.nome} - Categorias:`, jogo.categorias);
        });
        setJogos(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar os jogos:", error);
        setError("Erro ao carregar os jogos.");
        setLoading(false);
      });
  }, [navigate]);

  useEffect(() => {
    // Carregar categorias
    const carregarCategorias = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get("http://localhost:5000/api/categorias", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Categorias recebidas:", response.data);
        setCategorias(response.data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    };
    
    carregarCategorias();
  }, []);

  // Melhorar a função de carregamento com verificação de componente montado
  const carregarJogos = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/jogos', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      if (isMountedRef.current) {
        // Verifica se a resposta é válida antes de atualizar o estado
        if (response && response.data) {
          setJogos(response.data);
          console.log('Jogos carregados:', response.data.length);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
      
      // Somente mostra o erro se o componente ainda estiver montado
      if (isMountedRef.current) {
        showToast('Erro ao carregar jogos', 'error');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [showToast]); // Adiciona showToast como dependência

  // Adicione um efeito para debug
  useEffect(() => {
    console.log('Estado de jogos atualizado:', jogos.length, 'jogos');
  }, [jogos]);

  // Modifique a função handleAtualizar para aceitar um parâmetro opcional
  const handleAtualizar = useCallback((jogoAtualizado = null) => {
    // Se um jogo específico for atualizado, atualize apenas ele no estado
    if (jogoAtualizado) {
      setJogos(prevJogos => 
        prevJogos.map(jogo => 
          jogo.id === jogoAtualizado.id ? jogoAtualizado : jogo
        )
      );
      
      // Se o jogo atualizado for o selecionado, atualize-o também
      if (jogoSelecionado && jogoSelecionado.id === jogoAtualizado.id) {
        setJogoSelecionado(jogoAtualizado);
      }
      
      showToast('Jogo atualizado', 'success');
    } else {
      // Se nenhum jogo específico for fornecido, recarregue todos
      carregarJogos();
    }
  }, [carregarJogos, jogoSelecionado]);

  // Função para excluir jogo
  const handleExcluir = async (idJogo) => {
    try {
      // Feche o modal primeiro e forneça feedback visual imediato
      setJogoSelecionado(null);
      
      // Informe que a exclusão está em andamento
      showToast('Processando exclusão...', 'info');
      
      const response = await axios.delete(`http://localhost:5000/api/jogos/${idJogo}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      // Verifique explicitamente o status da resposta
      if (response.status >= 200 && response.status < 300) {
        // Atualiza o estado local
        setJogos(prevJogos => prevJogos.filter(jogo => jogo.id !== idJogo));
        
        // Mostra mensagem de sucesso APÓS a exclusão bem-sucedida
        showToast('Jogo excluído com sucesso!', 'success');
        
        // Recarregue jogos após pequeno delay
        setTimeout(() => {
          carregarJogos();
        }, 300);
      } else {
        // Status inesperado
        console.warn('Status inesperado na exclusão:', response.status);
        showToast(`Resposta inesperada: ${response.statusText}`, 'error');
      }
    } catch (error) {
      console.error('Erro ao excluir jogo:', error);
      
      // Mensagem de erro específica baseada na resposta
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.error || 
                       'Erro ao excluir o jogo';
      showToast(errorMsg, 'error');
    }
  };

  // Filtrar jogos com verificação segura para categorias
  const jogosFiltrados = jogos.filter((jogo) => {
    // Verificar texto de busca
    const matchBusca = jogo && jogo.nome && jogo.genero && jogo.ano
      ? `${jogo.nome} ${jogo.genero} ${jogo.ano}`.toLowerCase().includes(busca.toLowerCase())
      : false;
    
    // Verificar categoria selecionada
    let matchCategoria = true;
    if (categoriaSelecionada && jogo) {
      if (Array.isArray(jogo.categorias)) {
        matchCategoria = jogo.categorias.includes(categoriaSelecionada);
      } else if (typeof jogo.categorias === 'string') {
        matchCategoria = jogo.categorias.split(',').includes(categoriaSelecionada);
      } else {
        matchCategoria = false;
      }
    }

    return matchBusca && matchCategoria;
  });

  if (loading) return <div className="text-center mt-20 text-white">Carregando...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;

  return (
    <div className="catalog-wrapper">
      <ToastAlert 
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
      <h1 className="text-4xl font-bold text-center mb-8">Catálogo de Jogos</h1>

      <div className="search-filter-container">
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
        
        <div className="filter-box">
          <div className="select-wrapper">
            <select
              value={categoriaSelecionada}
              onChange={(e) => setCategoriaSelecionada(e.target.value)}
              className="category-select"
            >
              <option value="">Todas as categorias</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.nome}>
                  {cat.nome}
                </option>
              ))}
            </select>
            <IonIcon icon={pricetag} className="select-icon" />
          </div>
        </div>
      </div>

      {jogosFiltrados.length > 0 ? (
        <div className="cards-container">
          {jogosFiltrados.map(jogo => (
            <div key={jogo.id} className="game-card" onClick={() => setJogoSelecionado(jogo)}>
              <div className="card-front-image">
                <img
                  src={jogo.imagem}
                  alt={jogo.nome}
                  className="card-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=Imagem+Indisponível";
                  }}
                />
                <div className="card-content">
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">{jogo.nome}</h2>
                    <p className="text-sm text-white">Ano: {jogo.ano}</p>
                    <p className="text-sm text-white mb-2">Descrição: {jogo.genero}</p>
                    
                    {/* Renderização segura das categorias */}
                    {jogo.categorias && (
                      Array.isArray(jogo.categorias) ? 
                        jogo.categorias.length > 0 && (
                          <div className="category-tags">
                            <div className="flex items-center gap-1 mb-1 text-xs text-cyan-400">
                              <IonIcon icon={pricetag} />
                              <span>Categorias:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {jogo.categorias.map((categoria, index) => (
                                <span 
                                  key={index} 
                                  className="game-tag"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCategoriaSelecionada(categoria);
                                  }}
                                >
                                  {categoria}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      : typeof jogo.categorias === 'string' && jogo.categorias && (
                          <div className="category-tags">
                            <div className="flex items-center gap-1 mb-1 text-xs text-cyan-400">
                              <IonIcon icon={pricetag} />
                              <span>Categorias:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {jogo.categorias.split(',').map((categoria, index) => (
                                <span 
                                  key={index} 
                                  className="game-tag"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCategoriaSelecionada(categoria.trim());
                                  }}
                                >
                                  {categoria.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                    )}
                  </div>
                </div>
              </div>
              <div className="card-faders">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="card-fader" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center mt-12">
          <p className="text-xl text-gray-400">Nenhum jogo encontrado</p>
        </div>
      )}

      {jogoSelecionado && (
        <JogoModal
          jogo={jogoSelecionado}
          onClose={() => {
            // Primeiro, fecha o modal
            setJogoSelecionado(null);
            
            // Depois recarrega os jogos com um pequeno atraso para evitar conflitos
            setTimeout(() => {
              if (isMountedRef.current) { // Verifica se o componente ainda está montado
                carregarJogos();
              }
            }, 300);
          }}
          onUpdate={handleAtualizar}
          onDelete={handleExcluir}
        />
      )}
    </div>
  );
}

export default Catalogo;
