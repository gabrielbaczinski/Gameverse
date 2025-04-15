import React, { useState } from 'react';

function CriarJogo() {
  const [nome, setNome] = useState('');
  const [ano, setAno] = useState('');
  const [genero, setGenero] = useState('');
  const [imagem, setImagem] = useState('');

  // Função para enviar o novo jogo para o backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    const jogo = {
      nome,
      ano,
      genero,
      imagem,
    };

    try {
      const response = await fetch('http://localhost:5000/api/jogos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jogo),
      });

      if (response.ok) {
        alert('Jogo criado com sucesso!');
        setNome('');
        setAno('');
        setGenero('');
        setImagem('');
      } else {
        alert('Erro ao criar o jogo.');
      }
    } catch (error) {
      alert('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Criar Novo Jogo</h1>

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome:
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="ano" className="block text-sm font-medium text-gray-700">
              Ano:
            </label>
            <input
              type="number"
              id="ano"
              name="ano"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="genero" className="block text-sm font-medium text-gray-700">
              Gênero:
            </label>
            <input
              type="text"
              id="genero"
              name="genero"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="imagem" className="block text-sm font-medium text-gray-700">
              Imagem (URL):
            </label>
            <input
              type="text"
              id="imagem"
              name="imagem"
              value={imagem}
              onChange={(e) => setImagem(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
          >
            Criar Jogo
          </button>
        </form>
      </div>
    </div>
  );
}

export default CriarJogo;
