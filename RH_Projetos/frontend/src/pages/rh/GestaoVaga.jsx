import React, { useState, useEffect, useMemo } from 'react'; // --- ALTERADO: Adicionado useMemo
import api from '../../api';
import { useAuth } from '../../AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './GestaoVaga.css';
import Button from '../../components/Button';
import { FaUsers, FaChevronDown, FaTrash, FaArrowRight, FaFilePdf, FaClipboardCheck, FaExclamationCircle } from 'react-icons/fa';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    // ... (Modal de confirmação existente - sem alteração)
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
    const navigate = useNavigate();
    const [vagasComCandidatos, setVagasComCandidatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedVaga, setExpandedVaga] = useState(null);
    
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    // --- NOVO: State para filtros e ordenação por vaga (chave é o vaga.id) ---
    const [vagaFilters, setVagaFilters] = useState({});

    const statusOrdem = [
        'Aguardando Teste', 'Teste Disponível', 'Entrevista com RH', 
        'Entrevista com Gestor', 'Manual', 'Envio de Documentos', 'Finalizado'
    ];

    // --- NOVO: Funções auxiliares para gerenciar o state dos filtros ---
    const getFiltersForVaga = (vagaId) => {
        // Retorna os filtros para uma vaga específica ou os valores padrão
        return vagaFilters[vagaId] || {
            searchTerm: '',
            filterStatus: 'All',
            sortOrder: 'default' // 'default' | 'alpha-asc' | 'alpha-desc'
        };
    };

    const updateVagaFilter = (vagaId, filterName, value) => {
        // Atualiza um filtro específico para uma vaga específica
        setVagaFilters(prev => ({
            ...prev,
            [vagaId]: {
                ...getFiltersForVaga(vagaId),
                [filterName]: value
            }
        }));
    };


    const getNextStatus = (statusAtual) => {
        // ... (função existente - sem alteração)
        const currentIndex = statusOrdem.indexOf(statusAtual);
        if (currentIndex >= 0 && currentIndex < statusOrdem.length - 1) {
            return statusOrdem[currentIndex + 1];
        }
        return statusAtual;
    };

    const handleAvancarEtapa = async (candidato, vagaId) => {
        // ... (função existente - sem alteração)
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
        // ... (função existente - sem alteração)
        setModalState({
            isOpen: true,
            title: 'Eliminar Candidatura',
            message: 'Tem certeza que deseja eliminar esta candidatura? Esta ação é irreversível.',
            onConfirm: () => executeEliminarCandidatura(candidaturaId, vagaId)
        });
    };

    const executeEliminarCandidatura = async (candidaturaId, vagaId) => {
        // ... (função existente - sem alteração)
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
        // ... (função existente - sem alteração)
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
        // ... (função existente - sem alteração)
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
        // ... (função existente - sem alteração)
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

    const renderizarDocumentos = (candidato) => {
        // ... (função existente - sem alteração)
        const links = [];

        if (candidato.curriculo_path) {
            links.push(
                <a key="curriculo" href={`http://localhost:3001${candidato.curriculo_path}`} target="_blank" rel="noopener noreferrer" className="link-doc">
                    <FaFilePdf /> Currículo
                </a>
            );
        }

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
                // ... (Modal props - sem alteração)
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false })}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
                message={modalState.message}
            />
            <header className="gestao-header">
                {/* ... (Header - sem alteração) */}
                <h1>Gerenciamento de Vagas</h1>
                <p>Visualize e gerencie os candidatos de cada uma das suas vagas ativas.</p>
            </header>
            <main className="vagas-accordion">
                {vagasComCandidatos.length === 0 ? (
                    // ... (nenhuma vaga - sem alteração)
                    <div className="nenhuma-vaga-gestao">
                         {/* ... */}
                    </div> 
                ) : (
                    vagasComCandidatos.map((vaga) => {
                        
                        // --- NOVO: Lógica de filtro e ordenação ---
                        // 1. Pega os filtros atuais para esta vaga específica
                        const { searchTerm, filterStatus, sortOrder } = getFiltersForVaga(vaga.id);

                        // 2. Aplica a lógica (usando uma função auto-invocada para manter limpo)
                        const filteredCandidatos = (() => {
                            let resultado = vaga.candidatos || [];

                            // Filtro por Status
                            if (filterStatus && filterStatus !== 'All') {
                                resultado = resultado.filter(c => (c.status || '') === filterStatus);
                            }

                            // Filtro por Nome (SearchTerm)
                            if (searchTerm && searchTerm.trim() !== '') {
                                const termo = searchTerm.trim().toLowerCase();
                                resultado = resultado.filter(c => (c.nome || '').toLowerCase().includes(termo));
                            }

                            // Ordenação
                            if (sortOrder === 'alpha-asc') {
                                // Ordem alfabética A-Z
                                resultado = resultado.slice().sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
                            } else if (sortOrder === 'alpha-desc') {
                                // Ordem alfabética Z-A
                                resultado = resultado.slice().sort((a, b) => (b.nome || '').localeCompare(a.nome || ''));
                            }
                            // Se sortOrder === 'default', mantém a ordem original (de inscrição)
                            
                            return resultado;
                        })();
                        // --- FIM DA LÓGICA ---


                        return (
                            <div key={vaga.id} className={`vaga-item ${expandedVaga === vaga.id ? 'expanded' : ''}`}>
                                <div className="vaga-item-header" onClick={() => toggleExpandir(vaga.id)}>
                                    {/* ... (Header do item - sem alteração) */}
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

                                    {/* --- NOVO: Barra de Filtros --- */}
                                    {/* Só mostra a barra se houver candidatos na vaga */}
                                    {vaga.candidatos.length > 0 && (
                                        <div className="filtros-bar-candidatos">
                                            <input
                                                type="search"
                                                className="filtro-input"
                                                placeholder="Pesquisar por nome..."
                                                value={searchTerm}
                                                onChange={(e) => updateVagaFilter(vaga.id, 'searchTerm', e.target.value)}
                                                aria-label="Pesquisar candidato por nome"
                                            />
                                            
                                            <select 
                                                className="filtro-select" 
                                                value={filterStatus} 
                                                onChange={(e) => updateVagaFilter(vaga.id, 'filterStatus', e.target.value)}
                                                aria-label="Filtrar por etapa"
                                            >
                                                <option value="All">Todas as Etapas</option>
                                                {statusOrdem.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>

                                            <select 
                                                className="filtro-select" 
                                                value={sortOrder} 
                                                onChange={(e) => updateVagaFilter(vaga.id, 'sortOrder', e.target.value)}
                                                aria-label="Ordenar candidatos"
                                            >
                                                <option value="default">Ordem de Inscrição</option>
                                                <option value="alpha-asc">Ordem Alfabética (A-Z)</option>
                                                <option value="alpha-desc">Ordem Alfabética (Z-A)</option>
                                            </select>
                                        </div>
                                    )}
                                    {/* --- FIM da Barra de Filtros --- */}


                                    {/* --- LÓGICA DE EXIBIÇÃO ATUALIZADA --- */}
                                    {vaga.candidatos.length === 0 ? (
                                        <p className="nenhum-candidato">Nenhum candidato inscrito nesta vaga.</p>
                                    ) : filteredCandidatos.length === 0 ? (
                                        <p className="nenhum-candidato">Nenhum candidato encontrado com os filtros atuais.</p>
                                    ) : (
                                        <table className="candidatos-table">
                                            <thead>
                                                <tr>
                                                    {/* ... (Thead - sem alteração) */}
                                                    <th>Candidato</th>
                                                    <th>Contato</th>
                                                    <th>Documentos</th>
                                                    <th>Nota Teste</th>
                                                    <th>Status</th>
                                                    <th style={{ textAlign: 'right' }}>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* --- ALTERADO: Mapeia filteredCandidatos --- */}
                                                {filteredCandidatos.map((candidato) => (
                                                    <tr key={candidato.candidatura_id}>
                                                        <td>{candidato.nome}</td>
                                                        <td>{candidato.email}</td>
                                                        <td>
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
                                                            <div className="coluna-acoes-wrapper">
                                                                <button onClick={() => handleAvancarEtapa(candidato, vaga.id)} className="btn-acao-gestao avancar" disabled={candidato.status === 'Finalizado'}><FaArrowRight /> Avançar</button>
                                                                <button onClick={() => handleEliminarCandidatura(candidato.candidatura_id, vaga.id)} className="btn-acao-gestao eliminar"><FaTrash /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </main>
        </div>
    );
};

export default GestaoVaga;