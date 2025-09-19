import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../AuthContext";
import { useNavigate } from 'react-router-dom';
import "./CadastroVaga.css";
import Button from "../../components/Button";

export default function CadastroVaga() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // --- Estados para controle do fluxo ---
    const [step, setStep] = useState(1); // 1: Vaga, 2: Teste, 3: Questões
    const [vagaId, setVagaId] = useState(null);
    const [testeId, setTesteId] = useState(null);
    
    // --- Estados do formulário da Vaga (do seu código antigo) ---
    const estadoInicialFormVaga = {
        nome: "",
        area: "",
        beneficios: [],
        salario: "",
        escala: "",
        dataInicial: "",
        dataLimite: "",
        descricao: "",
    };
    const [formVaga, setFormVaga] = useState(estadoInicialFormVaga);
    const [novoBeneficio, setNovoBeneficio] = useState("");
    const [removendo, setRemovendo] = useState([]);
    const [mostrarBeneficios, setMostrarBeneficios] = useState(false);
    
    // --- Estados dos formulários de Teste e Questões ---
    const [testeData, setTesteData] = useState({ titulo: '', descricao: '' });
    const [questoesBanco, setQuestoesBanco] = useState([]);
    const [questoesDoTeste, setQuestoesDoTeste] = useState([]);

    // --- Estados de Feedback e Carregamento ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // --- Carregar o banco de questões na Etapa 3 ---
    useEffect(() => {
        if (step === 3) {
            const fetchQuestoes = async () => {
                setIsLoading(true);
                try {
                    const res = await axios.get('http://localhost:3001/api/questoes');
                    setQuestoesBanco(res.data);
                } catch (err) {
                    console.error('Erro ao buscar questões:', err);
                    setError('Não foi possível carregar o banco de questões.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchQuestoes();
        }
    }, [step]);
    
    // --- Lógica de Benefícios (do seu código antigo) ---
    const todosBeneficiosPreDefinidos = [
        "Vale-refeição", "Vale-transporte", "Plano de saúde", "Seguro de vida",
        "Home office", "Auxílio creche", "Bônus anual", "Participação nos lucros",
        "Estacionamento", "Assistência odontológica",
    ];
    const beneficiosPreDefinidos = todosBeneficiosPreDefinidos.filter(
        (b) => !formVaga.beneficios.includes(b)
    );
    const handleAddBeneficio = (b) => {
        if (b && !formVaga.beneficios.includes(b)) {
            setFormVaga({ ...formVaga, beneficios: [...formVaga.beneficios, b] });
            setNovoBeneficio("");
        }
    };
    const handleRemoveBeneficio = (b) => {
        setRemovendo((prev) => [...prev, b]);
        setTimeout(() => {
            setFormVaga({
                ...formVaga,
                beneficios: formVaga.beneficios.filter((item) => item !== b),
            });
            setRemovendo((prev) => prev.filter((item) => item !== b));
        }, 300);
    };
    
    // --- Handlers de Mudança nos Inputs ---
    const handleVagaChange = (e) => {
        const { name, value } = e.target;
        setFormVaga({ ...formVaga, [name]: value });
    };
    const handleTesteChange = (e) => {
        setTesteData({ ...testeData, [e.target.name]: e.target.value });
    };

    // --- Handlers de Submissão por Etapa ---
    const handleVagaSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        if (!user || !user.id) {
            alert("Erro de autenticação. Por favor, faça o login novamente.");
            setIsLoading(false);
            return;
        }
        
        const vagaDataParaAPI = {
            rh_id: user.id,
            titulo: formVaga.nome,
            area: formVaga.area,
            salario: parseFloat(formVaga.salario),
            descricao: formVaga.descricao,
            data_Abertura: formVaga.dataInicial,
            data_fechamento: formVaga.dataLimite,
            escala_trabalho: formVaga.escala,
            beneficios: formVaga.beneficios.join(', '),
        };

        try {
            const response = await axios.post("http://localhost:3001/api/vagas", vagaDataParaAPI);
            setVagaId(response.data.vagaId);
            setStep(2); // Sucesso! Avança para a próxima etapa.
        } catch (error) {
            console.error("Erro ao cadastrar vaga:", error.response ? error.response.data : error.message);
            setError("Falha ao cadastrar a vaga. Verifique os campos e tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTesteSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:3001/api/testes', {
                ...testeData,
                vaga_id: vagaId
            });
            setTesteId(response.data.testeId);
            setStep(3); // Avança para a etapa de adicionar questões
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao criar teste.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- Handlers de Gerenciamento de Questões ---
    const handleAddQuestao = async (questao) => {
        try {
            await axios.post(`http://localhost:3001/api/testes/${testeId}/questoes`, { questao_id: questao.id });
            setQuestoesDoTeste(prev => [...prev, questao]);
        } catch (err) {
             alert(err.response?.data?.message || 'Erro ao adicionar questão.');
        }
    };
    const handleRemoveQuestao = async (questaoId) => {
        try {
            await axios.delete(`http://localhost:3001/api/testes/${testeId}/questoes/${questaoId}`);
            setQuestoesDoTeste(prev => prev.filter(q => q.id !== questaoId));
        } catch (err) {
            alert(err.response?.data?.message || 'Erro ao remover questão.');
        }
    };
    
    const handleFinalizar = () => {
        alert('Vaga e teste cadastrados com sucesso!');
        navigate('/gestao-vagas');
    };

    const handleCancel = () => {
        if (step > 1) {
            setStep(step - 1); // Volta para a etapa anterior
        } else {
            navigate(-1); // Se estiver na primeira etapa, volta para a página anterior
        }
    };


    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    const renderVagaForm = () => (
        <form onSubmit={handleVagaSubmit} className="form-vaga">
            <label htmlFor="nome">Nome da vaga</label>
            <input id="nome" type="text" name="nome" placeholder="Ex: Desenvolvedor Frontend" value={formVaga.nome} onChange={handleVagaChange} required />
            
            <label htmlFor="area">Área</label>
            <select id="area" name="area" value={formVaga.area} onChange={handleVagaChange} required>
                <option value="">Selecione a área</option>
                <option value="Saúde">Saúde</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Engenharia">Engenharia</option>
                <option value="Ciências Humanas e Sociais">Ciências Humanas e Sociais</option>
                <option value="Gestão e Negócios">Gestão e Negócios</option>
                <option value="Artes e Design">Artes e Design</option>
            </select>

            <div className="form-group">
                <button type="button" className="beneficios-toggle-btn" onClick={() => setMostrarBeneficios(!mostrarBeneficios)}>
                    {mostrarBeneficios ? "Ocultar Benefícios" : "Adicionar Benefícios"}
                </button>
            </div>

            {mostrarBeneficios && (
                <div className="beneficios-container">
                    <div className="beneficios-box">
                        {formVaga.beneficios.map((b) => (
                            <div key={b} className={`beneficio-tag fade-in ${removendo.includes(b) ? "fade-out" : ""}`} style={{ animationDuration: "0.3s" }}>
                                {b}
                                <span className="remove-tag" onClick={() => handleRemoveBeneficio(b)}>✕</span>
                            </div>
                        ))}
                        <input type="text" placeholder="Digite um benefício..." value={novoBeneficio} onChange={(e) => setNovoBeneficio(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddBeneficio(novoBeneficio.trim()); } }} />
                    </div>
                    <div className="beneficios-predefinidos">
                        {beneficiosPreDefinidos.map((b) => (
                            <button type="button" key={b} className="btn-beneficio-pre fade-in" onClick={() => handleAddBeneficio(b)}>{b}</button>
                        ))}
                    </div>
                </div>
            )}

            <label htmlFor="salario">Salário</label>
            <input id="salario" type="number" name="salario" placeholder="Ex: 3500.00" step="0.01" value={formVaga.salario} onChange={handleVagaChange} required />
            
            <label htmlFor="escala">Escala de trabalho</label>
            <input id="escala" type="text" name="escala" placeholder="Ex: 6x1, 5x2, 12x36..." value={formVaga.escala} onChange={handleVagaChange} required />
            
            <div className="form-row">
                <div>
                    <label htmlFor="dataInicial">Data de Abertura</label>
                    <input id="dataInicial" type="date" name="dataInicial" value={formVaga.dataInicial} onChange={handleVagaChange} required />
                </div>
                <div>
                    <label htmlFor="dataLimite">Data de Fechamento</label>
                    <input id="dataLimite" type="date" name="dataLimite" value={formVaga.dataLimite} onChange={handleVagaChange} required />
                </div>
            </div>
            
            <label htmlFor="descricao">Descrição da vaga</label>
            <textarea id="descricao" name="descricao" placeholder="Descreva as responsabilidades, requisitos e diferenciais..." value={formVaga.descricao} onChange={handleVagaChange} rows="5" required />

            <div className="form-actions">
                <Button type="submit" className="btn-cadastroVaga" disabled={isLoading}>
                    {isLoading ? "Salvando..." : "Salvar e ir para Teste"}
                </Button>
                <Button style={{backgroundColor:"#cc4040ff"}} type="button" onClick={handleCancel} className="btn-cancel">
                    Cancelar
                </Button>
            </div>
        </form>
    );

    const renderTesteForm = () => (
         <div className="form-vaga">
            <h2>Etapa 2: Detalhes do Teste para "{formVaga.nome}"</h2>
            <form onSubmit={handleTesteSubmit}>
                <label htmlFor="titulo-teste">Título do Teste</label>
                <input id="titulo-teste" type="text" name="titulo" placeholder="Ex: Teste de Lógica e JavaScript" value={testeData.titulo} onChange={handleTesteChange} required />
                
                <label htmlFor="descricao-teste">Descrição/Instruções do Teste</label>
                <textarea id="descricao-teste" name="descricao" placeholder="Instruções para o candidato" value={testeData.descricao} onChange={handleTesteChange} rows="5" />
                
                <div className="form-actions">
                    <Button type="submit" className="btn-cadastroVaga" disabled={isLoading}>
                        {isLoading ? "Salvando..." : "Salvar e Adicionar Questões"}
                    </Button>
                     <Button style={{backgroundColor:"#cc4040ff"}} type="button" onClick={handleCancel} className="btn-cancel">
                        Voltar
                    </Button>
                </div>
            </form>
        </div>
    );
    
    const renderQuestaoManager = () => (
        <div className="questao-manager">
            <h2>Etapa 3: Montagem do Teste "{testeData.titulo}"</h2>
            <div className="colunas-questoes">
                <div className="coluna">
                    <h3>Banco de Questões</h3>
                    {isLoading ? <p>Carregando questões...</p> : (
                        <ul className="lista-questoes">
                            {questoesBanco.filter(q => !questoesDoTeste.some(qt => qt.id === q.id)).map(q => (
                                <li key={q.id}>
                                    <span>{q.enunciado} <strong>({q.area_conhecimento})</strong></span>
                                    <button onClick={() => handleAddQuestao(q)} title="Adicionar ao teste">+</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="coluna">
                    <h3>Questões no Teste ({questoesDoTeste.length})</h3>
                     <ul className="lista-questoes">
                         {questoesDoTeste.map(q => (
                            <li key={q.id}>
                                <span>{q.enunciado}</span>
                                <button className="remover" onClick={() => handleRemoveQuestao(q.id)} title="Remover do teste">−</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
             <div className="form-actions">
                <Button onClick={handleFinalizar} className="btn-cadastroVaga">
                    Finalizar Cadastro
                </Button>
                <Button style={{backgroundColor:"#cc4040ff"}} type="button" onClick={handleCancel} className="btn-cancel">
                    Voltar
                </Button>
            </div>
        </div>
    );

    return (
        <div className="cadastro-vaga-container">
            {step === 1 && <h2>Cadastro da Vaga</h2>}
            {error && <div className="mensagem-erro">{error}</div>}
            
            {step === 1 && renderVagaForm()}
            {step === 2 && renderTesteForm()}
            {step === 3 && renderQuestaoManager()}
        </div>
    );
}