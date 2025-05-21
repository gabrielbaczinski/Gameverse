import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CriarJogo() {
  const [nome, setNome] = useState('');
  const [ano, setAno] = useState('');
  const [genero, setGenero] = useState('');
  const [imagem, setImagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]); // Verificação do token ao carregar o componente

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken'); // Recuperando o token de autenticação

    if (!token) {
      navigate('/login'); // Redireciona para login se o token não estiver presente
      return;
    }

    const jogo = { nome, ano, genero, imagem };

    setLoading(true); // Inicia o carregamento

    try {
      const response = await fetch('http://localhost:5000/api/jogos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Incluindo o token no cabeçalho
        },
        body: JSON.stringify(jogo),
      });

      if (response.ok) {
        alert('Jogo criado com sucesso!');
        setNome('');
        setAno('');
        setGenero('');
        setImagem('');
        navigate('/catalogo'); // Redireciona para o catálogo de jogos após a criação
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao criar o jogo.');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Criar Novo Jogo</h1>

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-red-500 text-sm">{error}</div>}  {/* Exibindo mensagem de erro */}
          
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
              min="1952"
              max={new Date().getFullYear()+5} // Limita o ano até o ano atual
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
            disabled={loading}  // Desabilita o botão durante o carregamento
          >
            {loading ? 'Criando...' : 'Criar Jogo'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CriarJogo;
