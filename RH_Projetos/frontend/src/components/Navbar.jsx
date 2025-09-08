import React from "react";
import "./Navbar.css";

const Navbar = () => {
    return (
        <nav className="navbar">
            <ul className="navbar-menu">
                <li><a href="/minhas-vagas">Minhas Vagas</a></li>
                <li><a href="/login">Login</a></li>
                <li><a href="/cadastro">Cadastro</a></li>
            </ul>
        </nav>
    );
};

export default Navbar;