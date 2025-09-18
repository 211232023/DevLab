import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // CORREÇÃO 1: Importe useNavigate
import { useAuth } from '../../AuthContext';
import './MinhasCandidaturas.css';
import Button from '../../components/Button';

const MinhasCandidaturas = () => {
  const [candidaturas, setCandidaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate(); // CORREÇÃO 2: Instancie o hook

  useEffect(() => {
    if (user && user.id) {
      const fetchCandidaturas = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:3001/api/candidaturas/usuario/${user.id}`);
          setCandidaturas(response.data);
          setError('');
        } catch (err) {
          if (err.response && err.response.status === 404) {
            setCandidaturas([]);
          } else {
            setError('Erro ao buscar suas candidaturas.');
            console.error(err);
          }
        } finally {
          setLoading(false);
        }
      };

      fetchCandidaturas();
    } else {
      setLoading(false);
      setError('Você precisa estar logado para ver suas candidaturas.');
    }
  }, [user]);

  const handleDesistir = async (candidaturaId) => {
    if (window.confirm('Tem certeza de que deseja desistir desta vaga?')) {
      try {
        await axios.delete(`http://localhost:3001/api/candidaturas/${candidaturaId}`);
        setCandidaturas(candidaturas.filter(c => c.id !== candidaturaId));
      } catch (err) {
        alert('Erro ao tentar desistir da vaga.');
        console.error(err);
      }
    }
  };

  // CORREÇÃO 3: Crie a função para navegar
  const handleVerProgresso = (candidaturaId) => {
    navigate(`/etapas/${candidaturaId}`);
  };

  if (loading) {
    return <div className="loading-container">Carregando...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <>
      <div className="minhas-candidaturas-container">
        <h1>Minhas Candidaturas</h1>
        {candidaturas.length > 0 ? (
          <div className="lista-candidaturas">
            {candidaturas.map((candidatura) => (
              <div key={candidatura.id} className="candidatura-card">
                <h2>{candidatura.nome_vaga}</h2>
                <p><strong>Área:</strong> {candidatura.area}</p>
                <p><strong>Status:</strong> <span className={`status status-${candidatura.status.toLowerCase().replace(' ', '-')}`}>{candidatura.status}</span></p>
                <div className="candidatura-actions">
                  <Button style={{backgroundColor:"#cc4040ff"}} onClick={() => handleDesistir(candidatura.id)} className="btn-desistir">
                    Desistir
                  </Button>
                  {/* CORREÇÃO 4: Troque o Link por um button */}
                  <Button onClick={() => handleVerProgresso(candidatura.id)} className="btn-progresso">
                    Ver Progresso
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="nenhuma-candidatura">Você ainda não se candidatou a nenhuma vaga.</p>
        )}
      </div>
    </>
  );
};

export default MinhasCandidaturas;