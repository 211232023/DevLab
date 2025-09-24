import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import Button from '../../components/Button';
import './ManualEmpresa.css';
import { FaBookOpen, FaCheck } from 'react-icons/fa';

const ManualEmpresa = () => {
    const { candidaturaId } = useParams();
    const navigate = useNavigate();
    
    const [candidatura, setCandidatura] = useState(null);
    const [concordou, setConcordou] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCandidatura = async () => {
            if (!candidaturaId) {
                setError("ID da candidatura não encontrado.");
                setLoading(false);
                return;
            }
            try {
                const response = await api.get(`/candidaturas/${candidaturaId}`);
                setCandidatura(response.data);
            } catch (err) {
                setError("Não foi possível carregar os dados. Tente recarregar a página.");
            } finally {
                setLoading(false);
            }
        };
        fetchCandidatura();
    }, [candidaturaId]);

    const handleConfirmar = async () => {
        if (!concordou) {
            alert('Você precisa concordar com os termos para continuar.');
            return;
        }

        setLoading(true);
        try {
            const novoStatus = 'Envio de Documentos';
            await api.put(`/candidaturas/${candidaturaId}/status`, { status: novoStatus });
            
            // Navega de volta para a tela de etapas
            navigate(`/etapas/${candidatura.vaga_id}/${candidaturaId}`);

        } catch (err) {
            alert('Não foi possível registrar sua confirmação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container">Carregando...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="manual-page-wrapper">
            <div className="manual-container">
                <header className="manual-header">
                    <FaBookOpen className="header-icon" />
                    <h1>Manual de Conduta e Ética</h1>
                    <p>Leia atentamente o documento abaixo e confirme a leitura para prosseguir.</p>
                </header>
                
                <div className="pdf-viewer">
                    <iframe 
                        src="/MANUAL-DE-CONDUTA-E-ETICA-DO-COLABORADOR.pdf" 
                        width="100%" 
                        height="600px"
                        title="Manual de Conduta e Ética do Colaborador"
                    >
                        Seu navegador não suporta PDFs. 
                        <a href="/MANUAL-DE-CONDUTA-E-ETICA-DO-COLABORADOR.pdf" download>Baixe o PDF aqui.</a>
                    </iframe>
                </div>

                <div className="confirmacao-secao">
                    <label htmlFor="concordo" className="checkbox-label">
                        <input 
                            type="checkbox" 
                            id="concordo" 
                            checked={concordou} 
                            onChange={(e) => setConcordou(e.target.checked)} 
                        />
                        <span className="custom-checkbox">
                            {concordou && <FaCheck />}
                        </span>
                        Li e concordo com os termos do Manual de Conduta e Ética da Empresa.
                    </label>
                </div>
                
                <div className="form-actions">
                    <Button style={{backgroundColor:"#cc4040ff"}} type="button" className="btn-cancel" onClick={() => navigate(-1)}>Voltar</Button>
                    <Button onClick={handleConfirmar} className="btn-confirm" disabled={loading || !concordou}>
                        {loading ? 'Confirmando...' : 'Confirmar e Avançar'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ManualEmpresa;