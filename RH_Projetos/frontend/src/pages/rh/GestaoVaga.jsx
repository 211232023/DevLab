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

  // Ordem das etapas do processo seletivo
  const statusOrdem = [
    'Aguardando Teste',
    'Teste Disponível',
    'Manual',
    'Envio de Documentos',
    'Entrevista',
    'Finalizado'
  ];

  // Função para pegar a próxima etapa
  const getNextStatus = (statusAtual) => {
    const currentIndex = statusOrdem.indexOf(statusAtual);
    if (currentIndex >= 0 && currentIndex < statusOrdem.length - 1) {
      return statusOrdem[currentIndex + 1];
    }
    return statusAtual; // Retorna o mesmo se for a última etapa
  };

  // Função para avançar a etapa do candidato
  const handleAvancarEtapa = async (candidaturaId, statusAtual, vagaId) => {
    const novoStatus = getNextStatus(statusAtual);
    if (novoStatus === statusAtual) {
      alert('O candidato já está na etapa final do processo.');
      return;
    }

    try {
      await axios.put(`http://localhost:3001/api/candidaturas/${candidaturaId}/status`, { status: novoStatus });
      
      // Atualiza o estado local para refletir a mudança imediatamente
      setVagasComCandidatos(vagasAtuais => vagasAtuais.map(vaga => {
        if (vaga.id === vagaId) {
          return {
            ...vaga,
            candidatos: vaga.candidatos.map(c => 
              c.id === candidaturaId ? { ...c, status: novoStatus } : c
            )
          };
        }
        return vaga;
      }));

    } catch (err) {
      console.error('Erro ao avançar etapa:', err);
      alert('Não foi possível avançar a etapa do candidato.');
    }
  };

  // Função para eliminar a candidatura
  const handleEliminarCandidatura = async (candidaturaId, vagaId) => {
    if (window.confirm('Tem certeza que deseja eliminar esta candidatura do processo seletivo?')) {
      try {
        await axios.delete(`http://localhost:3001/api/candidaturas/${candidaturaId}`);

        // Atualiza o estado local para remover o candidato da lista
        setVagasComCandidatos(vagasAtuais => vagasAtuais.map(vaga => {
          if (vaga.id === vagaId) {
            return {
              ...vaga,
              candidatos: vaga.candidatos.filter(c => c.id !== candidaturaId)
            };
          }
          return vaga;
        }));

      } catch (err) {
        console.error('Erro ao eliminar candidatura:', err);
        alert('Não foi possível eliminar a candidatura.');
      }
    }
  };

  // O restante do seu componente (useEffect, etc.) permanece o mesmo...
  useEffect(() => {
    const carregarTodasAsVagas = async () => {
      if (user && (user.tipo === 'ADMIN' || user.tipo === 'RH')) {
        setLoading(true);
        setError('');
        try {
          const vagasResponse = await axios.get('http://localhost:3001/api/vagas');
          const vagasData = vagasResponse.data;

          if (vagasData.length === 0) {
            setVagasComCandidatos([]);
            return;
          }
          const vagasCompletas = await Promise.all(
            vagasData.map(async (vaga) => {
              try {
                const candidatosResponse = await axios.get(`http://localhost:3001/api/candidaturas/vagas/${vaga.id}/candidatos`);
                return { ...vaga, candidatos: candidatosResponse.data };
              } catch (err) {
                console.error(`Erro ao buscar candidatos para a vaga ${vaga.id}:`, err);
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
        setLoading(false);
      }
    };
    carregarTodasAsVagas();
  }, [user]);

  if (loading) return <div className="loading-container">Carregando...</div>;
  if (!user || (user.tipo !== 'ADMIN' && user.tipo !== 'RH')) return (
    <div className="gestao-vaga-container" style={{ textAlign: 'center' }}>
      <h1>Acesso Negado</h1>
      <p>Você não tem permissão para visualizar esta página.</p>
      <Link to="/login" className="btn-cadastrar-vaga">Ir para o Login</Link>
    </div>
  );
  if (error) return <div className="error-container">{error}</div>;

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
                      <th>Ações</th> {/* Coluna adicionada */}
                    </tr>
                  </thead>
                  <tbody>
                    {vaga.candidatos.map((candidato) => (
                      <tr key={candidato.id}>
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
                        {/* --- CÉLULA COM OS NOVOS BOTÕES --- */}
                        <td className="coluna-acoes">
                          <button
                            className="btn-acao avancar"
                            onClick={() => handleAvancarEtapa(candidato.id, candidato.status, vaga.id)}
                            disabled={candidato.status === 'Finalizado'}
                          >
                            Avançar
                          </button>
                          <button
                            className="btn-acao eliminar"
                            onClick={() => handleEliminarCandidatura(candidato.id, vaga.id)}
                          >
                            Eliminar
                          </button>
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