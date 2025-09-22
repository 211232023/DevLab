import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import Button from '../../components/Button';
import './Teste.css'; // O CSS será atualizado abaixo

const Teste = () => {
    const { testeId, candidaturaId } = useParams();
    const navigate = useNavigate();

    const [teste, setTeste] = useState(null);
    const [respostas, setRespostas] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Novos estados para controlar o fluxo do teste
    const [etapa, setEtapa] = useState('inicio'); // 'inicio', 'andamento', 'finalizado'
    const [questaoAtual, setQuestaoAtual] = useState(0);
    const [resultado, setResultado] = useState(null);

    useEffect(() => {
        const fetchTeste = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/testes/${testeId}`);
                setTeste(response.data);
                setError('');
            } catch (err) {
                console.error("Erro ao buscar o teste:", err);
                setError("Não foi possível carregar o teste. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchTeste();
    }, [testeId]);

    const handleRespostaChange = (questaoId, alternativaId) => {
        setRespostas(prev => ({
            ...prev,
            [questaoId]: alternativaId,
        }));
    };

    const handleProximaQuestao = () => {
        if (questaoAtual < teste.questoes.length - 1) {
            setQuestaoAtual(prev => prev + 1);
        }
    };

    const handleQuestaoAnterior = () => {
        if (questaoAtual > 0) {
            setQuestaoAtual(prev => prev - 1);
        }
    };

    const calcularResultado = () => {
        let acertos = 0;
        const feedbackDetalhado = teste.questoes.map(q => {
            const respostaCandidatoId = respostas[q.id];
            const alternativaCorreta = q.alternativas.find(alt => alt.correta);
            const acertou = respostaCandidatoId === alternativaCorreta.id;

            if (acertou) {
                acertos++;
            }

            return {
                ...q,
                respostaCandidatoId,
                alternativaCorretaId: alternativaCorreta.id,
                acertou
            };
        });

        setResultado({
            acertos,
            total: teste.questoes.length,
            feedback: feedbackDetalhado
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (Object.keys(respostas).length !== teste.questoes.length) {
            alert("Por favor, responda todas as perguntas antes de finalizar.");
            return;
        }

        if (window.confirm("Tem certeza de que deseja enviar suas respostas? Você não poderá alterá-las depois.")) {
            setSubmitting(true);
            try {
                // A submissão para o backend continua a mesma
                await api.post(`/testes/${testeId}/candidatura/${candidaturaId}/submeter`, { respostas });
                
                // Após submeter com sucesso, calcula e exibe o resultado
                calcularResultado();
                setEtapa('finalizado');

            } catch (err) {
                console.error("Erro ao submeter o teste:", err);
                alert("Ocorreu um erro ao enviar suas respostas. Tente novamente.");
            } finally {
                setSubmitting(false);
            }
        }
    };

    if (loading) return <div className="loading-container">Carregando teste...</div>;
    if (error) return <div className="error-container">{error}</div>;
    if (!teste) return <div className="loading-container">Nenhum teste encontrado.</div>;

    // --- RENDERIZAÇÃO CONDICIONAL DAS ETAPAS ---

    // 1. Tela Inicial do Teste
    if (etapa === 'inicio') {
        return (
            <div className="teste-container teste-inicio">
                <h1>{teste.titulo}</h1>
                <p>{teste.descricao}</p>
                <Button onClick={() => setEtapa('andamento')}>Iniciar Teste</Button>
            </div>
        );
    }

    // 3. Tela de Feedback/Resultado
    if (etapa === 'finalizado' && resultado) {
        return (
            <div className="teste-container teste-resultado">
                <h1>Resultado do Teste</h1>
                <h2>Sua Pontuação: {resultado.acertos} de {resultado.total}</h2>
                
                <div className="feedback-lista">
                    {resultado.feedback.map((q, index) => (
                        <div key={q.id} className={`feedback-card ${q.acertou ? 'correto' : 'incorreto'}`}>
                            <h3>{index + 1}. {q.enunciado}</h3>
                            <div className="feedback-alternativas">
                                {q.alternativas.map(alt => {
                                    const isCorreta = alt.id === q.alternativaCorretaId;
                                    const isSelecionada = alt.id === q.respostaCandidatoId;
                                    
                                    let className = '';
                                    if (isCorreta) className = 'alternativa-correta';
                                    if (isSelecionada && !isCorreta) className = 'alternativa-incorreta';

                                    return (
                                        <p key={alt.id} className={className}>
                                            {isSelecionada ? <strong>Sua resposta: </strong> : ''}
                                            {isCorreta ? <strong>Resposta correta: </strong> : ''}
                                            {alt.texto}
                                        </p>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <Button onClick={() => navigate('/minhas-candidaturas')}>Voltar para Etapas</Button>
            </div>
        );
    }

    // 2. Teste em Andamento
    const questao = teste.questoes[questaoAtual];
    const isUltimaQuestao = questaoAtual === teste.questoes.length - 1;

    return (
        <div className="teste-container">
            <h1>{teste.titulo}</h1>
            <p>Questão {questaoAtual + 1} de {teste.questoes.length}</p>
            
            <form onSubmit={handleSubmit} className="teste-form">
                <div key={questao.id} className="questao-card">
                    <h3>{questao.enunciado}</h3>
                    <div className="alternativas-container">
                        {questao.alternativas.map(alt => (
                            <label key={alt.id} className="alternativa-label">
                                <input
                                    type="radio"
                                    name={`questao-${questao.id}`}
                                    value={alt.id}
                                    checked={respostas[questao.id] === alt.id}
                                    onChange={() => handleRespostaChange(questao.id, alt.id)}
                                    required
                                />
                                {alt.texto}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="teste-navegacao">
                    <Button type="button" onClick={handleQuestaoAnterior} disabled={questaoAtual === 0}>
                        Anterior
                    </Button>
                    
                    {!isUltimaQuestao ? (
                        <Button type="button" onClick={handleProximaQuestao}>
                            Próximo
                        </Button>
                    ) : (
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Enviando...' : 'Finalizar Teste'}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Teste;