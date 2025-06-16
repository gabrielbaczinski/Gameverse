import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import JogoModal from "../componentes/JogoModal";
import { IonIcon } from '@ionic/react';
import { pricetag, searchOutline } from 'ionicons/icons';

function Catalogo() {
  const [jogos, setJogos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jogoSelecionado, setJogoSelecionado] = useState(null);
  const navigate = useNavigate();

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

  const handleAtualizar = (jogoAtualizado) => {
    setJogos(jogos.map(j => j.id === jogoAtualizado.id ? jogoAtualizado : j));
  };

  const handleExcluir = (idJogo) => {
    setJogos(jogos.filter(j => j.id !== idJogo));
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
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold text-center mb-8">Catálogo de Jogos</h1>

      <div className="search-filter-container">
        <div className="search-box">
          <div className="input-wrapper">
            <IonIcon icon={searchOutline} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar jogos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="category-filter">
          <select
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as categorias</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.nome}>
                {cat.nome}
              </option>
            ))}
          </select>
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
                    <p className="text-sm text-gray-400">Ano: {jogo.ano}</p>
                    <p className="text-sm text-gray-400 mb-2">Gênero: {jogo.genero}</p>
                    
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
          onClose={() => setJogoSelecionado(null)}
          onUpdate={handleAtualizar}
          onDelete={handleExcluir}
        />
      )}
    </div>
  );
}

export default Catalogo;
