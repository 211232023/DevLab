import React, { useState, useEffect } from "react";
import "./Teste.css";

const perguntas = [
  // Português
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
    categoria: "Português",
    pergunta: "Qual é o plural correto de 'cidadão'?",
    opcoes: ["Cidadãos", "Cidadães", "Cidadãoses"],
    respostaCorreta: "Cidadãos",
  },
  {
    id: 4,
    categoria: "Português",
    pergunta: "Qual frase está escrita corretamente?",
    opcoes: [
      "Ele fez o trabalho corretamente.",
      "Ele fez o trabalho correto.",
      "Ele fez correto o trabalho.",
    ],
    respostaCorreta: "Ele fez o trabalho corretamente.",
  },
  {
    id: 5,
    categoria: "Português",
    pergunta: "Assinale a frase com concordância correta:",
    opcoes: [
      "As meninas chegou cedo.",
      "As meninas chegaram cedo.",
      "As meninas chegavam cedo.",
    ],
    respostaCorreta: "As meninas chegaram cedo.",
  },
  {
    id: 6,
    categoria: "Português",
    pergunta: "Qual é o uso correto do acento?",
    opcoes: ["Pôde", "Pode", "Podê"],
    respostaCorreta: "Pôde",
  },
  {
    id: 7,
    categoria: "Português",
    pergunta: "Assinale a frase correta:",
    opcoes: ["Eu vi ele ontem.", "Eu o vi ontem.", "Vi eu ele ontem."],
    respostaCorreta: "Eu o vi ontem.",
  },
  {
    id: 8,
    categoria: "Português",
    pergunta: "Escolha a palavra com grafia correta:",
    opcoes: ["Excessão", "Exceção", "Exseção"],
    respostaCorreta: "Exceção",
  },
  {
    id: 9,
    categoria: "Português",
    pergunta: "Qual é o correto plural de 'cão'?",
    opcoes: ["Cães", "Cãos", "Cãoes"],
    respostaCorreta: "Cães",
  },
  {
    id: 10,
    categoria: "Português",
    pergunta: "Assinale a frase correta:",
    opcoes: [
      "Ele gosta de música clássica.",
      "Ele gosta de música classica.",
      "Ele gosta de música classíca.",
    ],
    respostaCorreta: "Ele gosta de música clássica.",
  },
  // Matemática
  {
    id: 11,
    categoria: "Matemática",
    pergunta: "Quanto é 7 x 8?",
    opcoes: ["54", "56", "58"],
    respostaCorreta: "56",
  },
  {
    id: 12,
    categoria: "Matemática",
    pergunta: "Qual é a raiz quadrada de 81?",
    opcoes: ["9", "8", "7"],
    respostaCorreta: "9",
  },
  {
    id: 13,
    categoria: "Matemática",
    pergunta: "Quanto é 15 + 27?",
    opcoes: ["42", "41", "43"],
    respostaCorreta: "42",
  },
  {
    id: 14,
    categoria: "Matemática",
    pergunta: "Qual é o resultado de 100 ÷ 4?",
    opcoes: ["25", "24", "20"],
    respostaCorreta: "25",
  },
  {
    id: 15,
    categoria: "Matemática",
    pergunta: "Qual é o resultado de 12²?",
    opcoes: ["144", "124", "142"],
    respostaCorreta: "144",
  },
  {
    id: 16,
    categoria: "Matemática",
    pergunta: "Quanto é 9 x 9?",
    opcoes: ["81", "79", "99"],
    respostaCorreta: "81",
  },
  {
    id: 17,
    categoria: "Matemática",
    pergunta: "Qual é a metade de 250?",
    opcoes: ["125", "120", "135"],
    respostaCorreta: "125",
  },
  {
    id: 18,
    categoria: "Matemática",
    pergunta: "Quanto é 45 ÷ 5?",
    opcoes: ["9", "10", "8"],
    respostaCorreta: "9",
  },
  {
    id: 19,
    categoria: "Matemática",
    pergunta: "Quanto é 7²?",
    opcoes: ["49", "47", "56"],
    respostaCorreta: "49",
  },
  {
    id: 20,
    categoria: "Matemática",
    pergunta: "Qual é o resultado de 50 - 18?",
    opcoes: ["32", "30", "28"],
    respostaCorreta: "32",
  },
];

