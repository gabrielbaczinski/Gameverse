import React, { useState } from 'react';
import axios from 'axios';
import { IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';

export default function JogoModal({ jogo, onClose, onUpdate, onDelete }) {
  const [formData, setFormData] = useState({
    nome: jogo.nome,
    ano: jogo.ano,
    genero: jogo.genero,
    imagem: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevState) => ({
      ...prevState,
      imagem: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    const formDataToSend = new FormData();
    formDataToSend.append("nome", formData.nome);
    formDataToSend.append("ano", formData.ano);
    formDataToSend.append("genero", formData.genero);
    if (formData.imagem) {
      formDataToSend.append("imagem", formData.imagem);
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/jogos/${jogo.id}`, formDataToSend, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });
      onUpdate(response.data);
      onClose();
    } catch (err) {
      alert("Erro ao atualizar: " + (err.response?.data?.error || err.message));
      console.error("Erro ao atualizar:", err);
    }
  };

  const excluirJogo = async () => {
    if (window.confirm('Tem certeza que deseja excluir este jogo?')) {
      const token = localStorage.getItem("authToken");

      try {
        await axios.delete(`http://localhost:5000/api/jogos/${jogo.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        onDelete(jogo.id);
        onClose();
      } catch (err) {
        alert("Erro ao deletar: " + (err.response?.data?.error || err.message));
        console.error("Erro ao deletar:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-md shadow-xl relative">
        <button 
          onClick={onClose} 
          className="absolute w-7 h-7 top-2 right-2 p-1 hover:bg-gray-700 rounded-full transition-colors"
        >
          <IonIcon icon={closeOutline} className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-4">Editar Jogo</h2>

        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label className="modal-label">Nome</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="modal-input"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-label">Ano</label>
            <input
              type="number"
              name="ano"
              value={formData.ano}
              onChange={handleChange}
              className="modal-input"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-label">Gênero</label>
            <input
              type="text"
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              className="modal-input"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-label">Nova Imagem</label>
            <input
              type="file"
              name="imagem"
              onChange={handleImageChange}
              className="modal-input"
              accept="image/*"
            />
          </div>

          <div className="flex gap-2 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={excluirJogo}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
            >
              Excluir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
