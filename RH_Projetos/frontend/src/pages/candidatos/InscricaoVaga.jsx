import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./InscricaoVaga.css";
import Button from "../../components/Button";
import Input from "../../components/Input";

const perguntasVaga = [
    {
        id: 1,
        pergunta: "Você tem algum parente trabalhando na empresa?",
        tipo: "textarea",
    },
    {
        id: 2,
        pergunta: "Você possui experiência na área?",
        tipo: "select",
        opcoes: ["Sim", "Não"],
    },
    {
        id: 3,
        pergunta: "Qual sua disponibilidade de horário?",
        tipo: "textarea",
    },
];

const InscricaoVaga = () => {
    const { vagaId } = useParams();
    const [form, setForm] = useState({
        nome: "",
        cpf: "",
        email: "",
        genero: "",
        cep: "",
        bairro: "",
        endereco: "",
        complemento: "",
        curriculo: null,
    });
    const [etapa, setEtapa] = useState(1);
    const [respostas, setRespostas] = useState({});
    const [inscricaoEnviada, setInscricaoEnviada] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handlePerguntaChange = (e) => {
        const { name, value } = e.target;
        setRespostas((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmitForm = (e) => {
        e.preventDefault();
        setEtapa(2);
    };

    const handleSubmitPerguntas = (e) => {
        e.preventDefault();
        setInscricaoEnviada(true);

        // Aqui você pode enviar os dados do formulário e das perguntas
    };

    return (
        <div className={etapa === 1 ? "inscricao-vaga-container" : "inscricao-vaga-container etapa2"}>
            {etapa === 1 && (
                <>
                    <h2>Inscreva-se na Vaga</h2>
                    <form className="inscricao-form" onSubmit={handleSubmitForm}>
                        <div className="form-colunas">
                            <div className="form-col">
                                <label>
                                    Nome Completo:
                                    <Input type="text" name="nome" value={form.nome} onChange={handleChange} required />
                                </label>
                                <label>
                                    Email:
                                    <Input type="email" name="email" value={form.email} onChange={handleChange} required />
                                </label>
                                <label>
                                    Gênero:
                                    <select name="genero" value={form.genero} onChange={handleChange} required>
                                        <option value="">Selecione</option>
                                        <option value="masculino">Masculino</option>
                                        <option value="feminino">Feminino</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </label>
                                <label>
                                    Bairro:
                                    <Input type="text" name="bairro" value={form.bairro} onChange={handleChange} required />
                                </label>
                                <label>
                                    Complemento:
                                    <Input type="text" name="complemento" value={form.complemento} onChange={handleChange} />
                                </label>
                            </div>
                            <div className="form-col">
                                <label>
                                    CPF:
                                    <Input type="text" name="cpf" value={form.cpf} onChange={handleChange} required />
                                </label>
                                <label>
                                    Telefone:
                                    <Input type="text" name="telefone" value={form.telefone || ""} onChange={handleChange} required />
                                </label>
                                <label>
                                    CEP:
                                    <Input type="text" name="cep" value={form.cep} onChange={handleChange} required />
                                </label>
                                <label>
                                    Endereço:
                                    <Input type="text" name="endereco" value={form.endereco} onChange={handleChange} required />
                                </label>
                                <label>
                                    Currículo (PDF):
                                    <Input type="file" name="curriculo" accept=".pdf" onChange={handleChange} required />
                                </label>
                            </div>
                        </div>
                        <Button type="submit" className="btn-enviar">Continuar</Button>
                    </form>
                </>
            )}
            {etapa === 2 && !inscricaoEnviada && (
                <>
                    <h2>Perguntas sobre a vaga</h2>
                    <form className="inscricao-form" onSubmit={handleSubmitPerguntas}>
                        {perguntasVaga.map((p) => (
                            <label key={p.id}>
                                {p.pergunta}
                                {p.tipo === "text" ? (
                                    <textarea
                                        name={`pergunta_${p.id}`}
                                        value={respostas[`pergunta_${p.id}`] || ""}
                                        onChange={handlePerguntaChange}
                                        required
                                    />
                                ) : p.tipo === "select" ? (
                                    <select
                                        name={`pergunta_${p.id}`}
                                        value={respostas[`pergunta_${p.id}`] || ""}
                                        onChange={handlePerguntaChange}
                                        required
                                    >
                                        <option value="">Selecione</option>
                                        {p.opcoes.map((op) => (
                                            <option key={op} value={op}>{op}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <Input
                                        type="text"
                                        name={`pergunta_${p.id}`}
                                        value={respostas[`pergunta_${p.id}`] || ""}
                                        onChange={handlePerguntaChange}
                                        required
                                    />
                                )}
                            </label>
                        ))}
                        <Button type="submit" className="btn-enviar">Enviar Inscrição</Button>
                    </form>
                </>
            )}
            {etapa === 2 && inscricaoEnviada && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <h2>Inscrição enviada com sucesso!</h2>
                    <Link to="/inicio" className="btn-enviar" style={{ textDecoration: "none" }}>Voltar para a tela inicial</Link>
                </div>
            )}
        </div>
    );
};

export default InscricaoVaga;