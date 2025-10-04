import React, { useState, useEffect } from "react";
import api from "../../api";
import { useAuth } from "../../AuthContext";
import { useNavigate } from 'react-router-dom';
import "./CadastroVaga.css";
import Button from "../../components/Button";
import { FaTrashAlt } from 'react-icons/fa';

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
                    <Button style={{backgroundColor:"#cc4040ff"}} type="button" onClick={onClose} className="btn-cancel">Cancelar</Button>
                    <Button type="button" onClick={handleAddQuestao} className="btn-confirm">Adicionar Questão</Button>
                </div>
            </div>
        </div>
    );
};

export default function CadastroVaga() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const [formVaga, setFormVaga] = useState({
        nome: "", area: "", beneficios: [], salario: "",
        escala: "", dataInicial: "", dataLimite: "", descricao: "",
    });
    const [testeData, setTesteData] = useState({ titulo: '', descricao: '' });
    const [questoesDoTeste, setQuestoesDoTeste] = useState([]);

    const [novoBeneficio, setNovoBeneficio] = useState("");
    const [removendo, setRemovendo] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    const todosBeneficiosPreDefinidos = ["Vale-refeição", "Vale-transporte", "Plano de saúde", "Seguro de vida", "Home office", "Auxílio creche", "Bônus anual", "Participação nos lucros"];
    const beneficiosDisponiveis = todosBeneficiosPreDefinidos.filter(b => !formVaga.beneficios.includes(b));

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

    const handleQuestaoCriada = (novaQuestao) => setQuestoesDoTeste(prev => [...prev, novaQuestao]);
    const handleRemoveQuestao = (index) => setQuestoesDoTeste(prev => prev.filter((_, i) => i !== index));

    const handleFinalSubmit = async () => {
        if (questoesDoTeste.length === 0) {
            setError('É necessário adicionar pelo menos uma questão ao teste.');
            return;
        }
        
        setIsLoading(true);
        setError('');

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

        try {
            const response = await api.post("/vagas/completa", finalPayload);
            alert('Vaga e teste cadastrados com sucesso!');
            navigate('/inicio');
        } catch (error) {
            console.error("ERRO na chamada da API:", error);
            setError(error.response?.data?.error || 'Ocorreu um erro ao salvar a vaga.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextStep = () => {
        setError('');
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
        setError('');
        setStep(step - 1);
    };
    
    return (
        <div className="cadastro-vaga-wrapper">
            <div className="cadastro-vaga-container">
                {showModal && <NovaQuestaoModal onQuestaoCriada={handleQuestaoCriada} onClose={() => setShowModal(false)} />}
                
                <div className="progress-bar">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>
                        <div className="step-number">1</div>
                        <div className="step-label">Dados da Vaga</div>
                    </div>
                    <div className={`step-connector ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>
                        <div className="step-number">2</div>
                        <div className="step-label">Detalhes do Teste</div>
                    </div>
                    <div className={`step-connector ${step >= 3 ? 'active' : ''}`}></div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>
                        <div className="step-number">3</div>
                        <div className="step-label">Montagem do Teste</div>
                    </div>
                </div>

                <div className="form-content">
                    {error && <div className="mensagem-erro">{error}</div>}
                    
                    {step === 1 && (
                        <div className="form-step">
                            <div className="form-row">
                                <div className="form-group"><label>Nome da vaga</label><input name="nome" placeholder="Ex: Desenvolvedor Frontend" value={formVaga.nome} onChange={handleVagaChange} required /></div>
                                <div className="form-group"><label>Área</label><select name="area" value={formVaga.area} onChange={handleVagaChange} required><option value="">Selecione a área</option><option value="Tecnologia">Tecnologia</option><option value="Saúde">Saúde</option><option value="Engenharia">Engenharia</option></select></div>
                            </div>
                             <div className="form-row">
                                <div className="form-group"><label>Salário (R$)</label><input type="number" name="salario" placeholder="Ex: 3500.00" value={formVaga.salario} onChange={handleVagaChange} required /></div>
                                <div className="form-group"><label>Escala de trabalho</label><input name="escala" placeholder="Ex: 6x1, 5x2..." value={formVaga.escala} onChange={handleVagaChange} required /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Data de Abertura</label><input type="date" name="dataInicial" value={formVaga.dataInicial} onChange={handleVagaChange} required /></div>
                                <div className="form-group"><label>Data de Fechamento</label><input type="date" name="dataLimite" value={formVaga.dataLimite} onChange={handleVagaChange} required /></div>
                            </div>
                            <div className="form-group"><label>Descrição da vaga</label><textarea name="descricao" placeholder="Descreva as responsabilidades, requisitos e diferenciais..." value={formVaga.descricao} onChange={handleVagaChange} rows="5" required /></div>
                            <div className="form-group">
                                <label>Benefícios</label>
                                <div className="beneficios-container">
                                    <div className="beneficios-selecionados">
                                        {formVaga.beneficios.map((b) => (<div key={b} className={`beneficio-tag ${removendo.includes(b) ? "fade-out" : ""}`}>{b}<span onClick={() => handleRemoveBeneficio(b)}>✕</span></div>))}
                                    </div>
                                    <div className="beneficios-disponiveis">
                                        {beneficiosDisponiveis.map((b) => (<button type="button" key={b} className="btn-beneficio" onClick={() => handleAddBeneficio(b)}>+ {b}</button>))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                       <div className="form-step">
                            <h3>Detalhes do Teste para "{formVaga.nome}"</h3>
                            <div className="form-group"><label>Título do Teste</label><input name="titulo" placeholder="Ex: Teste de Lógica e JavaScript" value={testeData.titulo} onChange={handleTesteChange} required /></div>
                            <div className="form-group"><label>Descrição/Instruções do Teste</label><textarea name="descricao" placeholder="Instruções para o candidato" value={testeData.descricao} onChange={handleTesteChange} rows="5" /></div>
                        </div>
                    )}
                    
                    {step === 3 && (
                        <div className="form-step">
                            <h3>Montagem do Teste "{testeData.titulo}"</h3>
                            <div className="questoes-adicionadas">
                                <h4>Questões Adicionadas ({questoesDoTeste.length})</h4>
                                {questoesDoTeste.length === 0 ? <p className="nenhuma-questao">Nenhuma questão adicionada.</p> : (
                                    <ul className="lista-questoes-teste">
                                        {questoesDoTeste.map((q, index) => (<li key={index}><span>{q.enunciado}</span><button onClick={() => handleRemoveQuestao(index)} title="Remover"><FaTrashAlt /></button></li>))}
                                    </ul>
                                )}
                            </div>
                            <Button onClick={() => setShowModal(true)} className="btn-add-questao">+ Criar e Adicionar Nova Questão</Button>
                        </div>
                    )}

                    <div className="form-actions">
                        {step > 1 && <Button type="button" className="btn-back" onClick={handlePrevStep}>Voltar</Button>}
                        {step < 3 && <Button type="button" className="btn-next" onClick={handleNextStep}>Próximo</Button>}
                        {step === 3 && <Button type="button" className="btn-next" onClick={handleFinalSubmit} disabled={isLoading}>{isLoading ? "Salvando..." : "Finalizar e Salvar Vaga"}</Button>}
                    </div>
                </div>
            </div>
        </div>
    );
}