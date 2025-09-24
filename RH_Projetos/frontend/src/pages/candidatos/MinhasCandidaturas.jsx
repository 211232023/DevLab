import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import api from '../../api';
import './MinhasCandidaturas.css';
import Button from '../../components/Button';
import { FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaFileAlt, FaVideo, FaClipboardList, FaExclamationCircle, FaArrowRight } from 'react-icons/fa';

// --- Componente do Modal de Confirmação ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-backdrop">
            <div className="confirm-modal-content">
                <FaExclamationCircle className="confirm-modal-icon" />
                <h3>Confirmação</h3>
                <p>{message}</p>
                <div className="confirm-modal-actions">
                    <Button onClick={onClose} className="btn-cancel">Cancelar</Button>
                    <Button onClick={onConfirm} className="btn-confirm-delete">Sim, Desistir</Button>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal ---
const MinhasCandidaturas = () => {
    const [candidaturas, setCandidaturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidaturaId, setSelectedCandidaturaId] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const fetchCandidaturas = async () => {
                try {
                    setLoading(true);
                    const response = await api.get('/candidaturas/minhas');
                    setCandidaturas(response.data);
                } catch (err) {
                    setError('Erro ao buscar suas candidaturas.');
                    console.error('Erro detalhado:', err);
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

    const openConfirmModal = (candidaturaId) => {
        setSelectedCandidaturaId(candidaturaId);
        setIsModalOpen(true);
    };

    const handleDesistirConfirm = async () => {
        try {
            await api.delete(`/candidaturas/${selectedCandidaturaId}`);
            setCandidaturas(candidaturas.filter(c => c.id !== selectedCandidaturaId));
        } catch (err) {
            alert('Erro ao tentar desistir da vaga.');
            console.error(err);
        } finally {
            setIsModalOpen(false);
            setSelectedCandidaturaId(null);
        }
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            'aguardando teste': { className: 'aguardando', icon: <FaHourglassHalf />, text: 'Aguardando Teste' },
            'teste disponível': { className: 'disponivel', icon: <FaClipboardList />, text: 'Teste Disponível' },
            'manual': { className: 'manual', icon: <FaFileAlt />, text: 'Manual da Empresa' },
            'envio de documentos': { className: 'documentos', icon: <FaFileAlt />, text: 'Envio de Documentos' },
            'entrevista': { className: 'entrevista', icon: <FaVideo />, text: 'Entrevista' },
            'finalizado': { className: 'finalizado', icon: <FaCheckCircle />, text: 'Processo Finalizado' },
            'aprovado': { className: 'aprovado', icon: <FaCheckCircle />, text: 'Aprovado' },
            'reprovado': { className: 'reprovado', icon: <FaTimesCircle />, text: 'Reprovado' },
            default: { className: 'default', icon: <FaClock />, text: status || 'Não definido' }
        };
        return statusMap[status?.toLowerCase()] || statusMap.default;
    };

    if (loading) return <div className="loading-container">Carregando suas candidaturas...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="candidaturas-page-wrapper">
            <ConfirmModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDesistirConfirm}
                message="Tem certeza de que deseja desistir desta vaga? Esta ação não pode ser desfeita."
            />
            <header className="candidaturas-header">
                <h1>Minhas Candidaturas</h1>
                <p>Acompanhe o progresso de todas as suas oportunidades em um só lugar.</p>
            </header>
            <main className="lista-candidaturas">
                {candidaturas.length > 0 ? (
                    candidaturas.map((candidatura) => {
                        const statusInfo = getStatusInfo(candidatura.status);
                        return (
                            <div key={candidatura.id} className="candidatura-card">
                                <div className="card-header">
                                    <h2>{candidatura.nome_vaga}</h2>
                                    <span className={`status-badge ${statusInfo.className}`}>
                                        {statusInfo.icon} {statusInfo.text}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <p><strong>Área:</strong> {candidatura.area}</p>
                                </div>
                                <div className="card-footer">
                                    <Button
                                        style={{backgroundColor:"#cc4040ff"}}
                                        onClick={() => openConfirmModal(candidatura.id)}
                                        className="btn-desistir"
                                    >
                                        Desistir
                                    </Button>
                                    <Button
                                        className="btn-progresso"
                                        onClick={() => navigate(`/etapas/${candidatura.vaga_id}/${candidatura.id}`)}
                                    >
                                        Ver Progresso <FaArrowRight />
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="nenhuma-candidatura">
                        <h3>Você ainda não se candidatou a nenhuma vaga.</h3>
                        <p>Que tal começar agora?</p>
                        <Button className="btn-progresso" onClick={() => navigate('/inicio')}>Ver Vagas Disponíveis</Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MinhasCandidaturas;