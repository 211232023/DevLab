import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../AuthContext';
import { Link } from 'react-router-dom';
import './GestaoVaga.css';
import Button from '../../components/Button';
import { FaUsers, FaChevronDown, FaTrash, FaArrowRight, FaFilePdf, FaClipboardCheck, FaExclamationCircle } from 'react-icons/fa';

// --- Componente do Modal de Confirmação ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-backdrop">
            <div className="confirm-modal-content">
                <FaExclamationCircle className="confirm-modal-icon" />
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirm-modal-actions">
                    <Button onClick={onClose} className="btn-cancel">Cancelar</Button>
                    <Button onClick={onConfirm} className="btn-confirm-delete">Confirmar</Button>
                </div>
            </div>
        </div>
    );
};


const GestaoVaga = () => {
    const { user } = useAuth();
    const [vagasComCandidatos, setVagasComCandidatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedVaga, setExpandedVaga] = useState(null);
    
    // State para o modal de confirmação
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

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

    const handleAvancarEtapa = async (candidato, vagaId) => {
        const { candidatura_id, status: statusAtual, pontuacao_teste } = candidato;

        if (statusAtual === 'Teste Disponível' && (pontuacao_teste === null || pontuacao_teste === undefined)) {
            alert('O candidato não pode avançar, pois ainda não realizou o teste.');
            return;
        }

        const novoStatus = getNextStatus(statusAtual);
        if (novoStatus === statusAtual) {
            alert('O candidato já está na etapa final.');
            return;
        }

        try {
            await api.put(`/candidaturas/${candidatura_id}/status`, { status: novoStatus });
            setVagasComCandidatos(vagasAtuais => vagasAtuais.map(vaga => 
                vaga.id === vagaId ? { ...vaga, candidatos: vaga.candidatos.map(c => 
                    c.candidatura_id === candidatura_id ? { ...c, status: novoStatus } : c
                )} : vaga
            ));
        } catch (err) {
            alert('Não foi possível avançar a etapa do candidato.');
        }
    };

    const handleEliminarCandidatura = (candidaturaId, vagaId) => {
        setModalState({
            isOpen: true,
            title: 'Eliminar Candidatura',
            message: 'Tem certeza que deseja eliminar esta candidatura? Esta ação é irreversível.',
            onConfirm: () => executeEliminarCandidatura(candidaturaId, vagaId)
        });
    };

    const executeEliminarCandidatura = async (candidaturaId, vagaId) => {
         try {
            await api.delete(`/candidaturas/${candidaturaId}`);
            setVagasComCandidatos(vagasAtuais => vagasAtuais.map(vaga => 
                vaga.id === vagaId ? { ...vaga, candidatos: vaga.candidatos.filter(c => c.candidatura_id !== candidaturaId)} : vaga
            ));
        } catch (err) {
            alert('Não foi possível eliminar a candidatura.');
        } finally {
            setModalState({ isOpen: false });
        }
    };
    
    const handleDeletarVaga = (vagaId) => {
        const vaga = vagasComCandidatos.find(v => v.id === vagaId);
        const numCandidatos = vaga ? vaga.candidatos.length : 0;
        
        setModalState({
            isOpen: true,
            title: 'Deletar Vaga',
            message: `Tem certeza? TODAS as ${numCandidatos} candidaturas associadas serão permanentemente removidas. Esta ação não pode ser desfeita.`,
            onConfirm: () => executeDeletarVaga(vagaId)
        });
    };

    const executeDeletarVaga = async (vagaId) => {
        try {
            await api.delete(`/vagas/${vagaId}`);
            setVagasComCandidatos(vagasAtuais => vagasAtuais.filter(vaga => vaga.id !== vagaId));
            alert('Vaga deletada com sucesso!');
        } catch (err) {
            alert('Não foi possível deletar a vaga.');
        } finally {
            setModalState({ isOpen: false });
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
                                    // A API agora retorna 'outros_documentos' nesta chamada
                                    const candidatosResponse = await api.get(`/candidaturas/vagas/${vaga.id}/candidatos`);
                                    return { ...vaga, candidatos: candidatosResponse.data };
                                } catch (err) {
                                    return { ...vaga, candidatos: [] };
                                }
                            })
                        );
                        setVagasComCandidatos(vagasCompletas);
                    }
                } catch (err) {
                    setError('Não foi possível carregar as informações.');
                } finally {
                    setLoading(false);
                }
            }
        };
        carregarTodasAsVagas();
    }, [user]);

    // --- FUNÇÃO ADICIONADA PARA RENDERIZAR DOCUMENTOS ---
    const renderizarDocumentos = (candidato) => {
        const links = [];

        // 1. Adiciona o link do currículo (que já funciona)
        if (candidato.curriculo_path) {
            links.push(
                <a key="curriculo" href={`http://localhost:3001${candidato.curriculo_path}`} target="_blank" rel="noopener noreferrer" className="link-doc">
                    <FaFilePdf /> Currículo
                </a>
            );
        }

        // 2. Processa a nova string 'outros_documentos'
        if (candidato.outros_documentos) {
            candidato.outros_documentos.split(';;').forEach((docString, index) => {
                const [tipo, caminho] = docString.split('::');
                if (tipo && caminho) {
                    links.push(
                        <a key={`doc-${index}`} href={`http://localhost:3001${caminho}`} target="_blank" rel="noopener noreferrer" className="link-doc">
                            <FaFilePdf /> {tipo}
                        </a>
                    );
                }
            });
        }

        // Se não houver nenhum link, retorna uma mensagem
        if (links.length === 0) {
            return <span>Nenhum documento</span>;
        }

        return links;
    };

    const toggleExpandir = (id) => setExpandedVaga(expandedVaga === id ? null : id);

    if (loading) return <div className="loading-container">Carregando gestão de vagas...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="gestao-page-wrapper">
             <ConfirmModal 
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false })}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
                message={modalState.message}
            />
            <header className="gestao-header">
                <h1>Gerenciamento de Vagas</h1>
                <p>Visualize e gerencie os candidatos de cada uma das suas vagas ativas.</p>
            </header>
            <main className="vagas-accordion">
                {vagasComCandidatos.length === 0 ? (
                    <div className="nenhuma-vaga-gestao">
                        <h3>Nenhuma vaga cadastrada.</h3>
                        <p>Comece publicando uma nova oportunidade.</p>
                        <Link to="/cadastro-vaga" className="btn-acao-gestao cadastrar">Cadastrar Nova Vaga</Link>
                    </div>
                ) : (
                    vagasComCandidatos.map((vaga) => (
                        <div key={vaga.id} className={`vaga-item ${expandedVaga === vaga.id ? 'expanded' : ''}`}>
                            <div className="vaga-item-header" onClick={() => toggleExpandir(vaga.id)}>
                                <div className="vaga-info">
                                    <h2>{vaga.titulo}</h2>
                                    <span className="candidatos-count"><FaUsers /> {vaga.candidatos.length} Candidato(s)</span>
                                </div>
                                <div className="vaga-actions">
                                    <button onClick={(e) => { e.stopPropagation(); handleDeletarVaga(vaga.id); }} className="btn-delete-vaga"><FaTrash /> Deletar Vaga</button>
                                    <FaChevronDown className="expand-icon" />
                                </div>
                            </div>
                            <div className="candidatos-table-container">
                                {vaga.candidatos.length > 0 ? (
                                    <table className="candidatos-table">
                                        <thead>
                                            <tr>
                                                <th>Candidato</th>
                                                <th>Contato</th>
                                                <th>Documentos</th>
                                                <th>Nota Teste</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: 'right' }}>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vaga.candidatos.map((candidato) => (
                                                <tr key={candidato.candidatura_id}>
                                                    <td>{candidato.nome}</td>
                                                    <td>{candidato.email}</td>
                                                    <td>
                                                        {/* --- CÉLULA DE DOCUMENTOS MODIFICADA --- */}
                                                        <div className="documentos-links-container">
                                                            {renderizarDocumentos(candidato)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`nota-teste ${!candidato.pontuacao_teste ? 'pendente' : ''}`}>
                                                            {candidato.pontuacao_teste !== null ? `${parseFloat(candidato.pontuacao_teste).toFixed(1)}%` : 'Pendente'}
                                                        </span>
                                                    </td>
                                                    <td>{candidato.status}</td>
                                                    <td className="coluna-acoes">
                                                        <button onClick={() => handleAvancarEtapa(candidato, vaga.id)} className="btn-acao-gestao avancar" disabled={candidato.status === 'Finalizado'}><FaArrowRight /> Avançar</button>
                                                        <button onClick={() => handleEliminarCandidatura(candidato.candidatura_id, vaga.id)} className="btn-acao-gestao eliminar"><FaTrash /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : <p className="nenhum-candidato">Nenhum candidato inscrito nesta vaga.</p>}
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default GestaoVaga;