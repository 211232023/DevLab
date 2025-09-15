import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Importe o hook
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth(); // Use o hook para pegar o estado do usuário e a função de logout
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">DevLab</Link>
      <div className="navbar-links">
        <Link to="/">Vagas</Link>
        {user ? (
          // Links para usuário logado
          <>
            <Link to="/minhas-candidaturas">Minhas Candidaturas</Link>
            <Link to="/perfil">Perfil</Link>
            <button onClick={handleLogout} className="nav-button">Sair</button>
          </>
        ) : (
          // Links para usuário não logado
          <>
            <Link to="/login">Login</Link>
            <Link to="/cadastro">Cadastro</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;