import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <div className="home-banner">
                <img
                    src="/logo192.png"
                    alt="DevLab Banner"
                    className="home-banner-img"
                />
            </div>
            <div className="home-descricao">
                <h1>Bem-vindo ao DevLab!</h1>
                <p>
                    O DevLab é uma plataforma dedicada à conexão entre talentos e oportunidades no mercado de tecnologia.
                    Nosso objetivo é facilitar o processo seletivo, tornando-o mais transparente, ágil e acessível para candidatos e empresas.
                </p>
                <p>
                    Cadastre-se, explore vagas, participe das etapas do processo e conquiste seu espaço no mundo tech!
                </p>
            </div>
            <button
                className="btn-vagas"
                onClick={() => navigate("/inicio")}
            >
                Ver Vagas
            </button>
        </div>
    );
};

export default Home;