import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./GestaoVaga.css";
import Button from "../../components/Button";

const GestaoVaga = () => {
  const { vagaId } = useParams();
  const [vaga, setVaga] = useState(null);
  const [candidatos, setCandidatos] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Começa como true
  const [error, setError] = useState("");

  useEffect(() => {
    // Flag para evitar atualização de estado se o componente for desmontado
    let isMounted = true;

    const fetchVagaECandidatos = async () => {
      // Se não houver vagaId, para a execução e exibe a página
      if (!vagaId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true); // Ativa o loading antes de buscar
      try {
        const [vagaRes, candidatosRes] = await Promise.all([
          axios.get(`http://localhost:3001/api/vagas/${vagaId}`),
          axios.get(`http://localhost:3001/api/candidaturas/vagas/${vagaId}/candidatos`)
        ]);

        if (isMounted) {
          setVaga(vagaRes.data);
          // Garante que 'candidatos' seja sempre um array
          setCandidatos(Array.isArray(candidatosRes.data) ? candidatosRes.data : []);
        }

      } catch (err) {
        if (isMounted) {
          setError("Não foi possível carregar os dados da vaga e dos candidatos.");
        }
        console.error(err);
      } finally {
        if (isMounted) {
          setIsLoading(false); // Garante que o loading termine, com sucesso ou erro
        }
      }
    };

    fetchVagaECandidatos();

    // Função de limpeza que é executada quando o componente "desmonta"
    return () => {
      isMounted = false;
    };
  }, [vagaId]); // Dependência correta

  const handleDownloadCurriculo = (curriculoData, nomeCandidato) => {
    if (!curriculoData) {
      alert("Este candidato não possui currículo.");
      return;
    }
    
    const byteArray = new Uint8Array(curriculoData.data);
    const blob = new Blob([byteArray], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `curriculo-${nomeCandidato.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Renderiza o estado de "Carregando..."
  if (isLoading) {
    return <div className="gestao-vaga-container"><p>Carregando...</p></div>;
  }

  // Renderiza o estado de erro
  if (error) {
    return <div className="gestao-vaga-container"><p className="error-message">{error}</p></div>;
  }

  // Renderização principal
  return (
    <div className="gestao-vaga-container">
      <Link to="/rh/vagas" className="back-link">
        &larr; Voltar para a lista de vagas
      </Link>
      {vaga && (
        <div className="vaga-header">
          <h1>Gestão da Vaga: {vaga.titulo}</h1>
          <p><strong>Área:</strong> {vaga.area}</p>
        </div>
      )}

      <div className="candidatos-lista">
        <h2>Candidatos Inscritos</h2>
        {candidatos.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Endereço</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {candidatos.map((candidato) => (
                <tr key={candidato.id}>
                  <td>{candidato.nome_candidato}</td>
                  <td>{candidato.email_candidato}</td>
                  <td>{candidato.endereco}</td>
                  <td>
                    <span className={`status status-${candidato.status.toLowerCase().replace(" ", "-")}`}>
                      {candidato.status}
                    </span>
                  </td>
                  <td>
                    <Button
                      onClick={() => handleDownloadCurriculo(candidato.curriculo, candidato.nome_candidato)}
                      disabled={!candidato.curriculo}
                    >
                      Ver Currículo
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // Mensagem para quando não há candidatos
          <p>Nenhum candidato inscrito para esta vaga ainda.</p>
        )}
      </div>
    </div>
  );
};

export default GestaoVaga;