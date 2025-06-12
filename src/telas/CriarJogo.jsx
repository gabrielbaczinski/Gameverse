import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ToastAlert from '../componentes/Toast';

function CriarJogo() {
  const [nome, setNome] = useState('');
  const [ano, setAno] = useState('');
  const [genero, setGenero] = useState('');
  const [imagem, setImagem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'error'
  });
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionadas, setCategoriaSelecionadas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]); // Verificação do token ao carregar o componente

  useEffect(() => {
    // Carregar categorias disponíveis
    const carregarCategorias = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categorias', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setCategorias(data);
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    carregarCategorias();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    const formDataToSend = new FormData();
    formDataToSend.append("nome", nome);
    formDataToSend.append("ano", ano);
    formDataToSend.append("genero", genero);
    if (imagem) {
      formDataToSend.append("imagem", imagem);
    }
    formDataToSend.append('categorias', JSON.stringify(categoriaSelecionadas));
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/jogos", formDataToSend, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });

      if (response.status === 200) {
        setToast({
          show: true,
          message: 'Jogo criado com sucesso!',
          type: 'success'
        });
        setTimeout(() => {
          navigate('/catalogo');
        }, 2000);
      } else {
        setToast({
          show: true,
          message: 'Erro ao criar o jogo.',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro de conexão com o servidor.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper2">
      <div className="cadastro-box">
        <ToastAlert 
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2>Criar Novo Jogo</h2>

          <div className="element-box">
            <div className="input-box">
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder=" "
              />
              <label>Nome</label>
            </div>
          </div>

          <div className="element-box">
            <div className="input-box">
              <input
                type="number"
                required
                min="1952"
                max={new Date().getFullYear()+5}
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                placeholder=" "
              />
              <label>Ano</label>
            </div>
          </div>

          <div className="element-box">
            <div className="input-box">
              <input
                type="text"
                required
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                placeholder=" "
              />
              <label>Gênero</label>
            </div>
          </div>

          <div className="element-box">
            <div className="input-box">
              <input
                type="file"
                name="imagem"
                onChange={handleImageChange}
                className="form-input"
                accept="image/*"
                required
              />
            </div>
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Categorias
            </label>
            <select
              multiple
              value={categoriaSelecionadas}
              onChange={(e) => setCategoriaSelecionadas(
                Array.from(e.target.selectedOptions, option => option.value)
              )}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="element-box">
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Jogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CriarJogo;
