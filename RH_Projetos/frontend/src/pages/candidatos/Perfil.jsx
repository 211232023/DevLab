import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import "./Perfil.css";
import Button from "../../components/Button";
import Input from "../../components/Input";

const Perfil = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    genero: "",
    tipo: "", // Adicionado o campo tipo
    senha: "",
    confirmarSenha: "",
  });

  // Popula o formulário com os dados do usuário quando o componente carrega
  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || "",
        email: user.email || "",
        cpf: user.cpf || "",
        telefone: user.telefone || "",
        genero: user.genero || "",
        tipo: user.tipo || "Candidato", // Adicionado
        senha: "",
        confirmarSenha: "",
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const resetForm = () => {
     if (user) {
      setFormData({
        nome: user.nome || "",
        email: user.email || "",
        cpf: user.cpf || "",
        telefone: user.telefone || "",
        genero: user.genero || "",
        tipo: user.tipo || "Candidato", // Adicionado
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
      // Objeto com todos os dados que podem ser atualizados
      const dataToSend = {
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
        telefone: formData.telefone,
        genero: formData.genero,
        tipo: formData.tipo, // Adicionado
      };
      
      // Adiciona a senha apenas se ela foi alterada
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
    return <div>Carregando...</div>;
  }

  return (
    <div className="perfil-container">
      <h2>Perfil do Usuário</h2>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          {/* CAMPOS ADICIONADOS */}
          <div className="form-group">
            <label htmlFor="nome">Nome Completo:</label>
            <Input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="cpf">CPF:</label>
            <Input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="telefone">Telefone:</label>
            <Input type="text" id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="genero">Gênero:</label>
            <select id="genero" name="genero" value={formData.genero} onChange={handleChange} className="input-select">
              <option value="">Selecione</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
           <div className="form-group">
            <label htmlFor="tipo">Tipo de Usuário:</label>
            <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} className="input-select">
              <option value="Candidato">Candidato</option>
              <option value="RH">Recursos Humanos</option>
            </select>
          </div>
          {/* CAMPOS DE SENHA */}
          <div className="form-group">
            <label htmlFor="senha">Nova Senha:</label>
            <Input type="password" id="senha" name="senha" placeholder="Deixe em branco para não alterar" value={formData.senha} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Nova Senha:</label>
            <Input type="password" id="confirmarSenha" name="confirmarSenha" placeholder="Repita a nova senha" value={formData.confirmarSenha} onChange={handleChange} />
          </div>
          <div className="btn-group">
            <button type="submit" className="save-btn">Salvar</button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>Cancelar</button>
          </div>
        </form>
      ) : (
        <div className="perfil-info">
          <p><strong>Nome:</strong> {user.nome || "Não informado"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>CPF:</strong> {user.cpf}</p>
          <p><strong>Telefone:</strong> {user.telefone}</p>
          <p><strong>Gênero:</strong> {user.genero || "Não informado"}</p>
          <button className="edit-btn" onClick={handleEdit}>Editar Perfil</button>
        </div>
      )}
    </div>
  );
};

export default Perfil;