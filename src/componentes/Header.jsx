import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { create, book, personCircle, logOut, menu, close, listOutline } from 'ionicons/icons';
import { AuthContext } from '../AuthContext';

function Header() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isAuthenticated) {
    return (
      <header className="bg-white dark:bg-gray-900 sticky top-0 z-50">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-1 md:flex md:items-center md:gap-12">
              <Link to="/" className="text-2xl font-bold text-teal-600 dark:text-teal-300">
                GameVerse
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-gray-600 dark:text-white"
              >
                <IonIcon icon={isMobileMenuOpen ? close : menu} className="h-6 w-6" />
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className={`${isMobileMenuOpen ? 'block' : ''} absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 md:static`}>
              <ul className="flex flex-col md:flex-row items-center gap-6 text-sm p-4 md:p-0">
                <li>
                  <Link to="/criarjogo" className="flex items-center gap-2 text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75">
                    <IonIcon icon={create} />
                    Criar Jogo
                  </Link>
                </li>
                <li>
                  <Link to="/catalogo" className="flex items-center gap-2 text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75">
                    <IonIcon icon={book} />
                    Catálogo
                  </Link>
                </li>
                <li>
                  <Link to="/perfil" className="flex items-center gap-2 text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75">
                    <IonIcon icon={personCircle} />
                    Perfil
                  </Link>
                </li>
                <li>
                  <Link to="/categorias" className="flex items-center gap-2 text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75">
                    <IonIcon icon={listOutline} />
                    Categorias
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-500 transition hover:text-red-500/75"
                  >
                    <IonIcon icon={logOut} />
                    Sair
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    );
  }

  // Header para usuários não autenticados
  return (
    <header className="bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-teal-600 dark:text-teal-300">
            GameVerse
          </Link>
          
          <nav>
            <ul className="flex items-center gap-6 text-sm">
              <li>
                <Link to="/login" className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/cadastro" className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75">
                  Cadastro
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
