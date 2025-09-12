import React, { useState } from "react";
import "./Perfil.css";

const Perfil = () => {
    const [dados, setDados] = useState({
        nome: "Nome do Usuário",
        cpf: "000.000.000-00",
        email: "usuario@email.com",
        genero: "Outro",
        telefone: "(00) 00000-0000",
        cep: "00000-000",
        bairro: "Bairro",
        endereco: "Endereço",
        complemento: "Complemento",
        curriculo: "curriculo.pdf"
    });

    const [modalAberto, setModalAberto] = useState(false);
    const [form, setForm] = useState(dados);

    const abrirModal = () => {
        setForm(dados);
        setModalAberto(true);
    };

    const fecharModal = () => setModalAberto(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setDados(form);
        fecharModal();
    };

    return (
        <div className="perfil-container">
            <h2>Meu Perfil</h2>
            <ul className="perfil-lista">
                <li><strong>Nome:</strong> {dados.nome}</li>
                <li><strong>CPF:</strong> {dados.cpf}</li>
                <li><strong>Email:</strong> {dados.email}</li>
                <li><strong>Gênero:</strong> {dados.genero}</li>
                <li><strong>Telefone:</strong> {dados.telefone}</li>
                <li><strong>CEP:</strong> {dados.cep}</li>
                <li><strong>Bairro:</strong> {dados.bairro}</li>
                <li><strong>Endereço:</strong> {dados.endereco}</li>
                <li><strong>Complemento:</strong> {dados.complemento}</li>
                <li><strong>Currículo:</strong> {dados.curriculo}</li>
            </ul>
            <button className="btn-atualizar" onClick={abrirModal}>Atualizar Informações</button>

            {modalAberto && (
                <div className="perfil-modal-bg">
                    <div className="perfil-modal-container">
                        <h3>Atualizar Informações</h3>
                        <form className="perfil-modal-form" onSubmit={handleSubmit}>
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
                                Telefone:
                                <input type="text" name="telefone" value={form.telefone} onChange={handleChange} required />
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
                                Currículo:
                                <input type="text" name="curriculo" value={form.curriculo} onChange={handleChange} />
                            </label>
                            <button type="submit" className="btn-enviar">Salvar</button>
                            <button type="button" className="btn-cancelar" onClick={fecharModal}>Cancelar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Perfil;