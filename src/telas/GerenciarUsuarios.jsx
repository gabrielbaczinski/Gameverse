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
    try {
      const token = localStorage.getItem('authToken');
      setLoading(true);
      
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
        setToast({
          show: true,
          message: 'Erro ao carregar dados do usuário',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro ao carregar dados para edição',
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

      if (response.ok) {
        const usuarioAtualizado = await response.json();
        setUsuarios(usuarios.map(user => 
          user.id === usuarioAtualizado.id ? usuarioAtualizado : user
        ));
        setFilteredUsuarios(
          filteredUsuarios.map(user => user.id === usuarioAtualizado.id ? usuarioAtualizado : user)
        );
        setToast({
          show: true,
          message: 'Usuário atualizado com sucesso',
          type: 'success'
        });
        setUsuarioEditando(null);
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
          <div className="users-list-container">
            {filteredUsuarios.length > 0 ? (
              <>
                <div className="users-list-header">
                  <div className="user-col id-col">ID</div>
                  <div className="user-col info-col">Informações</div>
                  <div className="user-col actions-col">Ações</div>
                </div>
                
                <div className="users-list-body">
                  {filteredUsuarios.map((usuario) => (
                    <div key={usuario.id} className="user-row">
                      <div className="user-col id-col">
                        <span className="user-id">{usuario.id}</span>
                      </div>
                      
                      <div className="user-col info-col">
                        <div className="user-info">
                          <h4 className="user-name">
                            <IonIcon icon={personOutline} /> 
                            {usuario.nome || 'Sem nome'}
                          </h4>
                          <p className="user-email">
                            <IonIcon icon={mailOutline} /> 
                            {usuario.email || 'E-mail não definido'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="user-col actions-col">
                        <button
                          onClick={() => iniciarEdicao(usuario)}
                          className="user-action-btn edit"
                          title="Editar usuário"
                        >
                          <IonIcon icon={pencil} />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id)}
                          className="user-action-btn delete"
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
          <div className="modal-overlay">
            <div className="user-edit-modal">
              <button 
                onClick={() => setUsuarioEditando(null)}
                className="modal-close-btn"
                aria-label="Fechar"
              >
                <IonIcon icon={closeOutline} />
              </button>

              <div className="modal-header">
                <div className="user-avatar">
                  <IonIcon icon={personOutline} />
                </div>
                <h3>Editar Usuário</h3>
                <p className="modal-subtitle">ID: {usuarioEditando.id}</p>
              </div>

              <form onSubmit={handleEdit}>
                <div className="modal-body">
                  <div className="form-group">
                    <div className="form-icon">
                      <IonIcon icon={personOutline} />
                    </div>
                    <div className="input-box modal-input">
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

                  <div className="form-group">
                    <div className="form-icon">
                      <IonIcon icon={mailOutline} />
                    </div>
                    <div className="input-box modal-input">
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

                  <div className="form-group">
                    <div className="form-icon">
                      <IonIcon icon={shieldOutline} />
                    </div>
                    <div className="input-box modal-input">
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
                  <button 
                    type="button" 
                    className="modal-btn cancel"
                    onClick={() => setUsuarioEditando(null)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="modal-btn save"
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
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