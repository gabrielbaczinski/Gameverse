import React, { useState, useEffect } from "react";
import axios from "axios";

function Catalogo() {
  const [jogos, setJogos] = useState([]);
  const [busca, setBusca] = useState("");

  // Fazendo a requisição para o backend
  useEffect(() => {
    axios.get("http://localhost:5000/api/jogos")
      .then((response) => {
        setJogos(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar os jogos:", error);
      });
  }, []);

  const jogosFiltrados = jogos.filter((jogo) =>
    `${jogo.nome} ${jogo.genero} ${jogo.ano}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Catálogo de Jogos
      </h1>

      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Buscar por nome, gênero ou ano..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {jogosFiltrados.map((jogo) => (
          <div key={jogo.id} className="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
            <img
              src={jogo.imagem}
              alt={jogo.nome}
              className="w-full h-40 object-cover rounded mb-4"
            />
            <h2 className="text-lg font-semibold text-gray-800 mb-1">{jogo.nome}</h2>
            <p className="text-sm text-gray-600">Ano: {jogo.ano}</p>
            <p className="text-sm text-gray-600 mb-4">Gênero: {jogo.genero}</p>
            <button className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Veja Mais
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalogo;
