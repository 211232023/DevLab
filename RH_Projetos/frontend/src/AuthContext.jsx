import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Tenta carregar o usuário do localStorage ao iniciar
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // FUNÇÃO DE ATUALIZAÇÃO DO USUÁRIO
  const updateUser = async (userData) => {
    if (!user || !user.id) {
      throw new Error("Usuário não autenticado.");
    }

    try {
      const response = await fetch(`http://localhost:3001/api/usuarios/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Atualiza o estado local e o localStorage com os novos dados
        const updatedUserData = { ...user, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        setUser(updatedUserData);
      } else {
        throw new Error(data.error || 'Erro ao atualizar perfil.');
      }
    } catch (error) {
      console.error('Erro na requisição de atualização:', error);
      throw error;
    }
  };


  const value = {
    user,
    login,
    logout,
    updateUser, // Adiciona a função ao contexto
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};