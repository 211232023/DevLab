import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; 
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">DevLab</Link>
      <div className="navbar-links">
        <Link to="/vagas" className="nav-link">Vagas</Link>
        {user ? (
          // Links para usuário logado
          <>
            <Link to="/minhas-candidaturas" className="nav-link">Minhas Candidaturas</Link>
            <Link to="/perfil" className="nav-link">Perfil</Link>
            <button onClick={handleLogout} className="nav-button">Sair</button>
          </>
        ) : (
          // Links para usuário não logado
          <>
            <Link to="/login" className="nav-link">Login/Cadastro</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;