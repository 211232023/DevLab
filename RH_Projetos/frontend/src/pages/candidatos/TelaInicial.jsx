import React, { useState, useEffect } from "react";
import "./TelaInicial.css";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import Button from "../../components/Button";
import { FaBriefcase, FaMoneyBillWave, FaCalendarAlt, FaChevronDown } from 'react-icons/fa';

const TelaInicial = () => {
    const [vagas, setVagas] = useState([]);
    const [expandido, setExpandido] = useState(null);
    const navigate = useNavigate();

    // Função para candidatar-se (movida para dentro para clareza)
    const candidatarVaga = (vaga) => {
        const candidaturas = JSON.parse(localStorage.getItem("candidaturas")) || [];
        if (!candidaturas.find((v) => v.id === vaga.id)) {
            candidaturas.push(vaga);
            localStorage.setItem("candidaturas", JSON.stringify(candidaturas));
        }
    };

    useEffect(() => {
        const fetchVagas = async () => {
            try {
                const response = await api.get("/vagas");
                setVagas(response.data);
            } catch (error) {
                console.error("Erro ao buscar vagas:", error);
            }
        };
        fetchVagas();
    }, []);

    const toggleExpandir = (id) => {
        setExpandido(expandido === id ? null : id);
    };

    const formatarData = (dataString) => {
        if (!dataString) return 'N/A';
        const dataCorrigida = dataString.replace(' ', 'T');
        return new Date(dataCorrigida).toLocaleDateString();
    };

    return (
        <div className="vagas-page-wrapper">
            <header className="vagas-header-simple">
                <h1>Vagas Disponíveis</h1>
                <p>Explore as oportunidades abaixo e encontre a que mais combina com você.</p>
            </header>

            <main className="vagas-list">
                {vagas.length > 0 ? vagas.map((vaga) => (
                    <div key={vaga.id} className={`vaga-card ${expandido === vaga.id ? "expanded" : ""}`}>
                        <div className="vaga-header">
                            <div className="vaga-header-main">
                                <h2 className="vaga-titulo">{vaga.titulo}</h2>
                                <br />
                                <div className="vaga-tags">
                                    <span className="tag tag-area"><FaBriefcase /> {vaga.area}</span>
                                    <span className="tag tag-salario"><FaMoneyBillWave /> R$ {parseFloat(vaga.salario).toFixed(2)}</span>
                                </div>
                            </div>
                            <button className="btn-expand" onClick={() => toggleExpandir(vaga.id)} aria-expanded={expandido === vaga.id}>
                                <FaChevronDown className="expand-icon" />
                            </button>
                        </div>

                        <div className="vaga-detalhes">
                            <div className="vaga-detalhes-content">
                                <h4>Descrição da Vaga</h4>
                                <p>{vaga.descricao}</p>
                                
                                <h4>Benefícios</h4>
                                <p>{vaga.beneficios}</p>

                                <h4>Escala de Trabalho</h4>
                                <p>{vaga.escala_trabalho}</p>
                                
                                <div className="vaga-datas">
                                    <FaCalendarAlt />
                                    <span><strong>Abertura:</strong> {formatarData(vaga.data_Abertura)}</span>
                                    <span><strong>Fechamento:</strong> {formatarData(vaga.data_fechamento)}</span>
                                </div>

                                <div className="vaga-footer-expanded">
                                     <Button
                                        className="btn-candidatar"
                                        onClick={() => {
                                            const vagaParaCandidatar = { ...vaga, nome: vaga.titulo };
                                            candidatarVaga(vagaParaCandidatar);
                                            navigate(`/inscricao/${vaga.id}`);
                                        }}
                                    >
                                        Candidatar-se a esta Vaga
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : <p className="nenhuma-vaga">Nenhuma vaga encontrada no momento.</p>}
            </main>
        </div>
    );
};

export default TelaInicial;
