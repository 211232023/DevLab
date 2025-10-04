import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import Button from '../../components/Button';
import './Documentos.css';
import { FaFileUpload, FaFilePdf, FaCheckCircle, FaFolderOpen } from 'react-icons/fa';

const FileUpload = ({ label, id, accept, onFileSelect, selectedFile }) => {
    return (
        <div className="form-group-upload">
            <label htmlFor={id} className="upload-label">
                <div className="upload-icon-wrapper">
                    {selectedFile ? <FaCheckCircle className="icon-success" /> : <FaFileUpload />}
                </div>
                <div className="upload-text-wrapper">
                    <strong>{label}</strong>
                    <span>{selectedFile ? selectedFile.name : 'Clique para selecionar um arquivo PDF'}</span>
                </div>
                <span className="upload-button-text">Selecionar</span>
            </label>
            <input
                type="file"
                id={id}
                accept={accept}
                onChange={(e) => onFileSelect(e.target.files[0])}
                style={{ display: 'none' }}
            />
        </div>
    );
};


const Documentos = () => {
    const navigate = useNavigate();
    const { candidaturaId } = useParams();

    const [files, setFiles] = useState({
        RG: null,
        CPF: null,
        ComprovanteResidencia: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!candidaturaId) {
            console.error("ID da candidatura não encontrado na URL.");
            navigate('/minhas-candidaturas');
        }
    }, [candidaturaId, navigate]);
    
    const handleFileSelect = (tipo, file) => {
        setFiles(prev => ({ ...prev, [tipo]: file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const filesToUpload = Object.entries(files)
            .filter(([tipo, file]) => file !== null)
            .map(([tipo, file]) => ({ tipo, file }));

        if (filesToUpload.length === 0) {
            setError('Você precisa anexar pelo menos um documento.');
            setLoading(false);
            return;
        }

        try {
            const uploadPromises = filesToUpload.map(item => {
                const formData = new FormData();
                formData.append('documento', item.file);
                formData.append('tipo', item.tipo);
                return api.post(`/candidaturas/${candidaturaId}/documentos`, formData);
            });

            await Promise.all(uploadPromises);

            setSuccess('Documentos enviados com sucesso!');
            
            setTimeout(() => {
                navigate(`/etapas/${candidaturaId}`); 
            }, 2000);

        } catch (err) {
            console.error("Erro no upload: ", err);
            setError(err.response?.data?.message || 'Ocorreu um erro ao enviar os documentos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="documentos-page-wrapper">
            <div className="documentos-container">
                <header className="documentos-header">
                    <FaFolderOpen className="header-icon" />
                    <h2>Envio de Documentos</h2>
                    <p>Anexe os documentos solicitados abaixo para prosseguir no processo seletivo.</p>
                </header>

                <form onSubmit={handleSubmit} className="documentos-form">
                    <FileUpload 
                        label="RG (Registro Geral)"
                        id="rg"
                        accept=".pdf"
                        selectedFile={files.RG}
                        onFileSelect={(file) => handleFileSelect('RG', file)}
                    />
                    <FileUpload 
                        label="CPF"
                        id="cpf"
                        accept=".pdf"
                        selectedFile={files.CPF}
                        onFileSelect={(file) => handleFileSelect('CPF', file)}
                    />
                    <FileUpload 
                        label="Comprovante de Residência"
                        id="comprovanteResidencia"
                        accept=".pdf"
                        selectedFile={files.ComprovanteResidencia}
                        onFileSelect={(file) => handleFileSelect('ComprovanteResidencia', file)}
                    />
                    
                    {error && <p className="message error-message">{error}</p>}
                    {success && <p className="message success-message">{success}</p>}

                    <div className="form-actions">
                         <Button style={{backgroundColor:"#cc4040ff"}} type="button" className="btn-cancel" onClick={() => navigate(-1)}>Voltar</Button>
                         <Button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar Documentos e Avançar'}
                         </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Documentos;