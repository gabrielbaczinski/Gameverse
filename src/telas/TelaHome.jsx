// telas/TelaHome.jsx
import React from 'react';

function TelaHome() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <main className="bg-white p-10 rounded-lg shadow-lg text-center max-w-xl w-full">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Bem-vindo ao GameVerse!</h2>
        <p className="text-lg text-gray-600 mb-6">
          O melhor lugar para encontrar e jogar os jogos mais emocionantes da internet.
        </p>
        <div className="flex justify-center space-x-6">
          <button className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
            Comece Agora
          </button>
          <button className="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-300">
            Saiba Mais
          </button>
        </div>
      </main>
    </div>
  );
}

export default TelaHome;
