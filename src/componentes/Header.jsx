// Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { home, create, book, personAdd, logIn } from 'ionicons/icons';

function Header() {
    return (
        <header className="bg-gray-800 text-white p-4 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">
                    <Link to="/">GameVerse</Link>
                </h1>
                <nav>
                    <ul className="flex space-x-6">
                        <li>
                            <Link to="/" className="hover:text-gray-400 flex items-center">
                                <IonIcon icon={home} className="mr-2" />
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/criarjogo" className="hover:text-gray-400 flex items-center">
                                <IonIcon icon={create} className="mr-2" />
                                Criar Jogo
                            </Link>
                        </li>
                        <li>
                            <Link to="/catalogo" className="hover:text-gray-400 flex items-center">
                                <IonIcon icon={book} className="mr-2" />
                                Catálogo
                            </Link>
                        </li>
                        <li>
                            <Link to="/cadastro" className="hover:text-gray-400 flex items-center">
                                <IonIcon icon={personAdd} className="mr-2" />
                                Cadastro
                            </Link>
                        </li>
                        <li>
                            <Link to="/login" className="hover:text-gray-400 flex items-center">
                                <IonIcon icon={logIn} className="mr-2" />
                                Login
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
