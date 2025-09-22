import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import Button from '../../components/Button';
import './ManualEmpresa.css';

const ManualEmpresa = () => {
    const { candidaturaId } = useParams();
    const navigate = useNavigate();
    
    // Estados para controlar o componente
    const [candidatura, setCandidatura] = useState(null);
    const [concordou, setConcordou] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Busca os dados da candidatura assim que a página carrega
    useEffect(() => {
        const fetchCandidatura = async () => {
            // Se o ID não estiver presente na URL, não faz a chamada
            if (!candidaturaId) {
                setError("ID da candidatura não encontrado na URL.");
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/candidaturas/${candidaturaId}`);
                setCandidatura(response.data);
            } catch (err) {
                console.error("Erro ao buscar dados da candidatura:", err);
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
            // Define o próximo status no fluxo do processo
            const novoStatus = 'Envio de Documentos';
            
            // Atualiza o status da candidatura no backend
            await api.put(`/candidaturas/${candidaturaId}/status`, { status: novoStatus });
            
            // Navega de volta para a tela de etapas com os IDs corretos
            navigate(`/candidato/inscricao/etapas/${candidatura.vaga_id}/${candidaturaId}`);

        } catch (err) {
            console.error('Erro ao confirmar aceite do manual:', err);
            alert('Não foi possível registrar sua confirmação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container">Carregando...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="manual-container">
            <h1>Manual de Conduta e Ética</h1>
            <div className="pdf-viewer">
                <iframe 
                    src="/MANUAL-DE-CONDUTA-E-ETICA-DO-COLABORADOR.pdf" 
                    width="100%" 
                    height="500px"
                    title="Manual de Conduta e Ética do Colaborador"
                >
                    Seu navegador não suporta PDFs. 
                    <a href="/MANUAL-DE-CONDUTA-E-ETICA-DO-COLABORADOR.pdf">Baixe o PDF aqui.</a>
                </iframe>
            </div>

            <div className="confirmacao-secao">
                <label htmlFor="concordo">
                    <input 
                        type="checkbox" 
                        id="concordo" 
                        checked={concordou} 
                        onChange={(e) => setConcordou(e.target.checked)} 
                    />
                    Li e concordo com os termos do Manual de Conduta e Ética da Empresa.
                </label>
            </div>
            
            <Button onClick={handleConfirmar} disabled={loading || !concordou}>
                {loading ? 'Confirmando...' : 'Confirmar e Avançar'}
            </Button>
        </div>
    );
};

export default ManualEmpresa;