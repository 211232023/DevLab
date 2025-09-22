import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
// 1. Mude a importação de 'axios' para a nossa instância 'api'
import api from '../../api';
import './MinhasCandidaturas.css';
import Button from '../../components/Button';

const MinhasCandidaturas = () => {
    const [candidaturas, setCandidaturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        // A verificação do usuário continua sendo uma boa prática
        if (user) {
            const fetchCandidaturas = async () => {
                try {
                    setLoading(true);
                    // 2. A chamada de API agora é mais simples e segura
                    const response = await api.get('/candidaturas/minhas');
                    setCandidaturas(response.data);
                    setError('');
                } catch (err) {
                    if (err.response && err.response.status === 404) {
                        setCandidaturas([]); // Mantém o comportamento de limpar se não encontrar
                    } else {
                        setError('Erro ao buscar suas candidaturas.');
                        console.error('Erro detalhado:', err);
                    }
                } finally {
                    setLoading(false);
                }
            };
            fetchCandidaturas();
        } else {
            setLoading(false);
            setError('Você precisa estar logado para ver suas candidaturas.');
        }
    }, [user]);

    const handleDesistir = async (candidaturaId) => {
        if (window.confirm('Tem certeza de que deseja desistir desta vaga?')) {
            try {
                // 3. Usar 'api.delete' para a requisição
                await api.delete(`/candidaturas/${candidaturaId}`);
                // 4. Correção na lógica do filtro para remover a candidatura da tela
                setCandidaturas(candidaturas.filter(c => c.id !== candidaturaId));
            } catch (err) {
                alert('Erro ao tentar desistir da vaga.');
                console.error(err);
            }
        }
    };

    const getStatusClass = (status) => {
        if (!status) return 'default';
        return status.toLowerCase().replace(/\s+/g, '-');
    };

    if (loading) {
        return <div className="loading-container">Carregando...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    return (
        <div className="minhas-candidaturas-container">
            <h1>Minhas Candidaturas</h1>
            {candidaturas.length > 0 ? (
                <div className="lista-candidaturas">
                    {candidaturas.map((candidatura) => (
                        // 5. Corrigido o 'key' para usar o ID correto (candidatura.id)
                        <div key={candidatura.id} className="candidatura-card">
                            <h2>{candidatura.nome_vaga}</h2>
                            <p><strong>Área:</strong> {candidatura.area}</p>
                            <p><strong>Status:</strong>
                                <span className={`status status-${getStatusClass(candidatura.status)}`}>
                                    {candidatura.status || 'Não definido'}
                                </span>
                            </p>
                            <div className="candidatura-actions">
                                <Button
                                    style={{ backgroundColor: "#cc4040ff" }}
                                    onClick={() => handleDesistir(candidatura.id)} // Passando o ID correto
                                    className="btn-desistir"
                                >
                                    Desistir
                                </Button>
                                <Link to={`/etapas/${candidatura.vaga_id}/${candidatura.id}`}>
                                    <Button className="btn-progresso">
                                        Ver Progresso
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="nenhuma-candidatura">Você ainda não se candidatou a nenhuma vaga.</p>
            )}
        </div>
    );
};

export default MinhasCandidaturas;