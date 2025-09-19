import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Teste.css';

const Teste = () => {
    const { vagaId, candidaturaId } = useParams();
    const navigate = useNavigate();

    const [teste, setTeste] = useState(null);
    const [respostas, setRespostas] = useState({});
    const [questaoAtual, setQuestaoAtual] = useState(0);
    const [tempoRestante, setTempoRestante] = useState(1800); // 30 minutos em segundos
    const [testeFinalizado, setTesteFinalizado] = useState(false);
    const [pontuacao, setPontuacao] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTeste = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/testes/vaga/${vagaId}`);
                setTeste(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Erro ao buscar o teste:", err);
                setError('Não foi possível carregar o teste. Tente novamente mais tarde.');
                setLoading(false);
            }
        };

        fetchTeste();
    }, [vagaId]);

    useEffect(() => {
        if (!loading && teste && !testeFinalizado) {
            const timer = setInterval(() => {
                setTempoRestante(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [loading, teste, testeFinalizado]);

    const handleSelectResposta = (questaoId, alternativaId) => {
        setRespostas({
            ...respostas,
            [questaoId]: alternativaId,
        });
    };

    const handleNext = () => {
        if (questaoAtual < teste.questoes.length - 1) {
            setQuestaoAtual(questaoAtual + 1);
        }
    };

    const handlePrev = () => {
        if (questaoAtual > 0) {
            setQuestaoAtual(questaoAtual - 1);
        }
    };

    const handleSubmit = async () => {
        if (!window.confirm('Tem certeza que deseja finalizar o teste?')) return;

        let score = 0;
        teste.questoes.forEach(questao => {
            const respostaCandidato = respostas[questao.id];
            const alternativaCorreta = questao.alternativas.find(alt => alt.correta);
            if (alternativaCorreta && respostaCandidato === alternativaCorreta.id) {
                score++;
            }
        });
        
        const pontuacaoFinal = (score / teste.questoes.length) * 100;
        setPontuacao(pontuacaoFinal);
        setTesteFinalizado(true);

        try {
            // **IMPORTANTE**: Aqui você faria a chamada para o backend para salvar o resultado
            // Ex: await axios.post(`/api/candidaturas/${candidaturaId}/resultado`, { pontuacao: pontuacaoFinal });
            console.log(`Teste finalizado para a candidatura ${candidaturaId} com pontuação de ${pontuacaoFinal.toFixed(2)}%`);
            // E também poderia atualizar o status da candidatura
        } catch (err) {
            console.error("Erro ao salvar o resultado do teste:", err);
            alert("Houve um erro ao salvar seu resultado. Por favor, entre em contato com o suporte.");
        }
    };

    if (loading) {
        return <div className="teste-container"><div className="loading">Carregando Teste...</div></div>;
    }

    if (error) {
        return <div className="teste-container"><div className="error">{error}</div></div>;
    }

    if (!teste || !teste.questoes) {
        return (
            <div className="teste-container">
                <div className="error">Esta vaga não possui um teste associado.</div>
                 <button onClick={() => navigate('/minhas-candidaturas')} className="btn-finalizar">Voltar</button>
            </div>
        )
    }

    const formatarTempo = (segundos) => {
        const minutos = Math.floor(segundos / 60);
        const secs = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (testeFinalizado) {
        return (
            <div className="teste-container">
                <div className="finalizado-card">
                    <h2>Teste Finalizado!</h2>
                    <p>Obrigado por completar o teste para a vaga de {teste.titulo}.</p>
                    <div className="resultado-pontuacao">
                        Sua pontuação foi: <strong>{pontuacao.toFixed(2)}%</strong>
                    </div>
                    <p>O RH entrará em contato para as próximas etapas. Boa sorte!</p>
                    <button onClick={() => navigate('/minhas-candidaturas')} className="btn-finalizar">Voltar para Minhas Candidaturas</button>
                </div>
            </div>
        );
    }

    const questao = teste.questoes[questaoAtual];

    return (
        <div className="teste-container">
            <div className="teste-header">
                <h1>{teste.titulo}</h1>
                <div className="timer">{formatarTempo(tempoRestante)}</div>
            </div>
            <div className="teste-card">
                <div className="progresso-questoes">
                    Questão {questaoAtual + 1} de {teste.questoes.length}
                </div>
                <h2 className="enunciado-questao">{questao.enunciado}</h2>
                <div className="alternativas">
                    {questao.alternativas.map((alt) => (
                        <button
                            key={alt.id}
                            className={`alternativa ${respostas[questao.id] === alt.id ? 'selecionada' : ''}`}
                            onClick={() => handleSelectResposta(questao.id, alt.id)}
                        >
                            {alt.texto}
                        </button>
                    ))}
                </div>
            </div>
            <div className="teste-navegacao">
                <button onClick={handlePrev} disabled={questaoAtual === 0}>
                    Anterior
                </button>
                {questaoAtual < teste.questoes.length - 1 ? (
                    <button onClick={handleNext}>Próxima</button>
                ) : (
                    <button onClick={handleSubmit} className="btn-finalizar">Finalizar Teste</button>
                )}
            </div>
        </div>
    );
};

export default Teste;