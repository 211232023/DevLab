import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api'; // Verifique se o caminho para sua instância do axios está correto
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './Documentos.css';

function Documentos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { candidaturaId } = location.state || {}; // Pega o ID da candidatura

  const [rg, setRg] = useState(null);
  const [cpf, setCpf] = useState(null);
  const [comprovanteResidencia, setComprovanteResidencia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redireciona se não houver um ID de candidatura
  if (!candidaturaId) {
    navigate('/candidato/home'); 
    return null;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const filesToUpload = [
      { tipo: 'RG', file: rg, nome: 'RG' },
      { tipo: 'CPF', file: cpf, nome: 'CPF' },
      { tipo: 'ComprovanteResidencia', file: comprovanteResidencia, nome: 'Comprovante de Residência' },
    ];

    // Verifica se pelo menos um arquivo foi selecionado
    if (filesToUpload.every(item => !item.file)) {
        setError('Você precisa anexar pelo menos um documento.');
        setLoading(false);
        return;
    }

    try {
      const uploadPromises = filesToUpload
        .filter(item => item.file) // Envia apenas os arquivos que foram selecionados
        .map(item => {
          const formData = new FormData();
          formData.append('documento', item.file);
          formData.append('tipo', item.tipo);
          return api.post(`/candidaturas/${candidaturaId}/documentos`, formData);
        });

      // Executa todos os uploads em paralelo
      await Promise.all(uploadPromises);

      setSuccess('Documentos enviados com sucesso! Avançando...');
      
      // Navega para a próxima etapa após um breve atraso
      setTimeout(() => {
        navigate('/candidato/etapas', { state: { candidaturaId } });
      }, 2000);

    } catch (err) {
      console.error("Erro no upload: ", err);
      setError(err.response?.data?.message || 'Ocorreu um erro ao enviar os documentos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="documentos-container">
        <h2>Envio de Documentos</h2>
        <p>Anexe os documentos solicitados abaixo para continuar com sua candidatura.</p>
        
        <form onSubmit={handleSubmit} className="documentos-form">
          <div className="form-group">
            <label htmlFor="rg">RG (Registro Geral)</label>
            <input type="file" id="rg" accept=".pdf" onChange={(e) => setRg(e.target.files[0])} />
          </div>
          
          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <input type="file" id="cpf" accept=".pdf" onChange={(e) => setCpf(e.target.files[0])} />
          </div>

          <div className="form-group">
            <label htmlFor="comprovanteResidencia">Comprovante de Residência</label>
            <input type="file" id="comprovanteResidencia" accept=".pdf" onChange={(e) => setComprovanteResidencia(e.target.files[0])} />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Documentos e Avançar'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default Documentos;