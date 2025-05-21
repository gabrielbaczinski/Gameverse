import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import JogoModal from "../componentes/JogoModal";

function Catalogo() {
  const [jogos, setJogos] = useState([]);
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

  const handleAtualizar = (jogoAtualizado) => {
    setJogos(jogos.map(j => j.id === jogoAtualizado.id ? jogoAtualizado : j));
  };

  const handleExcluir = (idJogo) => {
    setJogos(jogos.filter(j => j.id !== idJogo));
  };

  const jogosFiltrados = jogos.filter((jogo) =>
    `${jogo.nome} ${jogo.genero} ${jogo.ano}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  if (loading) return <div className="text-center mt-20 text-white">Carregando...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold text-center mb-8">Catálogo de Jogos</h1>

      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Buscar por nome, gênero ou ano..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full max-w-md px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-wrap gap-8 justify-center">
        {jogosFiltrados.map((jogo) => (
          <div
            key={jogo.id}
            className="relative group cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-105 will-change-transform"
          >
            <div className="relative z-10">
              <img
                src={jogo.imagem}
                alt={jogo.nome}
                className="w-[250px] h-[370px] object-cover rounded-2xl shadow-lg will-change-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-2xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out">
                <h2 className="text-xl font-bold">{jogo.nome}</h2>
                <p className="text-sm">Ano: {jogo.ano}</p>
                <p className="text-sm mb-2">Gênero: {jogo.genero}</p>
                <button
                  onClick={() => setJogoSelecionado(jogo)}
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition w-full"
                >
                  Veja Mais
                </button>
              </div>
            </div>

            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
              {[...Array(3)].map((_, i) => (
                <img
                  key={i}
                  src={jogo.imagem}
                  alt=""
                  className={`absolute w-full h-full object-cover opacity-10 blur-sm scale-110 ${i % 2 === 0 ? "animate-fadeLeft" : "animate-fadeRight"
                    }`}
                  style={{
                    animationDelay: `${i * 0.4}s`,
                    top: 0,
                    left: 0,
                    animationTimingFunction: "ease-in-out",
                    willChange: "transform, opacity"
                  }}
                />
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
