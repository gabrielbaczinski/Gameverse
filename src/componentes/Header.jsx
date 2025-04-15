// Header.js
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <header className="bg-gray-800 text-white p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">GameVerse</h1>
                <nav>
                    <ul className="flex space-x-6">
                        <li>
                            <Link to="/" className="hover:text-gray-400">Home</Link>
                        </li>
                        <li>
                            <Link to="/criarjogo" className="hover:text-gray-400">Criar Jogo</Link>
                        </li>
                        <li>
                            <a href="/catalogo" className="hover:text-gray-400">Catálogo</a>
                        </li>
                        <li>
                            <Link to="/cadastro" className="hover:text-gray-400">Cadastro</Link>
                        </li>
                        <li>
                            <Link to="/login" className="hover:text-gray-400">Login</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
