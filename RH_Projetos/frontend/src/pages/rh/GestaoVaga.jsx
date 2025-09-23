import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../AuthContext';
import { Link } from 'react-router-dom';
import './GestaoVaga.css';

const GestaoVaga = () => {
    const { user } = useAuth();
    const [vagasComCandidatos, setVagasComCandidatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const statusOrdem = [
        'Aguardando Teste',
        'Teste Disponível',
        'Entrevista com RH',
        'Entrevista com Gestor',
        'Manual',
        'Envio de Documentos',
        'Finalizado'
    ];

    const getNextStatus = (statusAtual) => {
        const currentIndex = statusOrdem.indexOf(statusAtual);
        if (currentIndex >= 0 && currentIndex < statusOrdem.length - 1) {
            return statusOrdem[currentIndex + 1];
        }
        return statusAtual;
    };

    const handleAvancarEtapa = async (candidaturaId, statusAtual, vagaId) => {
        const novoStatus = getNextStatus(statusAtual);
        if (novoStatus === statusAtual) {
            alert('O candidato já está na etapa final do processo.');
            return;
        }

        try {
            await api.put(`/candidaturas/${candidaturaId}/status`, { status: novoStatus });
            setVagasComCandidatos(vagasAtuais => vagasAtuais.map(vaga => {
                if (vaga.id === vagaId) {
                    return {
                        ...vaga,
                        candidatos: vaga.candidatos.map(c =>
                            c.candidatura_id === candidaturaId ? { ...c, status: novoStatus } : c
                        )
                    };
                }
                return vaga;
            }));
        } catch (err) {
            console.error('Erro ao avançar etapa:', err);
            alert('Não foi possível avançar a etapa do candidato.');
        }
    };

    const handleEliminarCandidatura = async (candidaturaId, vagaId) => {
        if (window.confirm('Tem certeza que deseja eliminar esta candidatura?')) {
            try {
                await api.delete(`/candidaturas/${candidaturaId}`);
                setVagasComCandidatos(vagasAtuais => vagasAtuais.map(vaga => {
                    if (vaga.id === vagaId) {
                        return {
                            ...vaga,
                            candidatos: vaga.candidatos.filter(c => c.candidatura_id !== candidaturaId)
                        };
                    }
                    return vaga;
                }));
            } catch (err) {
                console.error('Erro ao eliminar candidatura:', err);
                alert('Não foi possível eliminar a candidatura.');
            }
        }
    };

    useEffect(() => {
        const carregarTodasAsVagas = async () => {
            if (user && (user.tipo === 'ADMIN' || user.tipo === 'RH')) {
                setLoading(true);
                try {
                    const vagasResponse = await api.get('/vagas');
                    const vagasData = vagasResponse.data;

                    if (vagasData.length > 0) {
                        const vagasCompletas = await Promise.all(
                            vagasData.map(async (vaga) => {
                                try {
                                    // A rota foi ajustada para a que busca candidatos por vaga
                                    const candidatosResponse = await api.get(`/vagas/${vaga.id}/candidatos`);
                                    return { ...vaga, candidatos: candidatosResponse.data };
                                } catch (err) {
                                    console.error(`Erro ao buscar candidatos para a vaga ${vaga.id}:`, err);
                                    return { ...vaga, candidatos: [] };
                                }
                            })
                        );
                        setVagasComCandidatos(vagasCompletas);
                    }
                } catch (err) {
                    console.error('Erro ao carregar vagas:', err);
                    setError('Não foi possível carregar as informações.');
                } finally {
                    setLoading(false);
                }
            }
        };
        carregarTodasAsVagas();
    }, [user]);

    if (loading) return <div className="loading-container">Carregando...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="gestao-vaga-container">
            <h1>Gestão de Vagas</h1>
            {vagasComCandidatos.length === 0 ? (
                <div className="nenhuma-vaga">
                    <p>Nenhuma vaga cadastrada ou nenhuma vaga com candidatos.</p>
                    <Link to="/rh/cadastro-vaga" className="btn-cadastrar-vaga">Cadastrar Nova Vaga</Link>
                </div>
            ) : (
                vagasComCandidatos.map((vaga) => (
                    <div key={vaga.id} className="vaga-card">
                        <h2>{vaga.titulo}</h2>
                        <div className="candidatos-table-container">
                            <h3>Candidatos Inscritos ({vaga.candidatos.length})</h3>
                            {vaga.candidatos.length > 0 ? (
                                <table className="candidatos-table">
                                    <thead>
                                        <tr>
                                            <th>Nome do Candidato</th>
                                            <th>Email</th>
                                            <th>Telefone</th> {/* <-- COLUNA ADICIONADA --> */}
                                            <th>Currículo</th>
                                            <th>Nota do Teste</th>
                                            <th>Documentos</th> {/* <-- COLUNA ADICIONADA --> */}
                                            <th>Status Atual</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vaga.candidatos.map((candidato) => (
                                            <tr key={candidato.candidatura_id}>
                                                <td>{candidato.nome}</td>
                                                <td>{candidato.email}</td>
                                                <td>{candidato.telefone || 'N/A'}</td> {/* <-- DADO ADICIONADO --> */}
                                                <td>
                                                    {candidato.curriculo_path ? (
                                                        <a
                                                            href={`http://localhost:3001${candidato.curriculo_path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="link-documento"
                                                        >
                                                            Ver Currículo
                                                        </a>
                                                    ) : ('Não enviado')}
                                                </td>
                                                <td>
                                                    {candidato.pontuacao_teste !== null
                                                        ? `${parseFloat(candidato.pontuacao_teste).toFixed(2)}%`
                                                        : 'Não realizado'}
                                                </td>
                                                <td>
                                                    {/* <-- LÓGICA PARA DOCUMENTOS --> */}
                                                    {candidato.documentos && candidato.documentos.length > 0 ? (
                                                        candidato.documentos.map((doc, index) => (
                                                            <a
                                                                key={index}
                                                                href={`http://localhost:3001/${doc}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="link-documento"
                                                            >
                                                                Doc. {index + 1}
                                                            </a>
                                                        ))
                                                    ) : (
                                                        'Nenhum'
                                                    )}
                                                </td>
                                                <td>{candidato.status}</td>
                                                <td className="coluna-acoes">
                                                    <button
                                                        className="btn-acao avancar"
                                                        onClick={() => handleAvancarEtapa(candidato.candidatura_id, candidato.status, vaga.id)}
                                                        disabled={candidato.status === 'Finalizado'}
                                                    >
                                                        Avançar
                                                    </button>
                                                    <button
                                                        className="btn-acao eliminar"
                                                        onClick={() => handleEliminarCandidatura(candidato.candidatura_id, vaga.id)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>Nenhum candidato inscrito para esta vaga ainda.</p>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default GestaoVaga;