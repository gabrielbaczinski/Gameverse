import React, { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { pencil, trash, add } from 'ionicons/icons';
import ToastAlert from '../componentes/Toast';

function GerenciarCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState({ nome: '', descricao: '' });
  const [editando, setEditando] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  useEffect(() => {
    carregarCategorias();
  }, []);

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
      setToast({
        show: true,
        message: 'Erro ao carregar categorias',
        type: 'error'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editando 
        ? `http://localhost:5000/api/categorias/${editando}` 
        : 'http://localhost:5000/api/categorias';
      
      const method = editando ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(novaCategoria)
      });

      const data = await response.json();
      
      if (response.ok) {
        setToast({
          show: true,
          message: data.toast.message,
          type: 'success'
        });
        carregarCategorias();
        setNovaCategoria({ nome: '', descricao: '' });
        setEditando(null);
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro ao salvar categoria',
        type: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta categoria?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/categorias/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        const data = await response.json();
        
        if (response.ok) {
          setToast({
            show: true,
            message: data.toast.message,
            type: 'success'
          });
          carregarCategorias();
        }
      } catch (error) {
        setToast({
          show: true,
          message: 'Erro ao deletar categoria',
          type: 'error'
        });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastAlert
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />

      <h1 className="text-2xl font-bold mb-6">Gerenciar Categorias</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Nome da categoria"
            value={novaCategoria.nome}
            onChange={(e) => setNovaCategoria(prev => ({ ...prev, nome: e.target.value }))}
            className="flex-1 p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Descrição"
            value={novaCategoria.descricao}
            onChange={(e) => setNovaCategoria(prev => ({ ...prev, descricao: e.target.value }))}
            className="flex-1 p-2 border rounded"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            <IonIcon icon={editando ? pencil : add} className="mr-2" />
            {editando ? 'Atualizar' : 'Adicionar'}
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        {categorias.map((categoria) => (
          <div key={categoria.id} className="flex items-center justify-between p-4 bg-white rounded shadow">
            <div>
              <h3 className="font-bold">{categoria.nome}</h3>
              <p className="text-gray-600">{categoria.descricao}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditando(categoria.id);
                  setNovaCategoria({ nome: categoria.nome, descricao: categoria.descricao });
                }}
                className="p-2 text-blue-500 hover:text-blue-600"
              >
                <IonIcon icon={pencil} />
              </button>
              <button
                onClick={() => handleDelete(categoria.id)}
                className="p-2 text-red-500 hover:text-red-600"
              >
                <IonIcon icon={trash} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GerenciarCategorias;