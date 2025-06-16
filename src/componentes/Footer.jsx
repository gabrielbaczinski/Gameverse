import React from 'react';
import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { gameControllerOutline} from 'ionicons/icons';

function Footer() {
  return (
    <footer className="bg-gray-900 border-b border-gray-800">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex justify-center text-teal-600 dark:text-teal-300 sm:justify-start">
            <Link className="block text-blue-600 flex items-center gap-2" to="/">
              <span className="text-white text-xl"><p><strong>Gameverse</strong> &copy; 2025 - Todos os direitos reservados.</p></span>
            </Link>
          </div>

          <nav className="mt-4 flex flex-wrap justify-center gap-4 text-sm sm:mt-0 sm:justify-start">
            <Link to="/about" className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75">
              Sobre
            </Link>
            <Link to="/privacy" className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75">
              Privacidade
            </Link>
            <Link to="/terms" className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75">
              Termos
            </Link>
          </nav>
        </div>

        
      </div>
    </footer>
  );
}

export default Footer;
