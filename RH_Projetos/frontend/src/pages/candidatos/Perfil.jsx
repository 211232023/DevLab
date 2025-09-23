import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import "./Perfil.css";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { FaUserCircle } from 'react-icons/fa';

const Perfil = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        cpf: "",
        telefone: "",
        genero: "",
        senha: "",
        confirmarSenha: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                nome: user.nome || "",
                email: user.email || "",
                cpf: user.cpf || "",
                telefone: user.telefone || "",
                genero: user.genero || "",
                senha: "",
                confirmarSenha: "",
            });
        }
    }, [user]);

    const resetForm = () => {
        if (user) {
            setFormData({
                nome: user.nome || "",
                email: user.email || "",
                cpf: user.cpf || "",
                telefone: user.telefone || "",
                genero: user.genero || "",
                senha: "",
                confirmarSenha: "",
            });
        }
    }

    const handleCancel = () => {
        setIsEditing(false);
        resetForm();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.senha && formData.senha !== formData.confirmarSenha) {
            alert("As senhas não coincidem.");
            return;
        }

        try {
            const dataToSend = {
                nome: formData.nome,
                email: formData.email,
                cpf: formData.cpf,
                telefone: formData.telefone,
                genero: formData.genero,
            };

            if (formData.senha) {
                dataToSend.senha = formData.senha;
            }

            await updateUser(dataToSend);
            setIsEditing(false);
            alert("Perfil atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            alert("Erro ao atualizar perfil. Tente novamente.");
        }
    };

    if (!user) {
        return <div className="loading-container">Carregando...</div>;
    }

    return (
        <div className="perfil-page-wrapper">
            <div className="perfil-container">
                <div className="perfil-header">
                    <FaUserCircle className="perfil-avatar" />
                    <h2>{isEditing ? "Editar Perfil" : "Meu Perfil"}</h2>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="perfil-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="nome">Nome Completo</label>
                                <Input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="cpf">CPF</label>
                                <Input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="telefone">Telefone</label>
                                <Input type="text" id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="genero">Gênero</label>
                            <select id="genero" name="genero" value={formData.genero} onChange={handleChange} className="input-select">
                                <option value="">Selecione</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                        <hr className="form-divider" />
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="senha">Nova Senha</label>
                                <Input type="password" id="senha" name="senha" placeholder="Deixe em branco para não alterar" value={formData.senha} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
                                <Input type="password" id="confirmarSenha" name="confirmarSenha" placeholder="Repita a nova senha" value={formData.confirmarSenha} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="btn-group">
                            <Button style={{backgroundColor:"#cc4040ff"}} type="button" className="btn-cancel" onClick={handleCancel}>Cancelar</Button>
                            <Button type="submit" className="btn-save">Salvar Alterações</Button>
                        </div>
                    </form>
                ) : (
                    <div className="perfil-info">
                        <div className="info-item">
                            <strong>Nome:</strong>
                            <span>{user.nome || "Não informado"}</span>
                        </div>
                        <div className="info-item">
                            <strong>Email:</strong>
                            <span>{user.email}</span>
                        </div>
                        <div className="info-item">
                            <strong>CPF:</strong>
                            <span>{user.cpf}</span>
                        </div>
                        <div className="info-item">
                            <strong>Telefone:</strong>
                            <span>{user.telefone}</span>
                        </div>
                        <div className="info-item">
                            <strong>Gênero:</strong>
                            <span>{user.genero || "Não informado"}</span>
                        </div>
                        <Button className="btn-edit" onClick={() => setIsEditing(true)}>Editar Perfil</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Perfil;
