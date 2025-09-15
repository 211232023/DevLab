import React, { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../AuthContext'; 

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.email === "" || formData.senha === "") {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/login/candidato", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        login(data.user); // Chama a função de login do contexto para salvar o usuário
        navigate("/");
      } else {
        alert(data.error || "Erro ao fazer login.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Não foi possível conectar ao servidor. Tente novamente.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login de Candidato</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="Digite seu email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="senha">Senha:</label>
          <Input
            type="password"
            id="senha"
            name="senha"
            placeholder="Digite sua senha"
            value={formData.senha}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <Link to="/cadastro" id="linkCadastro">
            Não tem cadastro? Clique aqui
          </Link>
        </div>
        <Button type="submit" className="login-btn">
          Entrar
        </Button>
      </form>
    </div>
  );
};

export default Login;