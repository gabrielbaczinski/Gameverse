import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IonIcon } from '@ionic/react';
import { cloudUploadOutline, globeOutline } from 'ionicons/icons';
import ToastAlert from '../componentes/Toast';

function CriarJogo() {
  const [nome, setNome] = useState('');
  const [ano, setAno] = useState('');
  const [genero, setGenero] = useState('');
  const [imagem, setImagem] = useState(null);
  const [imagemUrl, setImagemUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tipoImagem, setTipoImagem] = useState('upload'); // 'upload' ou 'url'
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'error'
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Função para alternar entre os métodos
  const alternarMetodo = (metodo) => {
    setTipoImagem(metodo);
    if (metodo === 'upload') {
      setImagemUrl('');
    } else {
      setImagem(null);
      if (previewUrl && !previewUrl.startsWith('http')) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // Resetar URL quando fizer upload
      setImagemUrl('');
      setTipoImagem('upload');
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImagemUrl(url);
    setTipoImagem('url');
    // Resetar upload quando inserir URL
    setImagem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    const formDataToSend = new FormData();
    formDataToSend.append("nome", nome);
    formDataToSend.append("ano", ano);
    formDataToSend.append("genero", genero);
    
    // Enviar imagem ou URL dependendo da escolha
    if (tipoImagem === 'upload' && imagem) {
      formDataToSend.append("imagem", imagem);
    } else if (tipoImagem === 'url' && imagemUrl) {
      formDataToSend.append("imagemUrl", imagemUrl);
    } else {
      setToast({
        show: true,
        message: 'Por favor, selecione uma imagem ou forneça uma URL válida.',
        type: 'error'
      });
      return;
    }
    
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/jogos", formDataToSend, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });

      // Ajuste aqui: agora aceita 200 OU 201 como sucesso
      if (response.status === 200 || response.status === 201) {
        setToast({
          show: true,
          message: response.data.message || 'Jogo criado com sucesso!',
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
        message: error.response?.data?.message || 'Erro de conexão com o servidor.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Gerar anos para o selector (1952 até o ano atual + 5)
  const anoAtual = new Date().getFullYear();
  const anosDisponiveis = [];
  for (let ano = anoAtual + 5; ano >= 1952; ano--) {
    anosDisponiveis.push(ano);
  }

  return (
    <div className="wrapper">
      <div className="jogo-box">
        <ToastAlert 
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
        
        <form onSubmit={handleSubmit}>
          <h2 className="text-center w-full">Criar Novo Jogo</h2>

          <div className="element-box-row flex justify-center" style={{ maxWidth: '400px', marginBottom: '0px' }}>
            <div className="input-box" >
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder=" "
              />
              <label>Nome</label>
            </div>

            <div className="input-box modal-input year-select-container">
              <input
                type="number"
                name="ano"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                placeholder=" "
                min="1950"
                max="2030"
                required
              />
              <label>Ano</label>
              {/* Opcional: Botões customizados para incrementar/decrementar */}
              <div className="year-control-buttons">
                <button 
                  type="button" 
                  className="year-button up" 
                  onClick={() => setAno(prev => Number(prev) + 1)}
                  tabIndex="-1" // Remove do fluxo de tabulação
                >
                  ▲
                </button>
                <button 
                  type="button" 
                  className="year-button down" 
                  onClick={() => setAno(prev => Math.max(1950, Number(prev) - 1))}
                  tabIndex="-1" // Remove do fluxo de tabulação
                >
                  ▼
                </button>
              </div>
            </div>

            <div className="input-box">
              <input
                type="text"
                required
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                placeholder=" "
              />
              <label>Descrição</label>
            </div>
          </div>

          <div className="element-box-row text-white flex items-center" style={{ maxHeight: '50px' }}>
              <div className="flex justify-center gap-4" style={{ maxWidth: '200px' }}>
                <h3 className="mb-3">Upload</h3>   
                <button 
                  type="button"
                  className={`method-btn ${tipoImagem === 'upload' ? 'active' : ''}`}
                  onClick={() => alternarMetodo('upload')}
                >
                  <IonIcon icon={cloudUploadOutline} className="text-xl" />
                </button>
                
                <button 
                  type="button"
                  className={`method-btn ${tipoImagem === 'url' ? 'active' : ''}`}
                  onClick={() => alternarMetodo('url')}
                >
                  <IonIcon icon={globeOutline} className="text-xl" />
                </button>
              </div>

              {tipoImagem === 'upload' ? (
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="imagem-input"
                    name="imagem"
                    onChange={handleImageChange}
                    className="hidden-file-input"
                    accept="image/*"
                  />
                  <label htmlFor="imagem-input" className="file-upload-btn">
                    <IonIcon icon={cloudUploadOutline} />
                    Selecionar Imagem
                  </label>
                  {imagem && (
                    <span className="selected-file-name">
                      {imagem.name}
                    </span>
                  )}
                </div>
              ) : (
                <div className="input-box" style={{ maxWidth: '250px', maxHeight: '45px' }}>
                  <input
                    type="text"
                    value={imagemUrl}
                    onChange={handleImageUrlChange}
                    placeholder=" "
                  />
                  <label>URL da Imagem</label>
                </div>
              )}

            {previewUrl && (
              <div className="input-box mt-4 flex justify-center">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-xs max-h-48 rounded border border-gray-600"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150?text=Imagem+não+encontrada";
                    setToast({
                      show: true,
                      message: 'A URL da imagem parece ser inválida.',
                      type: 'warning'
                    });
                  }}
                />
              </div>
            )}
          </div>

          <div className="element-box text-center">
            <button
              type="submit"
              className="w-40 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
