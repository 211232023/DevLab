import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api'; // 1. Usar a instância 'api'
import Button from '../../components/Button';
import './Teste.css';

const Teste = () => {
    const { testeId, candidaturaId } = useParams();
    const navigate = useNavigate();

    const [teste, setTeste] = useState(null);
    const [respostas, setRespostas] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchTeste = async () => {
            try {
                setLoading(true);
                // 2. Corrigido para buscar o teste pelo ID correto da URL
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

    const handleRespostaChange = (questaoId, valor) => {
        setRespostas(prev => ({
            ...prev,
            [questaoId]: valor,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validação simples para garantir que todas as perguntas foram respondidas
        if (Object.keys(respostas).length !== teste.questoes.length) {
            alert("Por favor, responda todas as perguntas antes de enviar.");
            return;
        }

        if (window.confirm("Tem certeza de que deseja enviar suas respostas? Você não poderá alterá-las depois.")) {
            setSubmitting(true);
            try {
                // 3. Usar a rota correta para submeter o teste
                await api.post(`/testes/${testeId}/candidatura/${candidaturaId}/submeter`, { respostas });
                alert("Teste enviado com sucesso!");
                navigate('/minhas-candidaturas'); // Redireciona o usuário após o envio
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

    return (
        <div className="teste-container">
            <h1>{teste.titulo}</h1>
            <p>{teste.descricao}</p>
            <form onSubmit={handleSubmit} className="teste-form">
                {teste.questoes.map((questao, index) => (
                    <div key={questao.id} className="questao-card">
                        <h3>{index + 1}. {questao.enunciado}</h3>
                        <div className="alternativas-container">
                            {questao.alternativas.map(alt => (
                                <label key={alt.id} className="alternativa-label">
                                    <input
                                        type="radio"
                                        name={`questao-${questao.id}`}
                                        value={alt.id}
                                        onChange={() => handleRespostaChange(questao.id, alt.id)}
                                        required
                                    />
                                    {alt.texto}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Enviando...' : 'Finalizar e Enviar Teste'}
                </Button>
            </form>
        </div>
    );
};

export default Teste;