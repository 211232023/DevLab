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

    const renderVagas = () => {
        if (vagasCandidatadas.length === 0) {
            return <p>Você ainda não se candidatou a nenhuma vaga.</p>;
        }
        return (
            <ul>
                {vagasCandidatadas.map((vaga) => (
                    <ul className="lista-vagas" key={vaga.nome || vaga.descricao || vaga.requisitos.obrigatorios}>
                        <strong className="nome-vagas">{vaga.nome || vaga}</strong>
                        <br />
                        <br />
                        <strong>{vaga.descricao || vaga}</strong>
                        <br />
                        <br />
                        <strong> Requisitos obrigatórios:{" "}
                            {Array.isArray(vaga.requisitos?.obrigatorios)
                                ? vaga.requisitos.obrigatorios.join(", ")
                                : vaga.requisitos?.obrigatorios || vaga}.
                        </strong>
                        <br />
                        <br />
                        <button className="bt-informacao" onClick={() => navigate(`/etapas/${vaga.id}`)}>Ver progresso </button>
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
