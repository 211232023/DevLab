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

    // --- NOVO: Estados para controlar o modal de documentos ---
    const [modalVisivel, setModalVisivel] = useState(false);
    const [documentosCandidato, setDocumentosCandidato] = useState([]);
    const [candidatoSelecionado, setCandidatoSelecionado] = useState(null);
    const [loadingDocumentos, setLoadingDocumentos] = useState(false);

    const statusOrdem = [
        'Aguardando Teste', 'Teste Disponível', 'Entrevista com RH',
        'Entrevista com Gestor', 'Manual', 'Envio de Documentos', 'Finalizado'
    ];

    const getNextStatus = (statusAtual) => {
        const currentIndex = statusOrdem.indexOf(statusAtual);
        if (currentIndex >= 0 && currentIndex < statusOrdem.length - 1) {
            return statusOrdem[currentIndex + 1];
        }
        return statusAtual;
    };

    const carregarDados = async () => {
        if (user && (user.tipo === 'ADMIN' || user.tipo === 'RH')) {
            setLoading(true);
            try {
                const vagasResponse = await api.get('/vagas');
                const vagasData = vagasResponse.data;

                if (vagasData.length > 0) {
                    const vagasCompletas = await Promise.all(
                        vagasData.map(async (vaga) => {
                            try {
                                // ROTA CORRETA: /candidaturas/vagas/:vagaId/candidatos
                                const candidatosResponse = await api.get(`/candidaturas/vagas/${vaga.id}/candidatos`);
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

    useEffect(() => {
        carregarDados();
    }, [user]);
    
    const handleAvancarEtapa = async (candidaturaId, statusAtual) => {
        const novoStatus = getNextStatus(statusAtual);
        if (novoStatus === statusAtual) {
            alert('O candidato já está na etapa final do processo.');
            return;
        }
        try {
            await api.put(`/candidaturas/${candidaturaId}/status`, { status: novoStatus });
            // Recarrega os dados para garantir consistência
            carregarDados();
        } catch (err) {
            console.error('Erro ao avançar etapa:', err);
            alert('Não foi possível avançar a etapa do candidato.');
        }
    };

    const handleEliminarCandidatura = async (candidaturaId) => {
        if (window.confirm('Tem certeza que deseja eliminar esta candidatura?')) {
            try {
                await api.delete(`/candidaturas/${candidaturaId}`);
                // Recarrega os dados
                carregarDados();
            } catch (err) {
                console.error('Erro ao eliminar candidatura:', err);
                alert('Não foi possível eliminar a candidatura.');
            }
        }
    };

    // --- NOVO: Função para buscar e exibir documentos ---
    const handleVerDocumentos = async (candidato) => {
        setCandidatoSelecionado(candidato);
        setModalVisivel(true);
        setLoadingDocumentos(true);
        try {
            // Rota que você precisará criar no backend
            const response = await api.get(`/candidaturas/${candidato.candidatura_id}/documentos`);
            setDocumentosCandidato(response.data);
        } catch (error) {
            console.error("Erro ao buscar documentos do candidato:", error);
            setDocumentosCandidato([]); // Limpa em caso de erro
        } finally {
            setLoadingDocumentos(false);
        }
    };
    
    const fecharModal = () => {
        setModalVisivel(false);
        setCandidatoSelecionado(null);
        setDocumentosCandidato([]);
    };

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
                                            <th>Nome</th>
                                            <th>Email</th>
                                            {/* --- COLUNA ADICIONADA: Telefone --- */}
                                            <th>Telefone</th>
                                            <th>Currículo</th>
                                            <th>Nota do Teste</th>
                                            <th>Status Atual</th>
                                            {/* --- COLUNA ADICIONADA: Documentos --- */}
                                            <th>Documentos</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vaga.candidatos.map((candidato) => (
                                            <tr key={candidato.candidatura_id}>
                                                <td>{candidato.nome}</td>
                                                <td>{candidato.email}</td>
                                                {/* --- DADO ADICIONADO: Telefone --- */}
                                                <td>{candidato.telefone || 'N/A'}</td>
                                                <td>
                                                    {candidato.curriculo_path ? (
                                                        <a href={`http://localhost:3001${candidato.curriculo_path}`} target="_blank" rel="noopener noreferrer" className="link-curriculo">
                                                            Ver Currículo
                                                        </a>
                                                    ) : ('Não enviado')}
                                                </td>
                                                <td>
                                                    {candidato.pontuacao_teste !== null ? `${parseFloat(candidato.pontuacao_teste).toFixed(2)}%` : 'Não realizado'}
                                                </td>
                                                <td>{candidato.status}</td>
                                                {/* --- BOTÃO ADICIONADO: Documentos --- */}
                                                <td>
                                                    <button onClick={() => handleVerDocumentos(candidato)} className="btn-acao ver-docs">
                                                        Ver
                                                    </button>
                                                </td>
                                                <td className="coluna-acoes">
                                                    <button className="btn-acao avancar" onClick={() => handleAvancarEtapa(candidato.candidatura_id, candidato.status)} disabled={candidato.status === 'Finalizado'}>
                                                        Avançar
                                                    </button>
                                                    <button className="btn-acao eliminar" onClick={() => handleEliminarCandidatura(candidato.candidatura_id)}>
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

            {/* --- NOVO: Modal de Documentos --- */}
            {modalVisivel && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Documentos de {candidatoSelecionado?.nome}</h2>
                        {loadingDocumentos ? (
                            <p>Carregando documentos...</p>
                        ) : (
                            <ul>
                                {documentosCandidato.length > 0 ? (
                                    documentosCandidato.map(doc => (
                                        <li key={doc.id}>
                                            <span>{doc.tipo_documento.replace(/_/g, ' ')}:</span>
                                            <a href={`http://localhost:3001/${doc.caminho_arquivo}`} target="_blank" rel="noopener noreferrer">
                                                Visualizar Documento
                                            </a>
                                        </li>
                                    ))
                                ) : (
                                    <p>Nenhum documento encontrado para este candidato.</p>
                                )}
                            </ul>
                        )}
                        <button onClick={fecharModal}>Fechar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestaoVaga;