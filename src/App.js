// App.js
import React, { useContext } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './componentes/Header';
import HeaderLog from './componentes/HeaderLog';
import Footer from './componentes/Footer';
import TelaHome from './telas/TelaHome';
import CriarJogo from './telas/CriarJogo';
import Catalogo from './telas/Catalogo';
import TelaCadastro from './telas/TelaCadastro';
import RedefinirSenha from './telas/RedefinirSenha';  
import ResetarSenhaConfirmacao from './telas/ResetarSenhaConfirmacao';
import TelaLogin from './telas/TelaLogin';
import Perfil from './telas/Perfil';// Supondo que você tenha uma função para verificar a expiração do token
import { AuthProvider, AuthContext, isTokenExpired} from './AuthContext';

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token && isTokenExpired(token)) {
      alert("Sua sessão expirou. Faça login novamente.");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      navigate("/login");
    }
  }, [navigate]);

  const { isAuthenticated } = useContext(AuthContext);

  return (
    <>
      {isAuthenticated ? <HeaderLog /> : <Header />}
      <Routes>
        <Route path="/" element={<TelaHome />} />
        <Route path="/criarjogo" element={<CriarJogo />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/cadastro" element={<TelaCadastro />} />
        <Route path="/login" element={<TelaLogin />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/redefinirsenha" element={<RedefinirSenha />} />
        <Route path="/resetar-senha-confirmacao/:token" element={<ResetarSenhaConfirmacao />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
