import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import { Link } from 'react-router-dom';
import './GestaoVaga.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const GestaoVaga = () => {
  const { auth } = useAuth();
  const [vagasComCandidatos, setVagasComCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const carregarVagasECandidatos = async () => {
      if (!auth.userId) {
        setLoading(false);
        setError('ID do usuário não encontrado. Faça login novamente.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        // 1. Buscar as vagas do usuário logado
        const vagasResponse = await axios.get(`http://localhost:3001/api/vagas/usuario/${auth.userId}`);
        const vagasData = vagasResponse.data;

        if (vagasData.length === 0) {
          setVagasComCandidatos([]);
          setLoading(false);
          return;
        }

        // 2. Para cada vaga, buscar a lista de candidatos
        const vagasCompletas = await Promise.all(
          vagasData.map(async (vaga) => {
            try {
              const candidatosResponse = await axios.get(`http://localhost:3001/api/candidaturas/vagas/${vaga.id}/candidatos`);
              return { ...vaga, candidatos: candidatosResponse.data };
            } catch (err) {
              console.error(`Erro ao buscar candidatos para a vaga ${vaga.id}:`, err);
              return { ...vaga, candidatos: [] }; // Retorna a vaga mesmo que a busca de candidatos falhe
            }
          })
        );

        setVagasComCandidatos(vagasCompletas);
      } catch (err) {
        console.error('Erro ao carregar vagas:', err);
        setError('Não foi possível carregar as informações das vagas. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    carregarVagasECandidatos();
  }, [auth.userId]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="gestao-vaga-container">
        <h1>Gestão de Vagas</h1>
        <p>Acompanhe e gerencie as vagas que você cadastrou.</p>
        
        {vagasComCandidatos.length === 0 ? (
          <div className="nenhuma-vaga">
            <p>Você ainda não cadastrou nenhuma vaga.</p>
            <Link to="/cadastro-vaga" className="btn-cadastrar-vaga">Cadastrar Nova Vaga</Link>
          </div>
        ) : (
          vagasComCandidatos.map((vaga) => (
            <div key={vaga.id} className="vaga-card">
              <div className="vaga-header">
                <h2>{vaga.titulo}</h2>
                <p className="vaga-localizacao">{vaga.localizacao} - {vaga.tipo_contrato}</p>
              </div>
              <div className="vaga-body">
                <h3>Candidatos Inscritos ({vaga.candidatos.length})</h3>
                {vaga.candidatos.length > 0 ? (
                  <table className="candidatos-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vaga.candidatos.map((candidato) => (
                        <tr key={candidato.id}>
                          <td>{candidato.nome_candidato}</td>
                          <td>{candidato.email_candidato}</td>
                          <td>
                            <span className={`status-pill status-${candidato.status.toLowerCase().replace(' ', '-')}`}>
                              {candidato.status}
                            </span>
                          </td>
                          <td>
                            <Link to={`/detalhe-vaga/${vaga.id}`} className="btn-ver-detalhes">
                              Ver Detalhes
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Ainda não há candidatos inscritos para esta vaga.</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <Footer />
    </>
  );
};

export default GestaoVaga;