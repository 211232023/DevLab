import React, { useState } from "react";
import "./TelaInicial.css";
import { useNavigate } from "react-router-dom";

const vagas = [
    
    {
        id: 1,
        nome: "Desenvolvedor Frontend",
        descricao: "Estamos em busca de uma pessoa desenvolvedora frontend apaixonada por tecnologia e com olhar apurado para a experiência do usuário. A pessoa será responsável por desenvolver interfaces modernas, responsivas e performáticas, colaborando com times de produto, design e backend.",
        responsabilidades: [
            "Desenvolver e manter interfaces web responsivas e acessíveis",
            "Trabalhar em conjunto com designers e backend para implementar funcionalidades",
            "Garantir a performance e usabilidade das aplicações",
            "Participar de code reviews e colaborar com boas práticas de desenvolvimento",
            "Acompanhar tendências e propor melhorias técnicas"
        ],
        beneficios: "Vale Transporte, Vale Refeição",
        horario: "09:00 - 18:00",
        salario: "R$ 5.000,00",
        requisitos: {
            obrigatorios: [
                "Experiência com HTML, CSS, JavaScript",
                "Domínio em frameworks modernos (React, Vue ou Angular)",
                "Consumo de APIs RESTful",
                "Versionamento com Git",
                "Conhecimento em boas práticas de UX/UI"
            ],
            diferenciais: [
                "Experiência com TypeScript",
                "Conhecimento em testes automatizados (Jest, Testing Library)",
                "Experiência com ferramentas como Webpack, Vite, etc.",
                "Familiaridade com metodologias ágeis (Scrum, Kanban)"
            ]
        }
    },
    {
        id: 2,
        nome: "Analista de Dados",
        descricao: "Procuramos uma pessoa analista de dados com perfil analítico e foco em resolução de problemas. Você atuará em conjunto com times de produto, marketing e tecnologia para transformar dados em insights acionáveis, apoiando decisões estratégicas com base em análises e visualizações de dados.",
        responsabilidades: [
            "Coletar, organizar e analisar grandes volumes de dados",
            "Criar relatórios e dashboards para suporte à tomada de decisão",
            "Garantir a integridade e qualidade dos dados",
            "Colaborar com equipes de produto e tecnologia para implementar soluções baseadas em dados"
        ],
        beneficios: "Plano de Saúde, Vale Alimentação",
        horario: "08:00 - 17:00",
        salario: "R$ 6.500,00",
        requisitos: {
            obrigatorios: [
                "Experiência com SQL e Python",
                "Conhecimento em ferramentas de BI (Power BI, Tableau)",
                "Habilidade em análise de dados e criação de relatórios",
                "Familiaridade com bancos de dados relacionais"
            ],
            diferenciais: [
                "Experiência com Big Data e ferramentas como Hadoop ou Spark",
                "Conhecimento em Machine Learning",
                "Certificação em análise de dados ou BI",
                "Experiência com metodologias ágeis"
            ]
        }
    }
];

const candidatarVaga = (vaga) => {
    // Recupera vagas já candidatas
    const candidaturas = JSON.parse(localStorage.getItem("candidaturas")) || [];
    // Evita duplicidade
    if (!candidaturas.find(v => v.id === vaga.id)) {
        candidaturas.push(vaga);
        localStorage.setItem("candidaturas", JSON.stringify(candidaturas));
        alert("Candidatura realizada com sucesso!");
    } else {
        alert("Você já se candidatou a esta vaga.");
    }
};

const TelaInicial = () => {
    const [expandido, setExpandido] = useState(null); // Estado para controlar qual box está expandida
    const navigate = useNavigate();
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
                        {expandido === vaga.id && (
                            <>
                                <p><strong>Responsabilidades:</strong></p>
                                <ul>
                                    {vaga.responsabilidades.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                    <div className="vaga-direita">
                        {expandido === vaga.id && (
                            <>
                                <p><strong>Requisitos obrigatórios:</strong></p>
                                <ul>
                                    {vaga.requisitos.obrigatorios.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                                <p><strong>Diferenciais:</strong></p>
                                <ul>
                                    {vaga.requisitos.diferenciais.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                        <p><strong>Benefícios:</strong> {vaga.beneficios}</p>
                        <p><strong>Horário:</strong> {vaga.horario}</p>
                        <p><strong>Salário:</strong> {vaga.salario}</p>
                        <div className="vaga-botoes">
                            <button className="btn-ver-mais" onClick={() => toggleExpandir(vaga.id)}>
                                {expandido === vaga.id ? "Ver Menos" : "Ver Mais"}
                            </button>

                            <button
                                className="btn-candidatar"
                                onClick={() => navigate(`/inscricao/${vaga.id}`)}
                            >
                                Candidatar
                            </button>
                            <button className="btn-candidatar" >Candidatar</button>

                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TelaInicial;