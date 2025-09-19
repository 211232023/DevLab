import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Etapas.css";
import { Link, useParams } from "react-router-dom";

const Etapas = () => {
    const { vagaId, candidaturaId } = useParams();
    const [etapasProcesso, setEtapasProcesso] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStatusCandidatura = async () => {
            if (!candidaturaId) return;

            try {
                // Busca o status atual da candidatura
                const response = await axios.get(`http://localhost:3001/api/candidaturas/${candidaturaId}`);
                const statusAtual = response.data.status;

                // Define a ordem e o status de cada etapa com base na resposta da API
                const todasEtapas = [
                    {
                        nome: "Informações do Candidato",
                        descricao: "Dados preenchidos na inscrição da vaga.",
                        status: "concluída", // A inscrição é sempre a primeira etapa concluída
                        rota: "/perfil"
                    },
                    {
                        nome: "Teste",
                        descricao: "Realize o teste online para esta vaga.",
                        status: "pendente", // Status padrão
                        // Rota dinâmica usando os IDs da URL
                        rota: `/teste/${vagaId}/${candidaturaId}` 
                    },
                    {
                        nome: "Triagem",
                        descricao: "Aguardando análise do RH.",
                        status: "pendente",
                        rota: "#" // Rota desabilitada por enquanto
                    },
                    {
                        nome: "Manuais da Empresa",
                        descricao: "Leia os manuais e políticas internas.",
                        status: "pendente",
                        rota: "#" // Rota desabilitada por enquanto
                    },
                    {
                        nome: "Envio de Documentos",
                        descricao: "Envie os documentos solicitados.",
                        status: "pendente",
                        rota: "#" // Rota desabilitada por enquanto
                    }
                ];

                // Lógica para definir o status de cada etapa
                const ordemStatus = ['Aguardando Teste', 'Teste Disponível', 'Manual', 'Envio de Documentos', 'Entrevista', 'Finalizado'];
                const indiceStatusAtual = ordemStatus.indexOf(statusAtual);
                
                // Atualiza o status de cada etapa
                const etapasAtualizadas = todasEtapas.map((etapa, index) => {
                    const indiceEtapa = ordemStatus.indexOf(etapa.nome.replace('Teste Disponível', 'Teste'));
                    if (indiceEtapa < indiceStatusAtual) {
                        return { ...etapa, status: 'concluída' };
                    }
                    return etapa;
                });
                
                setEtapasProcesso(etapasAtualizadas);

            } catch (err) {
                console.error("Erro ao buscar status da candidatura:", err);
                setError("Não foi possível carregar as etapas do processo seletivo.");
            } finally {
                setLoading(false);
            }
        };

        fetchStatusCandidatura();
    }, [candidaturaId, vagaId]);

    if (loading) {
        return <div className="etapas-container"><h2>Carregando etapas...</h2></div>;
    }

    if (error) {
        return <div className="etapas-container"><h2 style={{ color: 'red' }}>{error}</h2></div>;
    }
    
    // Calcula se a etapa está desbloqueada (todas anteriores concluídas)
    let desbloqueada = true;
    return (
        <div className="etapas-container">
            <h2>Etapas do Processo Seletivo</h2>
            <ul className="etapas-lista">
                {etapasProcesso.map((etapa, idx) => {
                    // Se etapa anterior não concluída, bloqueia esta
                    if (idx > 0 && etapasProcesso[idx - 1].status !== "concluída") {
                        desbloqueada = false;
                    } else {
                        desbloqueada = true;
                    }
                    const isClickable = etapa.status === "pendente" && desbloqueada && etapa.rota !== "#";
                    
                    return (
                        <li key={etapa.nome} className={`etapa-box etapa-${etapa.status}`}>
                            <div className="etapa-info">
                                <div>
                                    <div className="etapa-nome">{idx + 1}. {etapa.nome}</div>
                                    <div className="etapa-desc">{etapa.descricao}</div>
                                    <div className="etapa-status">
                                        {etapa.status === "concluída"
                                            ? "✔️ Concluída"
                                            : desbloqueada
                                                ? "⏳ Pendente"
                                                : <span style={{color: "#bdbdbd"}}>🔒 Bloqueada</span>
                                        }
                                    </div>
                                </div>
                                {isClickable ? (
                                    <Link to={etapa.rota} className="etapa-seta" title={`Ir para ${etapa.nome}`}>
                                        <span style={{fontSize: "1.5em"}}>→</span>
                                    </Link>
                                ) : (
                                     etapa.status !== "concluída" && <span className="etapa-seta" style={{fontSize: "1.5em", color: "#bdbdbd"}}>🔒</span>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default Etapas;