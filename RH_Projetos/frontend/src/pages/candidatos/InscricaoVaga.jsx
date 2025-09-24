import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api"; 
import { useAuth } from "../../AuthContext";
import "./InscricaoVaga.css";
import Button from "../../components/Button"; 
import { FaMapMarkerAlt, FaFileUpload } from 'react-icons/fa';

const InscricaoVaga = () => {
    const { vagaId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [vaga, setVaga] = useState(null);
    const [endereco, setEndereco] = useState({
        cep: "", logradouro: "", numero: "", complemento: "",
        bairro: "", cidade: "", estado: "",
    });
    const [curriculo, setCurriculo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchVaga = async () => {
            try {
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
                const response = await api.get(`https://viacep.com.br/ws/${cep}/json/`);
                const { logradouro, bairro, localidade, uf } = response.data;
                setEndereco((prev) => ({
                    ...prev, logradouro, bairro, cidade: localidade, estado: uf,
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
            setError("Você precisa estar logado para se candidatar.");
            return;
        }
        if (!curriculo) {
            setError("Por favor, anexe seu currículo.");
            return;
        }

        setIsLoading(true);
        setError("");

        const enderecoCompleto = `${endereco.logradouro}, ${endereco.numero}, ${endereco.complemento ? endereco.complemento + ' - ' : ''}${endereco.bairro}, ${endereco.cidade} - ${endereco.estado}, CEP: ${endereco.cep}`;
        
        const formData = new FormData();
        formData.append('endereco', enderecoCompleto);
        formData.append('curriculo', curriculo);

        try {
            await api.post(`/candidaturas/vagas/${vagaId}`, formData);
            alert("Inscrição realizada com sucesso!");
            navigate("/minhas-candidaturas");
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setError("Você já se candidatou para esta vaga.");
            } else {
                setError("Ocorreu um erro ao realizar a inscrição.");
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!vaga) return <div className="loading-container">Carregando vaga...</div>;

    return (
        <div className="inscricao-page-wrapper">
            <div className="inscricao-container">
                <div className="vaga-info-card">
                    <h2>{vaga.titulo}</h2>
                    <div className="info-tags">
                        <span><strong>Área:</strong> {vaga.area}</span>
                        <span><strong>Salário:</strong> R$ {parseFloat(vaga.salario).toFixed(2)}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="inscricao-form">
                    <h3>Quase lá, {user?.nome}!</h3>
                    <p>Preencha os dados abaixo para concluir sua candidatura.</p>
                    
                    {error && <div className="form-error">{error}</div>}

                    <fieldset>
                        <legend><FaMapMarkerAlt /> Endereço</legend>
                        <div className="form-row">
                            <div className="form-group"><label htmlFor="cep">CEP</label><input id="cep" type="text" name="cep" placeholder="00000-000" value={endereco.cep} onChange={handleCepChange} maxLength="9" required /></div>
                            <div className="form-group"><label htmlFor="logradouro">Logradouro</label><input id="logradouro" type="text" name="logradouro" placeholder="Sua rua ou avenida" value={endereco.logradouro} onChange={handleInputChange} required /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group fg-small"><label htmlFor="numero">Número</label><input id="numero" type="text" name="numero" placeholder="Nº" value={endereco.numero} onChange={handleInputChange} required /></div>
                            <div className="form-group fg-large"><label htmlFor="complemento">Complemento</label><input id="complemento" type="text" name="complemento" placeholder="Apto, bloco, etc. (Opcional)" value={endereco.complemento} onChange={handleInputChange} /></div>
                        </div>
                         <div className="form-row">
                            <div className="form-group"><label htmlFor="bairro">Bairro</label><input id="bairro" type="text" name="bairro" placeholder="Seu bairro" value={endereco.bairro} onChange={handleInputChange} required /></div>
                            <div className="form-group"><label htmlFor="cidade">Cidade</label><input id="cidade" type="text" name="cidade" placeholder="Sua cidade" value={endereco.cidade} onChange={handleInputChange} required /></div>
                            <div className="form-group fg-xsmall"><label htmlFor="estado">Estado</label><input id="estado" type="text" name="estado" placeholder="UF" value={endereco.estado} onChange={handleInputChange} required /></div>
                        </div>
                    </fieldset>
                    
                    <fieldset>
                        <legend><FaFileUpload /> Currículo</legend>
                        <label htmlFor="curriculo" className="custom-file-upload">
                            <FaFileUpload /> {curriculo ? curriculo.name : "Anexar currículo (PDF, DOC, DOCX)"}
                        </label>
                        <input id="curriculo" type="file" name="curriculo" onChange={handleFileChange} accept=".pdf,.doc,.docx" required />
                    </fieldset>

                    <div className="form-actions">
                        <Button style={{backgroundColor:"#cc4040ff"}} type="button" className="btn-cancel" onClick={() => navigate("/inicio")}>Cancelar</Button>
                        <Button type="submit" className="btn-confirm" disabled={isLoading}>{isLoading ? "Enviando..." : "Confirmar Inscrição"}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InscricaoVaga;
