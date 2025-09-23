import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Importa NavLink
import { useAuth } from '../AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getLinks = () => {
        if (!user) {
            return <NavLink to="/login" className="nav-link">Login/Cadastro</NavLink>;
        }

        const baseLinks = [
            { to: "/inicio", text: "Vagas" },
            { to: "/perfil", text: "Perfil" }
        ];

        const roleLinks = {
            ADMIN: [
                ...baseLinks,
                { to: "/cadastro-vaga", text: "Cadastrar Vaga" },
                { to: "/minhas-candidaturas", text: "Minhas Candidaturas" },
                { to: "/gestao-vaga", text: "Gestão de Vaga" }
            ],
            CANDIDATO: [
                ...baseLinks,
                { to: "/minhas-candidaturas", text: "Minhas Candidaturas" }
            ],
            RH: [
                ...baseLinks,
                { to: "/cadastro-vaga", text: "Cadastrar Vaga" },
                { to: "/gestao-vaga", text: "Gerenciar Vagas" },
                { to: "/gestao-candidato", text: "Gestão dos candidatos" }
            ]
        };

        const links = roleLinks[user.tipo] || [];

        return (
            <>
                {links.map(link => (
                    <NavLink key={link.to} to={link.to} className="nav-link">
                        {link.text}
                    </NavLink>
                ))}
                <button onClick={handleLogout} className="nav-button">Sair</button>
            </>
        );
    };

    return (
        <nav className="navbar">
            <NavLink to="/" className="navbar-logo">
                <img src="/logo2.png" alt="Logo DevLab" className='logoNavbar'/>
            </NavLink>
            <div className="navbar-links">
                {getLinks()}
            </div>
        </nav>
    );
};

export default Navbar;