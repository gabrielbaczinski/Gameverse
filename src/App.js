import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './componentes/Header';
import Footer from './componentes/Footer';
import TelaLogin from './telas/TelaLogin';
import TelaCadastro from './telas/TelaCadastro';
import TelaHome from './telas/TelaHome';  
import Catalogo from './telas/Catalogo';
import CriarJogo from './telas/CriarJogo';// Importe a TelaHome

function App() {
  return (
    <Router>
      <Header /> 
      <Routes>
        <Route path="/" element={<TelaHome />} /> 
        <Route path="/criarjogo" element={<CriarJogo />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/cadastro" element={<TelaCadastro />} />
        <Route path="/login" element={<TelaLogin />} />
      </Routes>
      <Footer /> 
    </Router>
  );
}

export default App;
