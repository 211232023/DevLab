import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Importar Link para o botão
import { useAuth } from '../../AuthContext';
import './MinhasCandidaturas.css';
import Button from '../../components/Button';

const MinhasCandidaturas = () => {
    const [candidaturas, setCandidaturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        if (user && user.id) {
            const fetchCandidaturas = async () => {
                try {
                    setLoading(true);
                    const response = await axios.get(`http://localhost:3001/api/candidaturas/usuario/${user.id}`);
                    setCandidaturas(response.data);
                    setError('');
                } catch (err) {
                    if (err.response && err.response.status === 404) {
                        setCandidaturas([]);
                    } else {
                        setError('Erro ao buscar suas candidaturas.');
                        console.error(err);
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
                await axios.delete(`http://localhost:3001/api/candidaturas/${candidaturaId}`);
                setCandidaturas(candidaturas.filter(c => c.candidatura_id !== candidaturaId));
            } catch (err) {
                alert('Erro ao tentar desistir da vaga.');
                console.error(err);
            }
        }
    };
    
    // Função para gerar uma classe CSS segura para o status
    const getStatusClass = (status) => {
        if (!status) return 'default';
        // Converte "Aguardando Teste" para "aguardando-teste"
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
                        <div key={candidatura.candidatura_id} className="candidatura-card">
                            <h2>{candidatura.nome_vaga}</h2>
                            <p><strong>Área:</strong> {candidatura.area}</p>
                            <p><strong>Status:</strong> 
                                <span className={`status status-${getStatusClass(candidatura.status)}`}>
                                    {candidatura.status}
                                </span>
                            </p>
                            <div className="candidatura-actions">
                                <Button 
                                    style={{backgroundColor:"#cc4040ff"}} 
                                    onClick={() => handleDesistir(candidatura.candidatura_id)} 
                                    className="btn-desistir"
                                >
                                    Desistir
                                </Button>
                                {/* CORREÇÃO: O botão agora é um Link que passa os dois IDs */}
                                <Link to={`/etapas/${candidatura.vaga_id}/${candidatura.candidatura_id}`}>
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