import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext'; // Verifique o caminho para seu AuthContext
import axios from 'axios';
import Navbar from '../../components/Navbar';
import './GestaoVaga.css'; // Criaremos este arquivo a seguir

const GestaoVaga = () => {
  const { user } = useAuth();
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.id && (user.tipo === 'RH' || user.tipo === 'ADMIN')) {
      const fetchVagasComCandidatos = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:3001/api/vagas/gestao/${user.id}`);
          setVagas(response.data);
          setError('');
        } catch (err) {
          console.error("Erro ao buscar dados de gestão:", err);
          setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
        } finally {
          setLoading(false);
        }
      };

      fetchVagasComCandidatos();
    } else {
        setLoading(false);
        // Redireciona ou mostra mensagem se não for RH
        setError('Acesso negado. Esta página é apenas para recrutadores.');
    }
  }, [user]);

  if (loading) {
    return <div className="loading-container">Carregando vagas...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="gestao-vaga-container">
        <h1>Minhas Vagas</h1>
        {vagas.length > 0 ? (
          vagas.map((vaga) => (
            <div key={vaga.id} className="vaga-card-gestao">
              <h2>{vaga.titulo}</h2>
              <p><strong>Área:</strong> {vaga.area}</p>

              <h3 className="titulo-tabela">Candidatos Inscritos</h3>
              {vaga.candidatos && vaga.candidatos.length > 0 ? (
                <div className="tabela-candidatos-wrapper">
                  <table className="tabela-candidatos">
                    <thead>
                      <tr>
                        <th>Nome</th>
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
                          <td>{candidato.nome}</td>
                          <td>{candidato.email}</td>
                          <td>{candidato.telefone}</td>
                          <td>
                            {candidato.curriculo ? (
                              <a href={`http://localhost:3001/${candidato.curriculo}`} target="_blank" rel="noopener noreferrer" className="link-curriculo">
                                Ver Arquivo
                              </a>
                            ) : (
                              'Não enviado'
                            )}
                          </td>
                          <td>
                            <span className={`status-candidato status-${candidato.status.toLowerCase().replace(' ', '-')}`}>
                              {candidato.status}
                            </span>
                          </td>
                          <td>
                            {/* Espaço para futuras ações */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="nenhum-candidato-inscrito">Nenhum candidato inscrito para esta vaga ainda.</p>
              )}
            </div>
          ))
        ) : (
          <p className="nenhuma-vaga-cadastrada">Você ainda não cadastrou nenhuma vaga.</p>
        )}
      </div>
    </>
  );
};

export default GestaoVaga;