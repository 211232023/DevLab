import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import './Etapas.css';
import { FaFileAlt, FaPencilAlt, FaBook, FaFolderOpen, FaUsers, FaCheckCircle, FaUserTie } from 'react-icons/fa';

const Etapas = () => {
    const { vagaId, candidaturaId } = useParams();
    const navigate = useNavigate();
    
    const [candidatura, setCandidatura] = useState(null);
    const [teste, setTeste] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [candidaturaRes, testeRes] = await Promise.all([
                    api.get(`/candidaturas/${candidaturaId}`),
                    api.get(`/testes/vaga/${vagaId}`).catch(err => {
                        if (err.response && err.response.status === 404) return { data: null };
                        throw err;
                    })
                ]);
                setCandidatura(candidaturaRes.data);
                setTeste(testeRes.data);
            } catch (err) {
                console.error("Erro ao buscar dados das etapas:", err);
                setError('Não foi possível carregar os detalhes da sua candidatura.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [candidaturaId, vagaId]);

    // --- CONFIGURAÇÃO DAS ETAPAS ATUALIZADA ---
    const etapasConfig = [
        { 
            nome: 'Inscrição Realizada', 
            statusEnum: 'Aguardando Teste', 
            path: null,
            icon: <FaFileAlt />,
            descricao: 'Sua inscrição foi recebida com sucesso e está em análise.'
        },
        { 
            nome: 'Teste Online', 
            statusEnum: 'Teste Disponível', 
            path: teste ? `/teste/${teste.id}/${candidaturaId}` : null,
            icon: <FaPencilAlt />,
            descricao: 'Realize o teste técnico para esta vaga.'
        },
        // --- NOVAS ETAPAS ADICIONADAS ---
        { 
            nome: 'Entrevista com RH', 
            statusEnum: 'Entrevista com RH', 
            path: null, // Sem link, apenas informativo
            icon: <FaUsers />,
            descricao: 'O recrutador entrará em contato através do seu e-mail ou telefone para agendar.'
        },
        { 
            nome: 'Entrevista com Gestor', 
            statusEnum: 'Entrevista com Gestor', 
            path: null, // Sem link, apenas informativo
            icon: <FaUserTie />, // Ícone diferente para o gestor
            descricao: 'O gestor da área entrará em contato através do seu e-mail ou telefone para agendar.'
        },
        // --- RESTANTE DAS ETAPAS ---
        { 
            nome: 'Manual da Empresa', 
            statusEnum: 'Manual', 
            path:  `/candidato/manual/${candidaturaId}`,
            icon: <FaBook />,
            descricao: 'Conheça mais sobre nossa cultura e valores.'
        },
        { 
            nome: 'Envio de Documentos', 
            statusEnum: 'Envio de Documentos', 
            path: `/candidato/documentos/${candidaturaId}`,
            icon: <FaFolderOpen />,
            descricao: 'Envie os documentos necessários para a próxima fase.'
        },
        { 
            nome: 'Processo Finalizado', 
            statusEnum: 'Finalizado', 
            path: null,
            icon: <FaCheckCircle />,
            descricao: 'O processo seletivo para esta vaga foi concluído. Agradecemos sua participação!'
        },
    ];

    const currentStatusIndex = etapasConfig.findIndex(etapa => etapa.statusEnum === candidatura?.status);

    const getStatusClass = (index) => {
        if (currentStatusIndex === -1 && index === 0) return 'current'; // Caso inicial
        if (index < currentStatusIndex) return 'completed';
        if (index === currentStatusIndex) return 'current';
        return 'pending';
    };

    const handleEtapaClick = (etapa, index) => {
    // Permite o clique apenas na etapa atual e se houver um caminho definido
    if (getStatusClass(index) === 'current' && etapa.path) {
        // Substitui o placeholder :candidaturaId pelo ID real
        const pathFinal = etapa.path.replace(':candidaturaId', candidaturaId);
        navigate(pathFinal);
    }
    };

    if (loading) return <div className="loading-container">Carregando etapas...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="etapas-page-container">
            <h1>Progresso da Candidatura</h1>
            <p>Acompanhe aqui as etapas do seu processo seletivo.</p>
            <div className="etapas-timeline">
                {etapasConfig.map((etapa, index) => {
                    const statusClass = getStatusClass(index);
                    const positionClass = index % 2 === 0 ? 'left' : 'right';
                    const isClickable = statusClass === 'current' && etapa.path;

                    return (
                        <div 
                            key={etapa.nome}
                            className={`timeline-item-container ${positionClass} ${statusClass} ${isClickable ? 'clickable' : ''}`}
                            onClick={() => handleEtapaClick(etapa, index)}
                        >
                            <div className="timeline-icon">{etapa.icon}</div>
                            <div className="timeline-item-content">
                                <span className="timeline-item-title">{etapa.nome}</span>
                                <p className="timeline-item-desc">{etapa.descricao}</p>
                                <span className="timeline-item-circle"></span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Etapas;