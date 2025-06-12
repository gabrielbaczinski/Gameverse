import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import JogoModal from "../componentes/JogoModal";

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

    axios
      .get("http://localhost:5000/api/jogos", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setJogos(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError("Erro ao carregar os jogos.");
        setLoading(false);
        console.error("Erro ao buscar os jogos:", error);
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

  const jogosFiltrados = jogos.filter((jogo) => {
    const matchBusca = `${jogo.nome} ${jogo.genero} ${jogo.ano}`
      .toLowerCase()
      .includes(busca.toLowerCase());
    
    const matchCategoria = categoriaSelecionada 
      ? jogo.categorias?.includes(categoriaSelecionada)
      : true;

    return matchBusca && matchCategoria;
  });

  if (loading) return <div className="text-center mt-20 text-white">Carregando...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold text-center mb-8">Catálogo de Jogos</h1>

      <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Buscar por nome, gênero ou ano..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={categoriaSelecionada}
          onChange={(e) => setCategoriaSelecionada(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as categorias</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.nome}>
              {cat.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="cards-container">
        {jogosFiltrados.map(jogo => (
          <div key={jogo.id} className="game-card" onClick={() => setJogoSelecionado(jogo)}>
            <div className="card-front-image">
              <img
                src={jogo.imagem}
                alt={jogo.nome}
                className="card-image"
              />
              <div className="card-content">
                <h2 className="text-xl font-bold mb-2">{jogo.nome}</h2>
                <p className="text-sm opacity-90">Ano: {jogo.ano}</p>
                <p className="text-sm opacity-90">Gênero: {jogo.genero}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {jogo.categorias?.map((categoria, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-600 rounded-full"
                    >
                      {categoria}
                    </span>
                  ))}
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
