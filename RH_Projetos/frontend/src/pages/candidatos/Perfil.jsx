import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import "./Perfil.css";
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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
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
        ...formData,
        nome: formData.nome,
      };
      
      if (!formData.senha) {
        delete dataToSend.senha;
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
      <h2>Perfil do Candidato</h2>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome:</label>
            <Input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cpf">CPF:</label>
            <Input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="telefone">Telefone:</label>
            <Input
              type="text"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="genero">Gênero:</label>
            <Input
              type="text"
              id="genero"
              name="genero"
              value={formData.genero}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="senha">Nova Senha:</label>
            <Input
              type="password"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Nova Senha:</label>
            <Input
              type="password"
              id="confirmarSenha"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
            />
          </div>
          <div className="btn-group">
            <button type="submit" className="save-btn">
              Salvar
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>
            </button>
            <br />
            <button style={{ backgroundColor: "red" }} type="button" className="cancel-btn" onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="perfil-info">
          <p>
            <strong>Nome:</strong> {user.nome || "Nome não informado"}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>CPF:</strong> {user.cpf}
          </p>
          <p>
            <strong>Telefone:</strong> {user.telefone}
          </p>
          <button className="edit-btn" onClick={handleEdit}>
          <p>
            <strong>Gênero:</strong> {user.genero}
          </p>
          </button>
          <button className="edit-btn" onClick={handleEdit}>
            Editar Perfil
          </button>
        </div>
      )}
    </div>
  );
};

export default Perfil;