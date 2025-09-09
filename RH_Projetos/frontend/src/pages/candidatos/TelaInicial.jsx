import React, { useState } from "react";
import "./TelaInicial.css";

const vagas = [
    {
        id: 1,
        nome: "Desenvolvedor Frontend",
        descricao: "Estamos em busca de uma pessoa desenvolvedora frontend apaixonada por tecnologia e com olhar apurado para a experiência do usuário. A pessoa será responsável por desenvolver interfaces modernas, responsivas e performáticas, colaborando com times de produto, design e backend.",
        beneficios: "Vale Transporte, Vale Refeição",
        horario: "09:00 - 18:00",
        salario: "R$ 5.000,00",
        detalhes: "Conhecimentos em React, JavaScript, CSS e integração com APIs REST."
    },
    {
        id: 2,
        nome: "Analista de Dados",
        descricao: "Procuramos uma pessoa analista de dados com perfil analítico e foco em resolução de problemas. Você atuará em conjunto com times de produto, marketing e tecnologia para transformar dados em insights acionáveis, apoiando decisões estratégicas com base em análises e visualizações de dados.",
        beneficios: "Plano de Saúde, Vale Alimentação",
        horario: "08:00 - 17:00",
        salario: "R$ 6.500,00",
        detalhes: "Experiência com SQL, Python e ferramentas de BI como Power BI ou Tableau."
    }
];

const TelaInicial = () => {
    const [expandido, setExpandido] = useState(null); // Estado para controlar qual box está expandida

    const toggleExpandir = (id) => {
        setExpandido(expandido === id ? null : id); // Alterna entre expandir e recolher
    };

    return (
        <div className="tela-inicial">
            {vagas.map((vaga) => (
                <div key={vaga.id} className={`vaga-box ${expandido === vaga.id ? "expandido" : ""}`}>
                    <div className="vaga-esquerda">
                        <h2>{vaga.nome}</h2>
                        <p><strong>Descrição da vaga:</strong></p>
                        <p>{vaga.descricao}</p>
                    </div>
                    <div className="vaga-direita">
                        <p><strong>Benefícios:</strong> {vaga.beneficios}</p>
                        <p><strong>Horário:</strong> {vaga.horario}</p>
                        <p><strong>Salário:</strong> {vaga.salario}</p>
                        {expandido === vaga.id && ( // Exibe mais informações se a box estiver expandida
                            <p><strong>Detalhes:</strong> {vaga.detalhes}</p>
                        )}
                        <div className="vaga-botoes">
                            <button className="btn-ver-mais" onClick={() => toggleExpandir(vaga.id)}>
                                {expandido === vaga.id ? "Ver Menos" : "Ver Mais"}
                            </button>
                            <button className="btn-candidatar">Candidatar</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TelaInicial;