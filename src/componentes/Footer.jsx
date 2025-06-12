import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex justify-center text-teal-600 dark:text-teal-300 sm:justify-start">
            <Link to="/" className="text-xl font-bold">
              GameVerse
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
