import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../AuthContext'; // Corrigido para usar o hook
import Button from '../../components/Button';
import './Documentos.css';

const Documentos = () => {
    const { candidaturaId } = useParams();
    const navigate = useNavigate();
    const { usuario } = useAuth(); // Pega o usuário logado do contexto

    // Estado para armazenar os arquivos selecionados
    const [documentos, setDocumentos] = useState({
        'RG_CPF': null,
        'CERTIDAO_NASCIMENTO': null,
        'COMPROVANTE_RESIDENCIA': null,
        'RESERVISTA': null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Define a lista base de documentos obrigatórios
    const documentosObrigatorios = [
        { id: 'RG_CPF', nome: 'RG / CPF' },
        { id: 'CERTIDAO_NASCIMENTO', nome: 'Certidão de Nascimento' },
        { id: 'COMPROVANTE_RESIDENCIA', nome: 'Comprovante de Residência' },
    ];

    // Adiciona o documento de reservista condicionalmente se o usuário for do gênero Masculino
    if (usuario && usuario.genero === 'Masculino') {
        documentosObrigatorios.push({ id: 'RESERVISTA', nome: 'Certificado de Reservista' });
    }

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            setDocumentos(prevState => ({
                ...prevState,
                [name]: files[0]
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        
        // Verifica se todos os documentos obrigatórios foram anexados
        for (const doc of documentosObrigatorios) {
            if (!documentos[doc.id]) {
                setError(`O documento "${doc.nome}" é obrigatório.`);
                setLoading(false);
                return;
            }
            // Anexa cada arquivo ao FormData
            formData.append('documentos', documentos[doc.id], doc.id);
        }
        
        try {
            // Rota do backend para receber múltiplos arquivos
            await api.post(`/candidaturas/${candidaturaId}/documentos`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Atualiza o status da candidatura para a próxima fase (ex: 'Finalizado')
            await api.put(`/candidaturas/${candidaturaId}/status`, { status: 'Finalizado' });

            alert('Documentos enviados com sucesso!');
            // Navega de volta para a tela de etapas para ver o processo concluído
            const candidatura = await api.get(`/candidaturas/${candidaturaId}`);
            navigate(`/candidato/inscricao/etapas/${candidatura.data.vaga_id}/${candidaturaId}`);
            
        } catch (err) {
            console.error('Erro ao enviar documentos:', err);
            setError('Ocorreu um erro ao enviar os documentos. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="documentos-container">
            <h1>Envio de Documentos</h1>
            <p>Por favor, anexe os documentos solicitados abaixo para finalizar sua candidatura.</p>

            <form onSubmit={handleSubmit} className="documentos-form">
                {documentosObrigatorios.map((doc) => (
                    <div className="form-group" key={doc.id}>
                        <label htmlFor={doc.id}>{doc.nome}</label>
                        <input
                            type="file"
                            id={doc.id}
                            name={doc.id}
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                        />
                         {documentos[doc.id] && <span className="file-name">Arquivo selecionado: {documentos[doc.id].name}</span>}
                    </div>
                ))}
                
                {error && <div className="error-message">{error}</div>}

                <Button type="submit" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Documentos e Finalizar'}
                </Button>
            </form>
        </div>
    );
};

export default Documentos;