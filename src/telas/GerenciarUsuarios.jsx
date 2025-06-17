import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { pencil, trash, closeOutline, searchOutline, personOutline, mailOutline, shieldOutline } from 'ionicons/icons';
import ToastAlert from '../componentes/Toast';

function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'error'
  });
  const navigate = useNavigate();

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // Filtra usuários quando o termo de busca muda - CORREÇÃO DO ERRO
  useEffect(() => {
    if (searchTerm) {
      const filtered = usuarios.filter(user => 
        (user.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
      setFilteredUsuarios(filtered);
    } else {
      setFilteredUsuarios(usuarios);
    }
  }, [searchTerm, usuarios]);

  const carregarUsuarios = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/usuarios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Usuários carregados:", data); // Para debug
        setUsuarios(data);
        setFilteredUsuarios(data);
      } else {
        setToast({
          show: true,
          message: 'Erro ao carregar usuários',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro de conexão com o servidor',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicao = async (usuario) => {
    // Primeiro definimos o estado para abrir o modal
    setUsuarioEditando({
      id: usuario.id,
      nome: usuario.nome || '',
      email: usuario.email || '',
      senha: '' // Senha vazia para edição
    });
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:5000/api/usuarios/${usuario.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const usuarioCompleto = await response.json();
        setUsuarioEditando({
          id: usuarioCompleto.id,
          nome: usuarioCompleto.nome || '',
          email: usuarioCompleto.email || '',
          senha: '' // Senha vazia para edição
        });
      } else {
        // Mesmo com erro, mantemos o modal aberto com os dados básicos
        setToast({
          show: true,
          message: 'Erro ao carregar dados completos do usuário',
          type: 'error'
        });
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      setToast({
        show: true,
        message: 'Erro de conexão, usando dados básicos',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('authToken');
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setUsuarios(usuarios.filter(user => user.id !== id));
        setFilteredUsuarios(filteredUsuarios.filter(user => user.id !== id));
        setToast({
          show: true,
          message: 'Usuário excluído com sucesso',
          type: 'success'
        });
      } else {
        setToast({
          show: true,
          message: 'Erro ao excluir usuário',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro de conexão com o servidor',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/usuarios/${usuarioEditando.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(usuarioEditando)
      });

      // 3. Substitua o bloco de sucesso no handleEdit:
      if (response.ok) {
        const usuarioAtualizado = await response.json();
        setToast({
          show: true,
          message: 'Usuário atualizado com sucesso',
          type: 'success'
        });
        fecharModal(); // Fecha o modal e recarrega dados atualizados
      } else {
        setToast({
          show: true,
          message: 'Erro ao atualizar usuário',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro de conexão com o servidor',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 1. Modifique a função que fecha o modal para recarregar dados
  const fecharModal = () => {
    setUsuarioEditando(null);
    carregarUsuarios(); // Recarrega todos os usuários ao fechar o modal
  };

  return (
    <div className="wrapper">
      <div className="jogo-box">
        <ToastAlert {...toast} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
        
        <div className="users-header">
          <h2>Gerenciar Usuários</h2>
        </div>

        <div className="search-container">
          <div className="element-box">
            <div className="input-box" style={{ margin: '0'}}>
              <input
                type="text"
                placeholder=" "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <label><IonIcon icon={searchOutline} style={{marginRight: '5px'}}/> Buscar usuários</label>
            </div>
          </div>
        </div>

        {/* Lista de usuários */}
        {loading && !usuarioEditando ? (
          <div className="loading-container">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="glass-list-container">
            {filteredUsuarios.length > 0 ? (
              <>
                <div className="glass-list-header">
                  <div className="glass-col id-col">ID</div>
                  <div className="glass-col info-col">Informações</div>
                  <div className="glass-col actions-col">Ações</div>
                </div>
                
                <div className="glass-list-body">
                  {filteredUsuarios.map((usuario) => (
                    <div key={usuario.id} className="glass-list-row">
                      <div className="glass-col id-col">
                        <span className="user-id">{usuario.id}</span>
                      </div>
                      
                      <div className="glass-col info-col">
                        <div className="user-info">
                          <h4 className="user-name truncate">
                            <IonIcon icon={personOutline} /> 
                            {usuario.nome || 'Sem nome'}
                          </h4>
                        </div>
                      </div>
                      
                      <div className="glass-col actions-col">
                        <button
                          onClick={() => iniciarEdicao(usuario)}
                          className="glass-action-btn edit"
                          title="Editar usuário"
                        >
                          <IonIcon icon={pencil} />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id)}
                          className="glass-action-btn delete"
                          title="Excluir usuário"
                        >
                          <IonIcon icon={trash} />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <IonIcon icon={personOutline} className="empty-icon" />
                <p>Nenhum usuário encontrado</p>
                <span>Tente ajustar sua busca ou adicione novos usuários</span>
              </div>
            )}
          </div>
        )}

        {/* Modal de edição de usuário */}
        {usuarioEditando && (
          <div className="wrapper-modal">
            <div className="modal-container glass-modal">
              <div className="modal-header">
                <h3>Editar Usuário</h3>
                {/* 5. Atualize o botão de fechar no topo do modal: */}
                <button 
                  onClick={fecharModal}
                  className="modal-close-btn"
                  aria-label="Fechar"
                >
                  <IonIcon icon={closeOutline} />
                </button>
              </div>

              <form onSubmit={handleEdit}>
                <div className="modal-body">
                  <div className="element-box">
                    <div className="input-box">
                      <input
                        type="text"
                        value={usuarioEditando.nome}
                        onChange={(e) => setUsuarioEditando(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder=" "
                        required
                      />
                      <label>Nome</label>
                    </div>
                  </div>

                  <div className="element-box">
                    <div className="input-box">
                      <input
                        type="email"
                        value={usuarioEditando.email}
                        onChange={(e) => setUsuarioEditando(prev => ({ ...prev, email: e.target.value }))}
                        placeholder=" "
                        required
                      />
                      <label>Email</label>
                    </div>
                  </div>

                  <div className="element-box">
                    <div className="input-box">
                      <input
                        type="password"
                        value={usuarioEditando.senha || ''}
                        onChange={(e) => setUsuarioEditando(prev => ({ ...prev, senha: e.target.value }))}
                        placeholder=" "
                      />
                      <label>Nova Senha (opcional)</label>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <div className="flex gap-2">
                    {/* 4. Atualize os botões no modal para usar fecharModal: */}
                    <button 
                      type="button" 
                      onClick={fecharModal}
                      className="glass-action-btn cancel"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="glass-action-btn save"
                      disabled={loading}
                    >
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GerenciarUsuarios;