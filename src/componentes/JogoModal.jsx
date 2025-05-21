import React, { useState } from 'react';
import axios from 'axios';

export default function JogoModal({ jogo, onClose, onUpdate, onDelete }) {
  const [editando, setEditando] = useState(false);
  const [dados, setDados] = useState({ ...jogo });

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value });
  };

  const salvarAlteracoes = () => {
    const token = localStorage.getItem("authToken");

    axios.put(`http://localhost:5000/api/jogos/${jogo.id}`, dados, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        onUpdate(res.data); // agora receberá o jogo atualizado
        setEditando(false);
      })
      .catch((err) => {
        alert("Erro ao atualizar: " + (err.response?.data?.error || err.message));
        console.error("Erro ao atualizar:", err);
      });
  };

  const excluirJogo = () => {
    const token = localStorage.getItem("authToken");

    axios.delete(`http://localhost:5000/api/jogos/${jogo.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        onDelete(jogo.id);
        onClose();
      })
      .catch((err) => {
        alert("Erro ao deletar: " + (err.response?.data?.error || err.message));
        console.error("Erro ao deletar:", err);
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-lg w-full max-w-md shadow-xl relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-xl font-bold">×</button>

        <h2 className="text-2xl font-bold mb-4">{editando ? "Editar Jogo" : jogo.nome}</h2>

        {editando ? (
          <>
            <input
              name="nome"
              value={dados.nome}
              onChange={handleChange}
              placeholder="Nome do jogo"
              className="mb-2 w-full p-2 border rounded"
            />
            <input
              name="ano"
              value={dados.ano}
              onChange={handleChange}
              placeholder="Ano de lançamento"
              className="mb-2 w-full p-2 border rounded"
            />
            <input
              name="genero"
              value={dados.genero}
              onChange={handleChange}
              placeholder="Gênero"
              className="mb-2 w-full p-2 border rounded"
            />
            <input
              name="imagem"
              value={dados.imagem}
              onChange={handleChange}
              placeholder="URL da imagem"
              className="mb-4 w-full p-2 border rounded"
            />
            <button onClick={salvarAlteracoes} className="bg-blue-600 text-white px-4 py-2 rounded mr-2">Salvar</button>
            <button onClick={() => setEditando(false)} className="bg-gray-400 px-4 py-2 rounded">Cancelar</button>
          </>
        ) : (
          <>
            <img src={jogo.imagem} alt={jogo.nome} className="w-full h-56 object-cover rounded mb-4" />
            <p><strong>Ano:</strong> {jogo.ano}</p>
            <p><strong>Gênero:</strong> {jogo.genero}</p>
            <div className="mt-4 flex justify-end space-x-4">
              <button onClick={() => setEditando(true)} className="bg-yellow-500 text-white px-4 py-2 rounded">Editar</button>
              <button onClick={excluirJogo} className="bg-red-600 text-white px-4 py-2 rounded">Excluir</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
