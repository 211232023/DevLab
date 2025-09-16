import React, { useEffect, useState } from "react";
import "./MinhasCandidaturas.css";
import { useNavigate } from "react-router-dom";

const MinhasCandidaturas = () => {
    const [vagasCandidatadas, setVagasCandidatadas] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Busca as vagas candidatas do localStorage
        const vagas = JSON.parse(localStorage.getItem("candidaturas")) || [];
        setVagasCandidatadas(vagas);
    }, []);

    const handleDesistir = (vagaId) => {
        const confirmacao = window.confirm("Tem certeza que deseja desistir da candidatura?");
        if (!confirmacao) {
            return; // Se o usuario cancelar, nao faz nada
        }
        const novasVagas = vagasCandidatadas.filter(vaga => vaga.id !== vagaId);
        setVagasCandidatadas(novasVagas);
        localStorage.setItem("candidaturas", JSON.stringify(novasVagas));
    };

    const renderVagas = () => {
        if (vagasCandidatadas.length === 0) {
            return <p className="semVaga">Você ainda não se candidatou a nenhuma vaga. Vá até a página
            de vagas e candidate-se!</p>;
        }
        return (
            <ul>
                {vagasCandidatadas.map((vaga, idx) => (
                    <ul className="lista-vagas" key={vaga.nome || vaga.descricao || vaga.requisitos.obrigatorios || idx}>
                        <strong className="nome-vagas">{vaga.nome || "-"}</strong>
                        <br />
                        <br />
                        <strong>{vaga.descricao || "-"}</strong>
                        <br />
                        <br />
                        <strong> Requisitos obrigatórios:{" "}
                            {Array.isArray(vaga.requisitos?.obrigatorios)
                                ? vaga.requisitos.obrigatorios.join(", ")
                                : vaga.requisitos?.obrigatorios || "-"}.
                        </strong>
                        <br />
                        <br />
                        <button className="bt-informacao" onClick={() => navigate(`/etapas/${vaga.id}`)}>Ver progresso </button>
                        <button className="bt-desistir" onClick={() => handleDesistir(vaga.id)}>Desistir</button>
                        <div className="status">Status: Em andamento</div>
                    </ul>
                ))}
            </ul>
        );
    };


    return (
        <div className="minhas-candidaturas">
            <h2>Minhas candidaturas</h2>
            {renderVagas()}


        </div>
    )
};


export default MinhasCandidaturas;
