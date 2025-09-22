import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// 1. Mude a importação de 'axios' para a nossa instância 'api'
import api from "../../api"; 
import { useAuth } from "../../AuthContext";
import "./InscricaoVaga.css";
import Button from "../../components/Button"; 

const InscricaoVaga = () => {
  const { vagaId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vaga, setVaga] = useState(null);
  const [endereco, setEndereco] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
  const [curriculo, setCurriculo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVaga = async () => {
      try {
        // Usar a instância 'api' garante que o token de autenticação seja enviado
        const response = await api.get(`/vagas/${vagaId}`);
        setVaga(response.data);
      } catch (err) {
        setError("Não foi possível carregar os detalhes da vaga.");
        console.error(err);
      }
    };
    fetchVaga();
  }, [vagaId]);

  const handleCepChange = async (e) => {
    const cep = e.target.value.replace(/\D/g, "");
    setEndereco((prev) => ({ ...prev, cep }));

    if (cep.length === 8) {
      try {
        // Para chamadas a APIs externas como o ViaCEP, continuamos usando o axios diretamente
        const response = await api.get(`https://viacep.com.br/ws/${cep}/json/`);
        const { logradouro, bairro, localidade, uf } = response.data;
        setEndereco((prev) => ({
          ...prev,
          logradouro,
          bairro,
          cidade: localidade,
          estado: uf,
        }));
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEndereco((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setCurriculo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Você precisa estar logado para se candidatar.");
      return;
    }
    if (!curriculo) {
        alert("Por favor, anexe seu currículo.");
        return;
    }

    setIsLoading(true);

    const enderecoCompleto = `${endereco.logradouro}, ${endereco.numero}, ${endereco.complemento ? endereco.complemento + ' - ' : ''}${endereco.bairro}, ${endereco.cidade} - ${endereco.estado}, CEP: ${endereco.cep}`;
    
    const formData = new FormData();
    // 2. Não precisamos mais enviar o 'candidato_id', o backend pega isso do token.
    formData.append('endereco', enderecoCompleto);
    formData.append('curriculo', curriculo);

    try {
      // 3. A chamada agora usa 'api.post' e não precisa mais do objeto de headers.
      // O Axios vai configurar o 'Content-Type' como 'multipart/form-data' automaticamente.
      await api.post(`/candidaturas/vagas/${vagaId}`, formData);

      alert("Inscrição realizada com sucesso!");
      navigate("/minhas-candidaturas");
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert("Você já se candidatou para esta vaga.");
      } else {
        alert("Ocorreu um erro ao realizar a inscrição.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) return <div className="inscricao-container"><p>{error}</p></div>;
  if (!vaga) return <div className="inscricao-container"><p>Carregando vaga...</p></div>;

  return (
    <div className="inscricao-container">
      <h1>Inscrição para a Vaga</h1>
      <div className="vaga-info-card">
        <h2>{vaga.titulo}</h2>
        <p><strong>Área:</strong> {vaga.area}</p>
        <p><strong>Salário:</strong> R$ {parseFloat(vaga.salario).toFixed(2)}</p>
      </div>

      <form onSubmit={handleSubmit} className="inscricao-form">
        <h3>Complete seus dados</h3>
        <p>Olá, {user?.nome}! Para continuar, preencha as informações abaixo.</p>

        <fieldset>
          <legend>Endereço</legend>
          <input type="text" name="cep" placeholder="CEP" value={endereco.cep} onChange={handleCepChange} maxLength="9" required />
          <input type="text" name="logradouro" placeholder="Logradouro" value={endereco.logradouro} onChange={handleInputChange} required />
          <input type="text" name="numero" placeholder="Número" value={endereco.numero} onChange={handleInputChange} required />
          <input type="text" name="complemento" placeholder="Complemento (Opcional)" value={endereco.complemento} onChange={handleInputChange} />
          <input type="text" name="bairro" placeholder="Bairro" value={endereco.bairro} onChange={handleInputChange} required />
          <input type="text" name="cidade" placeholder="Cidade" value={endereco.cidade} onChange={handleInputChange} required />
          <input type="text" name="estado" placeholder="Estado" value={endereco.estado} onChange={handleInputChange} required />
        </fieldset>
        
        <fieldset>
            <legend>Currículo</legend>
            <label htmlFor="curriculo">Anexe seu currículo (PDF, DOC, DOCX):</label>
            <input id="curriculo" type="file" name="curriculo" onChange={handleFileChange} accept=".pdf,.doc,.docx" required />
        </fieldset>

        <div className="form-actions">
          <Button type="submit" disabled={isLoading}>{isLoading ? "Enviando..." : "Confirmar Inscrição"}</Button>
          <Button type="button" className="btn-cancel" onClick={() => navigate("/")}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
};

export default InscricaoVaga;