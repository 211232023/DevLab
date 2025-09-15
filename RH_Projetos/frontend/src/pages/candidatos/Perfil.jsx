import React, { useState, useEffect } from "react";
import "./Perfil.css";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import { useAuth } from "../../AuthContext";

const Perfil = () => {
    const { user } = useAuth();
    const [dados, setDados] = useState({
        nome: "",
        cpf: "",
        email: "",
        genero: "",
        telefone: ""
    });

    useEffect(() => {
        if (user) {
            setDados({
                nome: user.nome || "",
                cpf: user.cpf || "",
                email: user.email || "",
                genero: user.genero || "",
                telefone: user.telefone || "",
            });
        }
    }, [user]);

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
        // Lógica para enviar os dados atualizados para o backend
        // Exemplo:
        // api.put(`/candidatos/${user.id}`, form)
        //    .then(response => {
        //        console.log("Dados atualizados com sucesso!", response.data);
        //    })
        //    .catch(error => {
        //        console.error("Erro ao atualizar os dados:", error);
        //    });
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
            </ul>
            <Button className="btn-atualizar" onClick={abrirModal}>Atualizar Informações</Button>

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
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </label>
                            <label>
                                Telefone:
                                <input type="text" name="telefone" value={form.telefone} onChange={handleChange} required />
                            </label>
                            <Button type="submit" className="btn-enviar">Salvar</Button>
                            <button type="button" className="btn-cancelar" onClick={fecharModal}>Cancelar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Perfil;