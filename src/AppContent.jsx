import React, { useContext, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AuthContext, isTokenExpired } from './AuthContext';
import Header from './componentes/Header';
import Footer from './componentes/Footer';
import TelaHome from './telas/TelaHome';
import CriarJogo from './telas/CriarJogo';
import Catalogo from './telas/Catalogo';
import TelaCadastro from './telas/TelaCadastro';
import TelaLogin from './telas/TelaLogin';
import Perfil from './telas/Perfil';
import RedefinirSenha from './telas/RedefinirSenha';
import ResetarSenhaConfirmacao from './telas/ResetarSenhaConfirmacao';
import GerenciarUsuarios from './telas/GerenciarUsuarios';
import GerenciarCategorias from './telas/GerenciarCategorias';

function AppContent() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      navigate('/login');
    }
  }, [navigate]);

  // Debug
  console.log('AppContent render - isAuthenticated:', isAuthenticated);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<TelaHome />} />
        <Route path="/login" element={<TelaLogin />} />
        <Route path="/cadastro" element={<TelaCadastro />} />
        <Route path="/verificar-codigo" element={<TelaCadastro />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/criarjogo" element={<CriarJogo />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/redefinirsenha" element={<RedefinirSenha />} />
        <Route path="/resetar-senha-confirmacao/:token" element={<ResetarSenhaConfirmacao />} />
        <Route path="/categorias" element={<GerenciarCategorias />} />
        <Route path="/usuarios" element={<GerenciarUsuarios />} />
      </Routes>
      <Footer />
    </>
  );
}

export default AppContent;