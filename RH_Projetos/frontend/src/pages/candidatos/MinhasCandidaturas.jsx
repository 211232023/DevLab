import React from "react";
import "./MinhasCandidaturas.css";

const MinhasCandidaturas = () => {
    const candidaturas = JSON.parse(localStorage.getItem("candidaturas")) || [];
    

    return (
        <div className="minhas-candidaturas">
            <h2>Minhas Candidaturas</h2>
            {candidaturas.length === 0 ? (
                <p>Você ainda não se candidatou a nenhuma vaga.</p>
            ) : (
                candidaturas.map((vaga) => (
                    <div key={vaga.id} className="vaga-candidatada">
                        <h3>{vaga.nome}</h3>
                        <p>{vaga.descricao}</p>
                        <p><strong>Benefícios:</strong> {vaga.beneficios}</p>
                        <p><strong>Horário:</strong> {vaga.horario}</p>
                        <p><strong>Salário:</strong> {vaga.salario}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default MinhasCandidaturas;
