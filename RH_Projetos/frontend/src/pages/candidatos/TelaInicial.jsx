import React, { useState, useEffect } from "react";
import "./TelaInicial.css";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import Button from "../../components/Button";

const candidatarVaga = (vaga) => {
  const candidaturas = JSON.parse(localStorage.getItem("candidaturas")) || [];
  if (!candidaturas.find((v) => v.id === vaga.id)) {
    candidaturas.push(vaga);
    localStorage.setItem("candidaturas", JSON.stringify(candidaturas));
  } else {

  }
};

const TelaInicial = () => {
  const [vagas, setVagas] = useState([]);
  const [expandido, setExpandido] = useState(null);
  const navigate = useNavigate();

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

  return (
    <div className="tela-inicial">
      {vagas.map((vaga) => (
        <div key={vaga.id} className="vaga-box">
          {/* Conteúdo sempre visível */}
          <div className="vaga-conteudo">
            <div className="vaga-esquerda">
              <p>
                <h2>{vaga.titulo}</h2>
              </p>
              <p>
                <strong>Área:</strong> {vaga.area}
              </p>
               <p>
                <strong>Salário:</strong> R${" "}
                {parseFloat(vaga.salario).toFixed(2)}
              </p>
            </div>
            <div className="vaga-direita">
        
            </div>
          </div>

          {/* Conteúdo que expande */}
          <div
            className={`vaga-detalhes ${
              expandido === vaga.id ? "expandido" : ""
            }`}
          >
            <div className="vaga-detalhes-conteudo">
              <p>
                <strong>Descrição da vaga:</strong>
              </p>
              <p style={{ whiteSpace: "pre-wrap" }}>{vaga.descricao}</p>
              <p>
                <strong>Benefícios:</strong> {vaga.beneficios}
              <p>
                <strong>Escala:</strong> {vaga.escala_trabalho}
              </p>
              </p>
              <div className="datas">
                <p>
                  <strong>Abertura:</strong>{" "}
                  {/* --- ALTERAÇÃO AQUI --- */}
                  {vaga.data_Abertura ? new Date(vaga.data_Abertura.replace(' ', 'T')).toLocaleDateString() : 'N/A'}
                </p>
                <p>
                  <strong>Fechamento:</strong>{" "}
                  {/* --- ALTERAÇÃO AQUI --- */}
                  {vaga.data_fechamento ? new Date(vaga.data_fechamento.replace(' ', 'T')).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Botões sempre visíveis */}
          <div className="vaga-botoes-container">
            <Button
              style={{backgroundColor:"gray"}}
              className="btn-ver-mais"
              onClick={() => toggleExpandir(vaga.id)}
            >
              {expandido === vaga.id ? "Ver Menos" : "Ver Mais"}
            </Button>
            <Button
              className="btn-candidatar"
              onClick={() => {
                const vagaParaCandidatar = { ...vaga, nome: vaga.titulo };
                candidatarVaga(vagaParaCandidatar);
                navigate(`/inscricao/${vaga.id}`);
              }}
            >
              Candidatar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TelaInicial;