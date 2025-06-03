// Header.js
import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { create, book, personCircle } from 'ionicons/icons';

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
                            <Link to="/perfil" className="hover:text-gray-400 flex items-center">
                                <IonIcon icon={personCircle} className="mr-2" />
                                Perfil
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
