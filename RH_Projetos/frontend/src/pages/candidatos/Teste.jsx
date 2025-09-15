import React, { useState, useEffect } from "react";
import "./Teste.css";

const perguntas = [
  // Português
  {
    id: 1,
    categoria: "Português",
    pergunta: "Qual é a forma correta?",
    opcoes: [
      "Se eu ver ele amanhã, aviso você.",
      "Se eu vir ele amanhã, aviso você.",
      "Se eu vê ele amanhã, aviso você.",
    ],
    respostaCorreta: "Se eu vir ele amanhã, aviso você.",
  },
  {
    id: 2,
    categoria: "Português",
    pergunta: "Qual frase está correta?",
    opcoes: [
      "Ela tinha chego cedo.",
      "Ela tinha chegado cedo.",
      "Ela tinha chegado-se cedo.",
    ],
    respostaCorreta: "Ela tinha chegado cedo.",
  },
  {
    id: 3,
    categoria: "Português",
    pergunta: "Escolha a forma correta:",
    opcoes: [
      "Vou fazer uma viagem a São Paulo.",
      "Vou fazer uma viagem à São Paulo.",
      "Vou fazer uma viajem a São Paulo.",
    ],
    respostaCorreta: "Vou fazer uma viagem a São Paulo.",
  },
  {
    id: 4,
    categoria: "Português",
    pergunta: "Qual é a forma correta?",
    opcoes: [
      "Faz dois anos que moro aqui.",
      "Fazem dois anos que moro aqui.",
      "Está fazendo dois anos que moro aqui.",
    ],
    respostaCorreta: "Faz dois anos que moro aqui.",
  },
  {
    id: 5,
    categoria: "Português",
    pergunta: "Qual é a frase correta?",
    opcoes: [
      "Haviam muitas pessoas na festa.",
      "Havia muitas pessoas na festa.",
      "Houveram muitas pessoas na festa.",
    ],
    respostaCorreta: "Havia muitas pessoas na festa.",
  },
  {
    id: 6,
    categoria: "Português",
    pergunta: "Qual destas frases está correta?",
    opcoes: [
      "Assistir o jogo foi emocionante.",
      "Assistir ao jogo foi emocionante.",
      "Assisti o jogo foi emocionante.",
    ],
    respostaCorreta: "Assistir ao jogo foi emocionante.",
  },
  {
    id: 7,
    categoria: "Português",
    pergunta: "Qual é a forma correta?",
    opcoes: [
      "Este presente é para eu usar.",
      "Este presente é para mim usar.",
      "Este presente é pra mim usar.",
    ],
    respostaCorreta: "Este presente é para eu usar.",
  },
  {
    id: 8,
    categoria: "Português",
    pergunta: "Qual é a forma correta?",
    opcoes: [
      "A sessão do filme começa às 20h.",
      "A seção do filme começa às 20h.",
      "A cessão do filme começa às 20h.",
    ],
    respostaCorreta: "A sessão do filme começa às 20h.",
  },
  {
    id: 9,
    categoria: "Português",
    pergunta: "Escolha a frase correta:",
    opcoes: [
      "Vou na escola amanhã.",
      "Vou à escola amanhã.",
      "Vou a escola amanhã.",
    ],
    respostaCorreta: "Vou à escola amanhã.",
  },
  {
    id: 10,
    categoria: "Português",
    pergunta: "Qual é a frase correta?",
    opcoes: [
      "O juiz autorizou a cessão do imóvel.",
      "O juiz autorizou a sessão do imóvel.",
      "O juiz autorizou a seção do imóvel.",
    ],
    respostaCorreta: "O juiz autorizou a cessão do imóvel.",
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
                className={`barra-questao-btn ${
                  indice === idx ? "selecionado" : ""
                } ${respostasUsuario[p.id] ? "respondida" : ""}`}
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
          <h2>✅ Teste finalizado!</h2>
          <p>
            Sua pontuação: {pontuacaoTotal} / {perguntas.length}
          </p>

          {/* Tempo que levou */}
          <p>⏱ Tempo utilizado: {formatarTempo(10 * 60 - tempoRestante)}</p>

          {/* Avaliação de desempenho visual */}
          {(() => {
            const percentual = (pontuacaoTotal / perguntas.length) * 100;
            let avaliacao = "";
            let cor = "";
            let emoji = "";

            if (percentual < 50) {
              avaliacao = "Ruim";
              cor = "red";
              emoji = "😞";
            } else if (percentual >= 50 && percentual < 70) {
              avaliacao = "Regular";
              cor = "orange";
              emoji = "😐";
            } else if (percentual >= 70 && percentual < 90) {
              avaliacao = "Bom";
              cor = "green";
              emoji = "🙂";
            } else {
              avaliacao = "Ótimo";
              cor = "blue";
              emoji = "🏆";
            }

            return (
              <p style={{ color: cor, fontWeight: "bold", fontSize: "18px" }}>
                Avaliação de desempenho: {emoji} {avaliacao} (
                {percentual.toFixed(0)}%)
              </p>
            );
          })()}

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
