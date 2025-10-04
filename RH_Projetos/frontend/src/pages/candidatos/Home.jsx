import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaUserCheck, FaChartLine } from 'react-icons/fa';
import "./Home.css";
import Button from "../../components/Button";
import { useAuth } from "../../AuthContext"; 

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); 

    const handleVagasClick = () => {
        if (user) {
            navigate("/inicio");
        } else {
            navigate("/login");
        }
    };

    return (
        <div className="home-page">
            <header className="hero-section">
                <div className="hero-content">
                    <img
                        src="/devlabLogo.png"
                        alt="DevLab Logo"
                        className="hero-logo"
                    />
                    <h1 className="hero-title">Conectando Talentos, Construindo o Futuro da Tecnologia</h1>
                    <p className="hero-subtitle">
                        Sua jornada para a vaga dos sonhos começa aqui. Explore, candidate-se e destaque-se no mundo tech.
                    </p>
                    <Button
                        className="hero-cta-button"
                        onClick={handleVagasClick}
                    >
                        Encontrar Vagas
                    </Button>
                </div>
            </header>

            <section className="features-section">
                <h2 className="section-title">Por que usar a DevLab?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <FaSearch className="feature-icon" />
                        <h3>Vagas Atualizadas</h3>
                        <p>Acesse um painel com as melhores e mais recentes oportunidades do mercado de tecnologia.</p>
                    </div>
                    <div className="feature-card">
                        <FaUserCheck className="feature-icon" />
                        <h3>Processo Simplificado</h3>
                        <p>Candidate-se de forma rápida e acompanhe todas as etapas do seu processo seletivo em um só lugar.</p>
                    </div>
                    <div className="feature-card">
                        <FaChartLine className="feature-icon" />
                        <h3>Crescimento de Carreira</h3>
                        <p>Dê o próximo passo na sua carreira com as ferramentas e oportunidades que só a DevLab oferece.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;