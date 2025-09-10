import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/telaInicial">Logo</Link>
            </div>
            <ul className="navbar-menu">
                <li><Link to="/teste">Teste</Link></li>
                <li><Link to="/minhas-candidaturas">Minhas Candidaturas</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/cadastro">Cadastro</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;