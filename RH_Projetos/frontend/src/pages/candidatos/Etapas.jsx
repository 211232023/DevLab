import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import './Etapas.css';
import { FaFileAlt, FaPencilAlt, FaBook, FaFolderOpen, FaUsers, FaCheckCircle, FaUserTie, FaBuilding } from 'react-icons/fa';

const Etapas = () => {
    const { vagaId, candidaturaId } = useParams();
    const navigate = useNavigate();

    const [candidatura, setCandidatura] = useState(null);
    const [teste, setTeste] = useState(null);
    const [vaga, setVaga] = useState(null); // Estado para guardar informações da vaga
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [candidaturaRes, testeRes, vagaRes] = await Promise.all([
                    api.get(`/candidaturas/${candidaturaId}`),
                    api.get(`/testes/vaga/${vagaId}`).catch(err => {
                        if (err.response && err.response.status === 404) return { data: null };
                        throw err;
                    }),
                    api.get(`/vagas/${vagaId}`) // Busca os dados da vaga
                ]);
                setCandidatura(candidaturaRes.data);
                setTeste(testeRes.data);
                setVaga(vagaRes.data); // Armazena os dados da vaga
            } catch (err) {
                console.error("Erro ao buscar dados das etapas:", err);
                setError('Não foi possível carregar os detalhes da sua candidatura.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [candidaturaId, vagaId]);

    const testeRealizado = candidatura?.pontuacao_teste != null;

    const etapasConfig = [
        { nome: 'Inscrição Realizada', statusEnum: 'Aguardando Teste', path: null, icon: <FaFileAlt />, descricao: 'Sua inscrição foi recebida com sucesso e está em análise.' },
        { 
            nome: 'Teste Online', statusEnum: 'Teste Disponível',
            path: teste && !testeRealizado ? `/teste/${teste.id}/${candidaturaId}` : null,
            icon: <FaPencilAlt />,
            descricao: testeRealizado ? 'Seu teste foi finalizado e aguarda avaliação.' : 'Realize o teste técnico para esta vaga.'
        },
        { nome: 'Entrevista com RH', statusEnum: 'Entrevista com RH', path: null, icon: <FaUsers />, descricao: 'O recrutador entrará em contato para agendar.' },
        { nome: 'Entrevista com Gestor', statusEnum: 'Entrevista com Gestor', path: null, icon: <FaUserTie />, descricao: 'O gestor da área entrará em contato para agendar.' },
        { nome: 'Manual da Empresa', statusEnum: 'Manual', path: `/candidato/manual/${candidaturaId}`, icon: <FaBook />, descricao: 'Conheça mais sobre nossa cultura e valores.' },
        { nome: 'Envio de Documentos', statusEnum: 'Envio de Documentos', path: `/candidato/documentos/${candidaturaId}`, icon: <FaFolderOpen />, descricao: 'Envie os documentos necessários para a próxima fase.' },
        { nome: 'Processo Finalizado', statusEnum: 'Finalizado', path: null, icon: <FaCheckCircle />, descricao: 'O processo seletivo foi concluído. Agradecemos sua participação!' },
    ];

    const currentStatusIndex = etapasConfig.findIndex(etapa => etapa.statusEnum === candidatura?.status);

    const getStatusClass = (index) => {
        if (currentStatusIndex === -1 && index === 0) return 'current';
        if (index < currentStatusIndex) return 'completed';
        if (index === currentStatusIndex) return 'current';
        return 'pending';
    };

    const handleEtapaClick = (etapa, index) => {
        if (getStatusClass(index) === 'current' && etapa.path) {
            navigate(etapa.path);
        }
    };

    if (loading) return <div className="loading-container">Carregando etapas...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="etapas-page-wrapper">
             <header className="etapas-header">
                <h1>Acompanhamento do Processo Seletivo</h1>
                {vaga && (
                    <div className="vaga-summary-card">
                        <FaBuilding className="company-icon"/>
                        <div>
                            <h3>{vaga.titulo}</h3>
                            <p>{vaga.area}</p>
                        </div>
                    </div>
                )}
            </header>
            <main className="etapas-timeline">
                {etapasConfig.map((etapa, index) => {
                    const statusClass = getStatusClass(index);
                    const isClickable = statusClass === 'current' && etapa.path;

                    return (
                        <div key={etapa.nome} className={`timeline-item ${statusClass} ${isClickable ? 'clickable' : ''}`} onClick={() => handleEtapaClick(etapa, index)}>
                            <div className="timeline-marker">
                                <div className="timeline-icon">{etapa.icon}</div>
                            </div>
                            <div className="timeline-content">
                                <h3 className="timeline-title">{etapa.nome}</h3>
                                <p className="timeline-desc">{etapa.descricao}</p>
                            </div>
                        </div>
                    );
                })}
            </main>
        </div>
    );
};

export default Etapas;