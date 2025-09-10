import React, { useState } from "react";
import "./Teste.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Teste = () => {
  const perguntas = [
    {
      id: 1,
      categoria: "Português",
      pergunta: "Qual é a forma correta?",
      opcoes: [
        "Houveram muitos problemas.",
        "Houve muitos problemas.",
        "Houve muitos problemasos.",
      ],
      respostaCorreta: "Houve muitos problemas.",
    },
    {
      id: 2,
      categoria: "Português",
      pergunta: "Escolha a palavra correta:",
      opcoes: ["Conciente", "Consciente", "Conssciente"],
      respostaCorreta: "Consciente",
    },
    {
      id: 3,
      categoria: "Matemática",
      pergunta: "Quanto é 7 x 8?",
      opcoes: ["54", "56", "58"],
      respostaCorreta: "56",
    },
    {
      id: 4,
      categoria: "Matemática",
      pergunta: "Qual é a raiz quadrada de 81?",
      opcoes: ["9", "8", "7"],
      respostaCorreta: "9",
    },
  ];

  const [respostas, setRespostas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [feedback, setFeedback] = useState({});

  const handleChange = (perguntaId, opcao) => {
    setRespostas({ ...respostas, [perguntaId]: opcao });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let acertosTotal = 0;
    let acertosCategoria = {};

    const novoFeedback = {};

    perguntas.forEach((p) => {
      const acertou = respostas[p.id] === p.respostaCorreta;
      novoFeedback[p.id] = acertou ? "Certo" : "Errado";
      if (acertou) {
        acertosTotal++;
        acertosCategoria[p.categoria] =
          (acertosCategoria[p.categoria] || 0) + 1;
      }
    });

    setFeedback(novoFeedback);
    setResultado({ total: acertosTotal, porCategoria: acertosCategoria });
  };

  const handleReiniciar = () => {
    setRespostas({});
    setResultado(null);
    setFeedback({});
  };

  return (
    <div className="teste-container">
      <h2>Teste de Candidatura</h2>
      <form onSubmit={handleSubmit}>
        {perguntas.map((p) => (
          <div key={p.id} className="pergunta">
            <h3>
              {p.categoria}: {p.pergunta}
            </h3>
            {p.opcoes.map((opcao) => (
              <label
                key={opcao}
                className={
                  feedback[p.id] &&
                  feedback[p.id] === "Errado" &&
                  respostas[p.id] === opcao
                    ? "errado"
                    : ""
                }
              >
                <input
                  type="radio"
                  name={`pergunta-${p.id}`}
                  value={opcao}
                  checked={respostas[p.id] === opcao}
                  onChange={() => handleChange(p.id, opcao)}
                  required
                  disabled={resultado !== null}
                />
                {opcao}
              </label>
            ))}
            {feedback[p.id] && (
              <div
                className={
                  feedback[p.id] === "Certo"
                    ? "feedback certo"
                    : "feedback errado"
                }
              >
                {feedback[p.id]}
              </div>
            )}
          </div>
        ))}
        {!resultado ? (
          <button type="submit">Enviar Respostas</button>
        ) : (
          <button type="button" onClick={handleReiniciar}>
            Reiniciar Teste
          </button>
        )}
      </form>

      {resultado && (
        <div className="resultado">
          <h3>
            Resultado Total: {resultado.total} de {perguntas.length}
          </h3>
          <ul>
            {Object.entries(resultado.porCategoria).map(([cat, pontos]) => (
              <li key={cat}>
                {cat}: {pontos} acertos
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Teste;
