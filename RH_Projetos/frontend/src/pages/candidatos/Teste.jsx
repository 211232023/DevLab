import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import Button from '../../components/Button';
import './Teste.css';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle, FaFlagCheckered, FaExclamationCircle } from 'react-icons/fa';

const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;
    return (
        <div className="confirm-modal-backdrop">
            <div className="confirm-modal-content">
                <FaExclamationCircle className="confirm-modal-icon" />
                <h3>Finalizar Teste?</h3>
                <p>{message}</p>
                <div className="confirm-modal-actions">
                    <Button style={{backgroundColor:"#cc4040ff"}} onClick={onClose} className="btn-cancel">Voltar</Button>
                    <Button onClick={onConfirm} className="btn-confirm">Sim, Enviar</Button>
                </div>
            </div>
        </div>
    );
};

const Teste = () => {
    const { testeId, candidaturaId } = useParams();
    const navigate = useNavigate();

    const [teste, setTeste] = useState(null);
    const [respostas, setRespostas] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [etapa, setEtapa] = useState('inicio');
    const [questaoAtual, setQuestaoAtual] = useState(0);
    const [resultado, setResultado] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchTeste = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/testes/${testeId}`);
                setTeste(response.data);
            } catch (err) {
                setError("Não foi possível carregar o teste.");
            } finally {
                setLoading(false);
            }
        };
        fetchTeste();
    }, [testeId]);

    const handleRespostaChange = (questaoId, alternativaId) => {
        setRespostas(prev => ({ ...prev, [questaoId]: alternativaId }));
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

    const handleConfirmSubmit = () => {
        if (Object.keys(respostas).length !== teste.questoes.length) {
            alert("Por favor, responda todas as perguntas antes de finalizar.");
            return;
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        setIsModalOpen(false);
        setSubmitting(true);
        try {
            await api.post(`/testes/${testeId}/candidatura/${candidaturaId}/submeter`, { respostas });
            calcularResultado();
            setEtapa('finalizado');
        } catch (err) {
            alert("Ocorreu um erro ao enviar suas respostas.");
        } finally {
            setSubmitting(false);
        }
    };
    
    const calcularResultado = () => {
        let acertos = 0;
        const feedbackDetalhado = teste.questoes.map(q => {
            const respostaCandidatoId = respostas[q.id];
            const alternativaCorreta = q.alternativas.find(alt => alt.correta);
            const acertou = respostaCandidatoId === alternativaCorreta.id;
            if (acertou) acertos++;
            return { ...q, respostaCandidatoId, alternativaCorretaId: alternativaCorreta.id, acertou };
        });
        setResultado({ acertos, total: teste.questoes.length, feedback: feedbackDetalhado });
    };

    if (loading) return <div className="loading-container">Carregando teste...</div>;
    if (error) return <div className="error-container">{error}</div>;
    if (!teste) return <div className="loading-container">Nenhum teste encontrado.</div>;

    if (etapa === 'inicio') {
        return (
            <div className="teste-page-wrapper">
                <div className="teste-card teste-inicio">
                    <FaFlagCheckered className="teste-start-icon" />
                    <h1>{teste.titulo}</h1>
                    <p className="teste-descricao">{teste.descricao || "Este teste avaliará suas habilidades para a vaga."}</p>
                    <div className="teste-info">
                        <span><strong>Questões:</strong> {teste.questoes.length}</span>
                    </div>
                    <Button onClick={() => setEtapa('andamento')} className="btn-start-test">Iniciar Teste</Button>
                </div>
            </div>
        );
    }

    if (etapa === 'finalizado' && resultado) {
        const percentual = (resultado.acertos / resultado.total) * 100;
        return (
            <div className="teste-page-wrapper">
                <div className="teste-card teste-resultado">
                    <h1>Resultado do Teste</h1>
                    <div className="resultado-summary">
                        <div className={`score-circle ${percentual >= 60 ? 'aprovado' : 'reprovado'}`}>
                            <span>{percentual.toFixed(0)}%</span>
                        </div>
                        <h2>Você acertou {resultado.acertos} de {resultado.total} questões</h2>
                        <p>Obrigado por completar o teste. O RH entrará em contato em breve.</p>
                    </div>
                    
                    <div className="feedback-lista">
                        {resultado.feedback.map((q, index) => {
                             const alternativaCorreta = q.alternativas.find(a => a.id === q.alternativaCorretaId);
                             const respostaCandidato = q.alternativas.find(a => a.id === q.respostaCandidatoId);
                             return (
                                <div key={q.id} className={`feedback-card ${q.acertou ? 'correto' : 'incorreto'}`}>
                                    <div className="feedback-header">
                                        <h3>{index + 1}. {q.enunciado}</h3>
                                        {q.acertou ? <FaCheckCircle className="feedback-icon correto"/> : <FaTimesCircle className="feedback-icon incorreto"/>}
                                    </div>
                                    <div className="feedback-body">
                                        <p className="alternativa-correta"><strong>Correta:</strong> {alternativaCorreta.texto}</p>
                                        {!q.acertou && respostaCandidato && (
                                            <p className="alternativa-incorreta"><strong>Sua resposta:</strong> {respostaCandidato.texto}</p>
                                        )}
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                    <Button onClick={() => navigate('/minhas-candidaturas')} className="btn-voltar">Voltar para Minhas Candidaturas</Button>
                </div>
            </div>
        );
    }
    
    const questao = teste.questoes[questaoAtual];
    const progresso = ((questaoAtual + 1) / teste.questoes.length) * 100;

    return (
        <div className="teste-page-wrapper">
            <ConfirmModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleSubmit}
                message="Você não poderá alterar suas respostas após o envio."
            />
            <div className="teste-card">
                <header className="teste-header">
                    <h1>{teste.titulo}</h1>
                    <div className="progress-container">
                        <span>Questão {questaoAtual + 1} de {teste.questoes.length}</span>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fg" style={{ width: `${progresso}%` }}></div>
                        </div>
                    </div>
                </header>

                <div className="questao-content">
                    <h3 className="enunciado">{questao.enunciado}</h3>
                    <div className="alternativas-container">
                        {questao.alternativas.map(alt => (
                            <div key={alt.id} 
                                className={`alternativa-card ${respostas[questao.id] === alt.id ? 'selected' : ''}`}
                                onClick={() => handleRespostaChange(questao.id, alt.id)}
                            >
                                <input type="radio" name={`questao-${questao.id}`} value={alt.id} checked={respostas[questao.id] === alt.id} readOnly/>
                                <label>{alt.texto}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <footer className="teste-navegacao">
                    <Button onClick={handleQuestaoAnterior} disabled={questaoAtual === 0} className="btn-nav">
                        <FaArrowLeft /> Anterior
                    </Button>
                    
                    {questaoAtual < teste.questoes.length - 1 ? (
                        <Button onClick={handleProximaQuestao} className="btn-nav">
                            Próximo <FaArrowRight />
                        </Button>
                    ) : (
                        <Button onClick={handleConfirmSubmit} disabled={submitting} className="btn-nav btn-finalizar">
                            {submitting ? 'Enviando...' : 'Finalizar Teste'}
                        </Button>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default Teste;