export default function Teste() {
  const [indice, setIndice] = useState(0);
  const [respostasUsuario, setRespostasUsuario] = useState({});
  const [finalizado, setFinalizado] = useState(false);
  const [timerIniciado, setTimerIniciado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(10 * 60); // 5 minutos
  const [tempoEsgotado, setTempoEsgotado] = useState(false);

  const perguntaAtual = perguntas[indice] || {};
  const todasRespondidas = perguntas.every((p) => respostasUsuario[p.id]);

  const handleResposta = (opcao) => {
    setRespostasUsuario({ ...respostasUsuario, [perguntaAtual.id]: opcao });
  };

  const iniciarTeste = () => {
    setTimerIniciado(true);
  };

  const enviarTeste = () => {
    setFinalizado(true);
  };

  useEffect(() => {
    if (!timerIniciado || finalizado) return;

    if (tempoRestante <= 0) {
      setTempoEsgotado(true);
      enviarTeste();
      return;
    }

    const timer = setInterval(() => {
      setTempoRestante((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timerIniciado, tempoRestante, finalizado]);

  const formatarTempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  const getCategoriaClass = (categoria) => {
    if (categoria === "Português") return "pergunta portugues";
    if (categoria === "Matemática") return "pergunta matematica";
    return "pergunta";
  };

  const pontuacaoTotal = perguntas.filter(
    (p) => respostasUsuario[p.id] === p.respostaCorreta
  ).length;

  return (
    <div className="teste-container">
      {!timerIniciado && !finalizado && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <h2>Bem-vindo ao Teste de Habilidades!</h2>
          <p>
            Este teste contém questões de Português e Matemática. Você terá 10
            minutos para respondê-lo. Clique no botão abaixo para iniciar o
            tempo e começar o teste.
            <p>Boa Sorte!</p>
          </p>
          <button
            onClick={iniciarTeste}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
              backgroundColor: "#127067",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Iniciar Teste
          </button>
        </div>
      )}

      {timerIniciado && !finalizado && (
        <>
          {/* Barra superior com bolinhas circulares */}
          <div
            className="barra-superior"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "5px",
              justifyContent: "center",
              marginBottom: "15px",
            }}
          >
            {perguntas.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setIndice(idx)}
                style={{
                  width: indice === idx ? "26px" : "25px",
                  height: indice === idx ? "26px" : "25px",
                  borderRadius: "50%",
                  border: indice === idx ? "3px solid #00397aff" : "none",
                  cursor: "pointer",
                  backgroundColor: respostasUsuario[p.id]
                    ? "#0068ded7"
                    : "#99cafeff",
                  color: "white",
                  fontSize: "12px",
                  transition: "all 0.2s ease",
                }}
                title={`Questão ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
            Tempo restante: {formatarTempo(tempoRestante)}
          </div>

          <div className="pergunta-topo">
            Pergunta {indice + 1} de {perguntas.length}{" "}
            {!respostasUsuario[perguntaAtual.id] && "(não respondida)"}
          </div>

          <div className={getCategoriaClass(perguntaAtual.categoria)}>
            <strong>{perguntaAtual.categoria}:</strong> {perguntaAtual.pergunta}
            <ul className="opcoes-radio">
              {perguntaAtual.opcoes?.map((opcao, index) => (
                <li key={index}>
                  <label
                    className={
                      respostasUsuario[perguntaAtual.id] === opcao
                        ? "selecionado"
                        : ""
                    }
                  >
                    <input
                      type="radio"
                      name={`pergunta-${perguntaAtual.id}`}
                      value={opcao}
                      checked={respostasUsuario[perguntaAtual.id] === opcao}
                      onChange={() => handleResposta(opcao)}
                    />
                    <span className="radio-btn"></span>
                    {opcao}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="navegacao" style={{ marginTop: "10px" }}>
            <button
              onClick={() => setIndice(indice - 1)}
              disabled={indice === 0}
            >
              Anterior
            </button>
            <button
              onClick={() => setIndice(indice + 1)}
              disabled={indice === perguntas.length - 1}
            >
              Próxima
            </button>
            <button
              onClick={enviarTeste}
              disabled={!todasRespondidas}
              style={{ marginLeft: "10px" }}
            >
              Enviar e Finalizar Teste
            </button>
          </div>
        </>
      )}

      {finalizado && (
        <div>
          {tempoEsgotado && (
            <h2 style={{ color: "red" }}>⏰ Tempo esgotado!</h2>
          )}
          <h2>Teste finalizado!</h2>
          <p>
            Sua pontuação: {pontuacaoTotal} / {perguntas.length}
          </p>
          <h3>Gabarito:</h3>
          <ul className="gabarito">
            {perguntas.map((p) => (
              <li key={p.id} className={getCategoriaClass(p.categoria)}>
                <strong>{p.categoria}:</strong> {p.pergunta}
                <br />
                Sua resposta: {respostasUsuario[p.id] ||
                  "❌ Não respondida"}{" "}
                {respostasUsuario[p.id] === p.respostaCorreta
                  ? "✅ Correta"
                  : `❌ Errada (Correta: ${p.respostaCorreta})`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
