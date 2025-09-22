import React, { createContext, useState, useContext, useEffect } from 'react';
import api from './api'; // Importe a instância do api para configurar os headers

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      // Garante que o token seja adicionado às requisições ao recarregar a página
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token); // Armazena o token
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Remove o token
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUser = async (userData) => {
    if (!user || !user.id) {
      throw new Error("Usuário não autenticado.");
    }
    try {
      const response = await api.put(`/usuarios/${user.id}`, userData);
      const data = response.data;
      
      const updatedUserData = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      setUser(updatedUserData);
    } catch (error) {
      console.error('Erro na requisição de atualização:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};