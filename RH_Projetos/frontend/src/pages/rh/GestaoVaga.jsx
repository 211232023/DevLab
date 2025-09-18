import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Altere a importação para 'user' em vez de 'auth'
import { useAuth } from '../../AuthContext'; 
import { Link } from 'react-router-dom';
import './GestaoVaga.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const GestaoVaga = () => {
  // Corrija a desestruturação para obter o objeto 'user'
  const { user } = useAuth(); 
  const [vagasComCandidatos, setVagasComCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // A função só será executada se 'user' e 'user.id' existirem
    if (user && user.id) {
      const carregarVagasECandidatos = async () => {
        setLoading(true);
        setError('');
        try {
          // Utilize user.id na chamada da API
          const vagasResponse = await axios.get(`http://localhost:3001/api/vagas/usuario/${user.id}`);
          const vagasData = vagasResponse.data;

          if (vagasData.length === 0) {
            setVagasComCandidatos([]);
            setLoading(false);
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
          setError('Não foi possível carregar as informações das vagas. Tente novamente mais tarde.');
        } finally {
          setLoading(false);
        }
      };

      carregarVagasECandidatos();
    } else {
      // Se não houver dados de login, para o carregamento
      setLoading(false);
    }
  }, [user]); // O useEffect agora depende do objeto 'user'

  if (loading) {
    return <div>Carregando...</div>;
  }

  // Adicionamos uma verificação para o caso de o utilizador não estar logado
  // Utilize 'user' aqui também
  if (!user || !user.token) { 
    return (
      <div className="gestao-vaga-container" style={{ textAlign: 'center' }}>
        <h1>Acesso Negado</h1>
        <p>Você precisa estar logado para acessar esta página.</p>
        <Link to="/login" className="btn-cadastrar-vaga">Ir para o Login</Link>
      </div>
    );
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
              {/* O resto do seu componente permanece o mesmo */}
            </div>
          ))
        )}
      </div>
      <Footer />
    </>
  );
};

export default GestaoVaga;