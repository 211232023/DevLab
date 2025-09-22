import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../AuthContext";
import { useNavigate } from 'react-router-dom';
import "./CadastroVaga.css";
import Button from "../../components/Button";

// --- Componente do Modal para Nova Questão (Mantido como está) ---
const NovaQuestaoModal = ({ onClose, onQuestaoCriada }) => {
    const [enunciado, setEnunciado] = useState('');
    const [area, setArea] = useState('');
    const [alternativas, setAlternativas] = useState([
        { texto: '', correta: true },
        { texto: '', correta: false },
        { texto: '', correta: false },
        { texto: '', correta: false },
    ]);
    const [error, setError] = useState('');

    const handleAlternativaChange = (index, field, value) => {
        const novasAlternativas = alternativas.map((alt, i) => {
            if (i === index) {
                return field === 'correta' ? { ...alt, correta: true } : { ...alt, [field]: value };
            }
            return field === 'correta' ? { ...alt, correta: false } : alt;
        });
        setAlternativas(novasAlternativas);
    };

    const handleAddQuestao = () => {
        setError('');
        if (!enunciado || !area) {
            setError('Preencha o enunciado e a área da questão.');
            return;
        }
        const alternativasPreenchidas = alternativas.filter(a => a.texto.trim() !== '');
        if (alternativasPreenchidas.length < 2) {
            setError('A questão deve ter pelo menos duas alternativas.');
            return;
        }
        if (!alternativasPreenchidas.some(a => a.correta)) {
            setError('Marque uma alternativa como correta.');
            return;
        }
        onQuestaoCriada({ enunciado, area_conhecimento: area, alternativas: alternativasPreenchidas });
        onClose();
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Criar Nova Questão</h2>
                {error && <p className="mensagem-erro">{error}</p>}
                <div className="form-group-modal">
                    <label>Enunciado da Questão</label>
                    <textarea value={enunciado} onChange={(e) => setEnunciado(e.target.value)} required />
                </div>
                <div className="form-group-modal">
                    <label>Área de Conhecimento</label>
                    <input type="text" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Ex: JavaScript, Lógica, Vendas" required />
                </div>
                <div className="form-group-modal">
                    <label>Alternativas (Marque a correta)</label>
                    {alternativas.map((alt, index) => (
                        <div key={index} className="alternativa-input">
                            <input type="radio" name="correta" checked={alt.correta} onChange={() => handleAlternativaChange(index, 'correta', true)} />
                            <input type="text" placeholder={`Alternativa ${index + 1}`} value={alt.texto} onChange={(e) => handleAlternativaChange(index, 'texto', e.target.value)} />
                        </div>
                    ))}
                </div>
                <div className="modal-actions">
                    <Button type="button" onClick={onClose} className="btn-cancel">Cancelar</Button>
                    <Button type="button" onClick={handleAddQuestao}>Adicionar Questão</Button>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal (Com as atualizações de diagnóstico e validação) ---
export default function CadastroVaga() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    // Estados para guardar TODOS os dados antes de enviar
    const [formVaga, setFormVaga] = useState({
        nome: "", area: "", beneficios: [], salario: "",
        escala: "", dataInicial: "", dataLimite: "", descricao: "",
    });
    const [testeData, setTesteData] = useState({ titulo: '', descricao: '' });
    const [questoesDoTeste, setQuestoesDoTeste] = useState([]);

    // Estados de UI
    const [novoBeneficio, setNovoBeneficio] = useState("");
    const [removendo, setRemovendo] = useState([]);
    const [mostrarBeneficios, setMostrarBeneficios] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Lógica de Benefícios (Mantida como está)
    const todosBeneficiosPreDefinidos = ["Vale-refeição", "Vale-transporte", "Plano de saúde", "Seguro de vida", "Home office", "Auxílio creche", "Bônus anual", "Participação nos lucros", "Estacionamento", "Assistência odontológica"];
    const beneficiosPreDefinidos = todosBeneficiosPreDefinidos.filter(b => !formVaga.beneficios.includes(b));

    const handleAddBeneficio = (b) => {
        if (b && !formVaga.beneficios.includes(b)) {
            setFormVaga({ ...formVaga, beneficios: [...formVaga.beneficios, b] });
            setNovoBeneficio("");
        }
    };

    const handleRemoveBeneficio = (b) => {
        setRemovendo(prev => [...prev, b]);
        setTimeout(() => {
            setFormVaga(prev => ({ ...prev, beneficios: prev.beneficios.filter(item => item !== b) }));
            setRemovendo(prev => prev.filter(item => item !== b));
        }, 300);
    };

    const handleVagaChange = (e) => setFormVaga({ ...formVaga, [e.target.name]: e.target.value });
    const handleTesteChange = (e) => setTesteData({ ...testeData, [e.target.name]: e.target.value });

    // Funções de Questões (Mantidas como está)
    const handleQuestaoCriada = (novaQuestao) => {
        setQuestoesDoTeste(prev => [...prev, novaQuestao]);
    };
    const handleRemoveQuestao = (index) => {
        setQuestoesDoTeste(prev => prev.filter((_, i) => i !== index));
    };

        // --- FUNÇÃO DE SUBMISSÃO FINAL ---
    const handleFinalSubmit = async () => {
        if (questoesDoTeste.length === 0) {
            setError('É necessário adicionar pelo menos uma questão ao teste.');
            return;
        }
        
        setIsLoading(true);
        setError('');

        console.log("Verificando usuário do contexto:", user);
        if (!user || !user.id) {
            setError("Erro: Usuário não identificado. Por favor, faça login novamente.");
            setIsLoading(false);
            return; 
        }

        const vagaPayload = {
            rh_id: user.id,
            titulo: formVaga.nome,
            area: formVaga.area,
            salario: parseFloat(formVaga.salario) || 0,
            descricao: formVaga.descricao,
            data_Abertura: formVaga.dataInicial,
            data_fechamento: formVaga.dataLimite,
            escala_trabalho: formVaga.escala,
            beneficios: formVaga.beneficios.join(', '),
        };
        
        const finalPayload = {
            vagaData: vagaPayload,
            testeData: testeData,
            questoes: questoesDoTeste
        };

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Acesso negado. Seu token de login não foi encontrado.');
            setIsLoading(false);
            navigate('/inicio'); // Corrected navigation link
            return;
        }

        console.log("Payload final que será enviado para a API:", JSON.stringify(finalPayload, null, 2));
        console.log("Token que será enviado:", token);
        console.log("Iniciando a chamada da API com axios.post para /api/vagas/completa...");

        try {
            const response = await axios.post(
                "/api/vagas/completa", // <-- Use the relative URL for the proxy
                finalPayload, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log("Sucesso! A API respondeu:", response);
            alert('Vaga e teste cadastrados com sucesso!');
            navigate('/gestao-vagas');

        } catch (error) {
            console.error("ERRO na chamada da API:", error);
            if (error.response) {
                console.error("Dados do erro (response.data):", error.response.data);
                console.error("Status do erro (response.status):", error.response.status);
                setError(error.response.data.error || `Erro ${error.response.status} do servidor.`);
            } else if (error.request) {
                console.error("Requisição enviada, mas sem resposta do servidor:", error.request);
                setError('O servidor não respondeu. Verifique se ele está rodando.');
            } else {
                console.error('Erro ao configurar a requisição:', error.message);
                setError('Ocorreu um erro ao preparar os dados para envio.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- ALTERAÇÃO: Funções de navegação com validação ---
    const handleNextStep = () => {
        setError(''); // Limpa erros antigos
        if (step === 1) {
            if (!formVaga.nome || !formVaga.area || !formVaga.salario || !formVaga.escala || !formVaga.dataInicial || !formVaga.dataLimite || !formVaga.descricao) {
                setError("Por favor, preencha todos os campos obrigatórios da vaga.");
                return;
            }
        }
        if (step === 2) {
            if (!testeData.titulo.trim()) {
                setError("O título do teste é obrigatório.");
                return;
            }
        }
        setStep(step + 1);
    };

    const handlePrevStep = () => {
        setError(''); // Limpa erros ao voltar
        setStep(step - 1);
    };
    
    // Funções de Renderização (Mantidas como está)
    const renderVagaForm = () => (
        <div className="form-vaga">
            <label htmlFor="nome">Nome da vaga</label>
            <input id="nome" type="text" name="nome" placeholder="Ex: Desenvolvedor Frontend" value={formVaga.nome} onChange={handleVagaChange} required />
            <label htmlFor="area">Área</label>
            <select id="area" name="area" value={formVaga.area} onChange={handleVagaChange} required>
                <option value="">Selecione a área</option>
                <option value="Saúde">Saúde</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Engenharia">Engenharia</option>
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
                            <div key={b} className={`beneficio-tag fade-in ${removendo.includes(b) ? "fade-out" : ""}`}>
                                {b}<span className="remove-tag" onClick={() => handleRemoveBeneficio(b)}>✕</span>
                            </div>
                        ))}
                        <input type="text" placeholder="Digite um benefício..." value={novoBeneficio} onChange={(e) => setNovoBeneficio(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddBeneficio(novoBeneficio.trim()); } }} />
                    </div>
                    <div className="beneficios-predefinidos">
                        {beneficiosPreDefinidos.map((b) => (<button type="button" key={b} className="btn-beneficio-pre fade-in" onClick={() => handleAddBeneficio(b)}>{b}</button>))}
                    </div>
                </div>
            )}
            <label htmlFor="salario">Salário</label>
            <input id="salario" type="number" name="salario" placeholder="Ex: 3500.00" step="0.01" value={formVaga.salario} onChange={handleVagaChange} required />
            <label htmlFor="escala">Escala de trabalho</label>
            <input id="escala" type="text" name="escala" placeholder="Ex: 6x1, 5x2, 12x36..." value={formVaga.escala} onChange={handleVagaChange} required />
            <div className="form-row">
                <div><label htmlFor="dataInicial">Data de Abertura</label><input id="dataInicial" type="date" name="dataInicial" value={formVaga.dataInicial} onChange={handleVagaChange} required /></div>
                <div><label htmlFor="dataLimite">Data de Fechamento</label><input id="dataLimite" type="date" name="dataLimite" value={formVaga.dataLimite} onChange={handleVagaChange} required /></div>
            </div>
            <label htmlFor="descricao">Descrição da vaga</label>
            <textarea id="descricao" name="descricao" placeholder="Descreva as responsabilidades, requisitos e diferenciais..." value={formVaga.descricao} onChange={handleVagaChange} rows="5" required />
            <div className="form-actions">
                <Button onClick={handleNextStep} className="btn-cadastroVaga">Próximo</Button>
                <Button style={{backgroundColor:"#cc4040ff"}} type="button" onClick={() => navigate(-1)} className="btn-cancel">Cancelar</Button>
            </div>
        </div>
    );

    const renderTesteForm = () => (
         <div className="form-vaga">
            <h2>Etapa 2: Detalhes do Teste para "{formVaga.nome}"</h2>
            <label htmlFor="titulo-teste">Título do Teste</label>
            <input id="titulo-teste" type="text" name="titulo" placeholder="Ex: Teste de Lógica e JavaScript" value={testeData.titulo} onChange={handleTesteChange} required />
            <label htmlFor="descricao-teste">Descrição/Instruções do Teste</label>
            <textarea id="descricao-teste" name="descricao" placeholder="Instruções para o candidato" value={testeData.descricao} onChange={handleTesteChange} rows="5" />
            <div className="form-actions">
                <Button onClick={handleNextStep} className="btn-cadastroVaga">Próximo</Button>
                <Button style={{backgroundColor:"#6c757d"}} type="button" onClick={handlePrevStep} className="btn-cancel">Voltar</Button>
            </div>
        </div>
    );
    
    const renderQuestaoManager = () => (
        <div className="questao-manager">
            <h2>Etapa 3: Montagem do Teste "{testeData.titulo}"</h2>
            <div className="questoes-adicionadas">
                <h3>Questões Adicionadas ({questoesDoTeste.length})</h3>
                {questoesDoTeste.length === 0 ? (
                    <p className="nenhuma-questao">Nenhuma questão adicionada ainda. Clique abaixo para criar a primeira.</p>
                ) : (
                    <ul className="lista-questoes-teste">
                        {questoesDoTeste.map((q, index) => (
                            <li key={index}>
                                <span>{q.enunciado}</span>
                                <button className="remover" onClick={() => handleRemoveQuestao(index)} title="Remover Questão">✕</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="acoes-questoes">
                <Button onClick={() => setShowModal(true)} className="btn-full-width">+ Criar e Adicionar Nova Questão</Button>
            </div>
            <div className="form-actions">
                <Button onClick={handleFinalSubmit} className="btn-cadastroVaga" disabled={isLoading}>{isLoading ? "Salvando Tudo..." : "Finalizar e Salvar Vaga"}</Button>
                <Button style={{backgroundColor:"#6c757d"}} type="button" onClick={handlePrevStep} className="btn-cancel">Voltar</Button>
            </div>
        </div>
    );

    return (
        <div className="cadastro-vaga-container">
            {showModal && <NovaQuestaoModal onQuestaoCriada={handleQuestaoCriada} onClose={() => setShowModal(false)} />}
            
            {/* --- ALTERAÇÃO: Título dinâmico para cada etapa --- */}
            {step === 1 && <h2>Etapa 1: Cadastro da Vaga</h2>}
            {step === 2 && <h2>Etapa 2: Detalhes do Teste</h2>}
            {step === 3 && <h2>Etapa 3: Montagem do Teste</h2>}

            {error && <div className="mensagem-erro">{error}</div>}
            
            {step === 1 && renderVagaForm()}
            {step === 2 && renderTesteForm()}
            {step === 3 && renderQuestaoManager()}
        </div>
    );
}