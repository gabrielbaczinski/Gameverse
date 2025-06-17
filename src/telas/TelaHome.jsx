import React from 'react';
import "./../componentes/style.css";

function TelaHome() {
  return (
    <div className="wrapper min-h-screen flex items-center justify-center p-6">
      <div className="login-box text-center bg-black bg-opacity-50 p-10 rounded-lg shadow-lg max-w-xl w-full">
        <form>
          <h2 className="text-4xl font-bold text-white mb-4">🎮 GameVerse</h2>

          <div className="element-box mb-6">
            <p className="text-white text-lg">
              Crie seu catálogo personalizado, adicione jogos favoritos e organize por categorias do seu jeito.
            </p>
          </div>

          <div className="element-box flex justify-center space-x-4">
            <button
              type="button"
              className="w-40 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Comece Agora
            </button>
            <button
              type="button"
              className="w-40 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Saiba Mais
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TelaHome;
