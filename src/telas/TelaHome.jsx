import React from 'react';
import "./../componentes/style.css"; // Caminho do CSS

function TelaHome() {
  return (
    <div className="wrapper2">
      <div className="login-box text-center">
        <form>
          <h2>GameVerse</h2>

          <div className="element-box">
            <p className="text-white">
              O melhor lugar para encontrar e jogar os jogos mais emocionantes da internet.
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
