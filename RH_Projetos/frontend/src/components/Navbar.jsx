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

  const renderLinks = () => {
    // Se não houver usuário logado, mostra apenas o link de Login/Cadastro
    if (!user) {
      return (
        <>
          <Link to="/login" className="nav-link">Login/Cadastro</Link>
        </>
      );
    }

  // Se o usuário for um Candidato
    if (user.tipo === 'ADMIN') {
      return (
        <>
          <Link to="/inicio" className="nav-link">Vagas</Link>
          <Link to="/perfil" className="nav-link">Perfil</Link>
          <Link to="/cadastro-vaga" className="nav-link">Cadastrar Vaga</Link>
          <Link to="/minhas-candidaturas" className="nav-link">Minhas Candidaturas</Link>
          <Link to="/gestao-vaga" className="nav-link">Gestão de Vaga</Link>
          <button onClick={handleLogout} className="nav-button">Sair</button>
        </>
      );
    }

    // Se o usuário for um Candidato
    if (user.tipo === 'CANDIDATO') {
      return (
        <>
          <Link to="/inicio" className="nav-link">Vagas</Link>
          <Link to="/minhas-candidaturas" className="nav-link">Minhas Candidaturas</Link>
          <Link to="/perfil" className="nav-link">Perfil</Link>
          <button onClick={handleLogout} className="nav-button">Sair</button>
        </>
      );
    }

    // Se o usuário for do RH
    if (user.tipo === 'RH') {
      return (
        <>
          <Link to="/cadastro-vaga" className="nav-link">Cadastrar Vaga</Link>
          <Link to="/gestao-vagas" className="nav-link">Gerenciar Vagas</Link>
          <button onClick={handleLogout} className="nav-button">Sair</button>
        </>
      );
    }

    // Fallback caso o tipo de usuário não seja reconhecido
    return null;
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo"><img src="/logo2.png" className='logoNavbar'/></Link>
      <div className="navbar-links">
        {renderLinks()}
      </div>
    </nav>
  );
};

export default Navbar;