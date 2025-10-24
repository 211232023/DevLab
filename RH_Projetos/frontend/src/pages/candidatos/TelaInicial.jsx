import React, { useState, useEffect, useMemo } from "react";
import "./TelaInicial.css";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import Button from "../../components/Button";
import { useAuth } from "../../AuthContext";
import { FaBriefcase, FaMoneyBillWave, FaCalendarAlt, FaChevronDown } from 'react-icons/fa';

const TelaInicial = () => {
    const [vagas, setVagas] = useState([]);
    const [expandido, setExpandido] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('none'); // 'salary-desc' | 'salary-asc' | 'none'
    const [filterArea, setFilterArea] = useState('All');

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

    // Filtragem e ordenação memoizada (must be a top-level hook)
    const filteredVagas = useMemo(() => {
        let resultado = vagas || [];

        if (filterArea && filterArea !== 'All') {
            resultado = resultado.filter(v => (v.area || '').toLowerCase() === filterArea.toLowerCase());
        }
        if (searchTerm && searchTerm.trim() !== '') {
            const termo = searchTerm.trim().toLowerCase();
            resultado = resultado.filter(v => (v.titulo || '').toLowerCase().includes(termo));
        }
        if (sortOrder === 'salary-desc') {
            resultado = resultado.slice().sort((a, b) => (parseFloat(b.salario) || 0) - (parseFloat(a.salario) || 0));
        } else if (sortOrder === 'salary-asc') {
            resultado = resultado.slice().sort((a, b) => (parseFloat(a.salario) || 0) - (parseFloat(b.salario) || 0));
        }
        return resultado;
    }, [vagas, searchTerm, sortOrder, filterArea]);

    return (
        <div className="vagas-page-wrapper">
            <header className="vagas-header-simple">
                <h1>Vagas Disponíveis</h1>
                <p>Explore as oportunidades abaixo e encontre a que mais combina com você.</p>
            </header>

            <main className="vagas-list">
                <div className="filtros-bar">
                    <input
                        type="search"
                        className="filtro-input"
                        placeholder="Pesquisar por título..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Pesquisar vagas por título"
                    />

                    <select className="filtro-select" value={filterArea} onChange={(e) => setFilterArea(e.target.value)} aria-label="Filtrar por área">
                        <option value="All">Todas as áreas</option>
                        <option value="Tecnologia">Tecnologia</option>
                        <option value="Saúde">Saúde</option>
                        <option value="Engenharia">Engenharia</option>
                    </select>

                    <select className="filtro-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} aria-label="Ordenar por salário">
                        <option value="none">Ordenar (nenhum)</option>
                        <option value="salary-desc">Salário: Maior para Menor</option>
                        <option value="salary-asc">Salário: Menor para Maior</option>
                    </select>
                </div>

                {filteredVagas.length === 0 ? (
                    <p className="nenhuma-vaga">Nenhuma vaga encontrada no momento.</p>
                ) : (
                    filteredVagas.map((vaga) => (
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
                                        {/* Mostrar botão de candidatar somente quando NÃO for usuário RH */}
                                        {(!user || user.tipo !== 'RH') && (
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
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default TelaInicial;
