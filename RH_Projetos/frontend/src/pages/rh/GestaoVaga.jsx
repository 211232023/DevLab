import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import { Link } from 'react-router-dom';
import './GestaoVaga.css';

const GestaoVaga = () => {
  const { user } = useAuth();
  const [vagasComCandidatos, setVagasComCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const carregarTodasAsVagas = async () => {
      // Apenas executa se o usuário for ADMIN ou RH
      if (user && (user.tipo === 'ADMIN' || user.tipo === 'RH')) {
        setLoading(true);
        setError('');
        try {
          // 1. Busca todas as vagas, sem filtrar por usuário
          const vagasResponse = await axios.get('http://localhost:3001/api/vagas');
          const vagasData = vagasResponse.data;

          if (vagasData.length === 0) {
            setVagasComCandidatos([]);
            return;
          }

          // 2. Para cada vaga, busca os candidatos associados
          const vagasCompletas = await Promise.all(
            vagasData.map(async (vaga) => {
              try {
                const candidatosResponse = await axios.get(`http://localhost:3001/api/candidaturas/vagas/${vaga.id}/candidatos`);
                return { ...vaga, candidatos: candidatosResponse.data };
              } catch (err) {
                console.error(`Erro ao buscar candidatos para a vaga ${vaga.id}:`, err);
                // Retorna a vaga mesmo se a busca por candidatos falhar
                return { ...vaga, candidatos: [] };
              }
            })
          );

          setVagasComCandidatos(vagasCompletas);
        } catch (err) {
          console.error('Erro ao carregar vagas:', err);
          setError('Não foi possível carregar as informações. Tente novamente mais tarde.');
        } finally {
          setLoading(false);
        }
      } else {
        // Se não for ADMIN ou RH, ou não estiver logado, para o carregamento
        setLoading(false);
      }
    };

    carregarTodasAsVagas();
  }, [user]); // A dependência continua sendo o 'user' para reavaliar quando ele mudar

  // Renderização condicional
  if (loading) {
    return <div className="loading-container">Carregando...</div>;
  }

  // Se o usuário não estiver logado ou não tiver a permissão necessária
  if (!user || (user.tipo !== 'ADMIN' && user.tipo !== 'RH')) {
    return (
      <div className="gestao-vaga-container" style={{ textAlign: 'center' }}>
        <h1>Acesso Negado</h1>
        <p>Você não tem permissão para visualizar esta página.</p>
        <Link to="/login" className="btn-cadastrar-vaga">Ir para o Login</Link>
      </div>
    );
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="gestao-vaga-container">
      <h1>Gestão de Vagas</h1>
      {vagasComCandidatos.length === 0 ? (
        <div className="nenhuma-vaga">
          <p>Nenhuma vaga cadastrada no sistema.</p>
          <Link to="/cadastro-vaga" className="btn-cadastrar-vaga">Cadastrar Nova Vaga</Link>
        </div>
      ) : (
        vagasComCandidatos.map((vaga) => (
          <div key={vaga.id} className="vaga-card">
            <h2>{vaga.titulo}</h2>
            <div className="candidatos-table-container">
              <h3>Candidatos Inscritos ({vaga.candidatos.length})</h3>
              {vaga.candidatos.length > 0 ? (
                <table className="candidatos-table">
                  <thead>
                    <tr>
                      <th>Nome do Candidato</th>
                      <th>Email</th>
                      <th>Telefone</th>
                      <th>Currículo</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaga.candidatos.map((candidato) => (
                      <tr key={candidato.candidatura_id}>
                        <td>{candidato.nome_candidato}</td>
                        <td>{candidato.email_candidato}</td>
                        <td>{candidato.telefone || 'Não informado'}</td>
                        <td>
                          {candidato.curriculo ? (
                            <a
                              href={`http://localhost:3001/${candidato.curriculo}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link-curriculo"
                            >
                              Ver Currículo
                            </a>
                          ) : (
                            'Não enviado'
                          )}
                        </td>
                        <td>{candidato.status}</td>
                        <td>
                          {/* Adicione ações futuras aqui, como aprovar/reprovar */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Nenhum candidato inscrito para esta vaga ainda.</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default GestaoVaga;