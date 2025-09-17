import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = async (userData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/usuarios/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        // Se a resposta não for OK, vamos tentar ler como texto para ver o erro
        const errorText = await response.text();
        try {
            // Tenta interpretar como JSON para pegar a mensagem de erro específica
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || 'Erro ao atualizar o usuário.');
        } catch (e) {
            // Se não for JSON, provavelmente é um erro de servidor (HTML)
            console.error("Erro do servidor:", errorText);
            throw new Error(`Erro do servidor: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
      console.error('Erro na requisição de atualização:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};