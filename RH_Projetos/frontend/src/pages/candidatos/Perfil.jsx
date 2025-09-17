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
      // Cria um objeto apenas com os dados que serão enviados
      const dataToSend = {
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
        telefone: formData.telefone,
        genero: formData.genero,
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
      <h2>Perfil do Candidato</h2>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          {/* ... Inputs para nome, email, cpf, telefone ... */}
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
              placeholder="Deixe em branco para não alterar"
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
              placeholder="Repita a nova senha"
              value={formData.confirmarSenha}
              onChange={handleChange}
            />
          </div>
          <div className="btn-group">
            <Button type="submit" className="save-btn">
              Salvar
            </Button>
            <Button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <div className="perfil-info">
          <p>
            <strong>Nome:</strong> {user.nome || "Não informado"}
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
           <p>
            <strong>Gênero:</strong> {user.genero || "Não informado"}
          </p>
          <Button className="edit-btn" onClick={handleEdit}>
            Editar Perfil
          </Button>
        </div>
      )}
    </div>
  );
};

export default Perfil;