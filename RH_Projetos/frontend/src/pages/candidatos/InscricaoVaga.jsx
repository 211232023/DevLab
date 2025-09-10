import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./InscricaoVaga.css";
import Button from "../../components/Button";

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

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Inscrição enviada!");
    };

    return (
        <div className="inscricao-vaga-container">
            <h2>Inscreva-se na Vaga</h2>
            <form className="inscricao-form" onSubmit={handleSubmit}>
                <div className="form-colunas">
                    <div className="form-col">
                        <label>
                            Nome Completo:
                            <input type="text" name="nome" value={form.nome} onChange={handleChange} required />
                        </label>
                        <label>
                            Email:
                            <input type="email" name="email" value={form.email} onChange={handleChange} required />
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
                            <input type="text" name="bairro" value={form.bairro} onChange={handleChange} required />
                        </label>
                        <label>
                            Complemento:
                            <input type="text" name="complemento" value={form.complemento} onChange={handleChange} />
                        </label>
                    </div>
                    <div className="form-col">
                        <label>
                            CPF:
                            <input type="text" name="cpf" value={form.cpf} onChange={handleChange} required />
                        </label>
                        <label>
                            Telefone:
                            <input type="text" name="cep" value={form.cep} onChange={handleChange} required />
                        </label>
                        <label>
                            CEP:
                            <input type="text" name="cep" value={form.cep} onChange={handleChange} required />
                        </label>
                        <label>
                            Endereço:
                            <input type="text" name="endereco" value={form.endereco} onChange={handleChange} required />
                        </label>
                        <label>
                            Currículo (PDF):
                            <input type="file" name="curriculo" accept=".pdf" onChange={handleChange} required />
                        </label>
                    </div>
                </div>
                <Button type="submit" className="btn-enviar">Continuar</Button>
            </form>
        </div>
    );
};

export default InscricaoVaga;