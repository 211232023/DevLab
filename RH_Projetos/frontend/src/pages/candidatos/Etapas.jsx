import React from "react";
import "./Etapas.css";
import { Link } from "react-router-dom";

const etapas = [
    {
        nome: "Informações do Candidato",
        descricao: "Dados preenchidos na inscrição da vaga.",
        status: "concluída",
        rota: "/perfil"
    },
    {
        nome: "Teste",
        descricao: "Realize o teste online para esta vaga.",
        status: "pendente",
        rota: "/teste"
    },
    {
        nome: "Triagem",
        descricao: "Aguardando análise do RH.",
        status: "pendente",
        rota: null
    },
    {
        nome: "Manuais da Empresa",
        descricao: "Leia os manuais e políticas internas.",
        status: "pendente",
        rota: null
    },
    {
        nome: "Envio de Documentos",
        descricao: "Envie os documentos solicitados.",
        status: "pendente",
        rota: null
    }
];

const Etapas = () => {
    // Calcula se a etapa está desbloqueada (todas anteriores concluídas)
    let desbloqueada = true;
    return (
        <div className="etapas-container">
            <h2>Etapas do Processo Seletivo</h2>
            <ul className="etapas-lista">
                {etapas.map((etapa, idx) => {
                    // Se etapa anterior não concluída, bloqueia esta
                    if (idx > 0 && etapas[idx - 1].status !== "concluída") {
                        desbloqueada = false;
                    } else {
                        desbloqueada = true;
                    }
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
                                {etapa.status === "pendente" && etapa.rota && desbloqueada && (
                                    <Link to={etapa.rota} className="etapa-seta" title={`Ir para ${etapa.nome}`}>
                                        <span style={{fontSize: "1.5em"}}>→</span>
                                    </Link>
                                )}
                                {etapa.status === "pendente" && etapa.rota && !desbloqueada && (
                                    <span className="etapa-seta" style={{fontSize: "1.5em", color: "#bdbdbd"}}>🔒</span>
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