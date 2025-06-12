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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('authToken');
    return token && !isTokenExpired(token);
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    if (token && !isTokenExpired(token)) {
      setIsAuthenticated(true);
      if (userId) {
        fetch(`http://localhost:5000/api/usuarios/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(console.error);
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const login = (token, userId) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}
