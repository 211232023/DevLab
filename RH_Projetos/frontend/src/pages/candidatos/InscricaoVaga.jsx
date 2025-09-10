import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./InscricaoVaga.css";

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
        // Aqui você pode enviar os dados para o backend
        alert("Inscrição enviada!");
    };

    return (
        <div className="inscricao-vaga-container">
            <h2>Inscreva-se na Vaga</h2>
            <form className="inscricao-form" onSubmit={handleSubmit}>
                <label>
                    Nome Completo:
                    <input type="text" name="nome" value={form.nome} onChange={handleChange} required />
                </label>
                <label>
                    CPF:
                    <input type="text" name="cpf" value={form.cpf} onChange={handleChange} required />
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
                    CEP:
                    <input type="text" name="cep" value={form.cep} onChange={handleChange} required />
                </label>
                <label>
                    Bairro:
                    <input type="text" name="bairro" value={form.bairro} onChange={handleChange} required />
                </label>
                <label>
                    Endereço:
                    <input type="text" name="endereco" value={form.endereco} onChange={handleChange} required />
                </label>
                <label>
                    Complemento:
                    <input type="text" name="complemento" value={form.complemento} onChange={handleChange} />
                </label>
                <label>
                    Currículo (PDF):
                    <input type="file" name="curriculo" accept=".pdf" onChange={handleChange} required />
                </label>
                <button type="submit" className="btn-enviar">Enviar Inscrição</button>
            </form>
        </div>
    );
};

export default InscricaoVaga;