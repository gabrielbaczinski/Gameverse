import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      return decoded.exp < now;
    } catch (err) {
      return true;
    }
  };

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Função para verificar se o token expirou
  

  // Função de login
  const login = (token, userId) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);
    setIsAuthenticated(true);
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    window.location.href = '/login'; // Redireciona para a tela de login
  };

  // Verifica o token ao montar o componente
  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (token && isTokenExpired(token)) {
      alert("Sua sessão expirou. Faça login novamente.");
      logout();
    } else {
      setIsAuthenticated(!!token);
    }

    // Verifica a cada minuto se o token ainda é válido
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('authToken');
      if (currentToken && isTokenExpired(currentToken)) {
        alert("Sua sessão expirou. Faça login novamente.");
        logout();
      }
    }, 60000); // a cada 60 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
