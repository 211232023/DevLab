import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/inicio">Logo</Link>
            </div>
            <ul className="navbar-menu">
                <li><Link to="/etapas/:vagaId">Etapas</Link></li>
                <li><Link to="/perfil">Perfil</Link></li>
                <li><Link to="/teste">Teste</Link></li>
                <li><Link to="/candidaturas">Minhas Candidaturas</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/cadastro">Cadastro</Link></li>
                <li><Link to="/cadastroVaga">Cadastro das Vagas</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;