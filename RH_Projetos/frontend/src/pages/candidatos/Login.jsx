import React, { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import api from "../../api"; // Use a instância do api para o login
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email === "" || senha === "") {
      alert("Preencha todos os campos para entrar!");
      return;
    }

    try {
      // Use a instância do `api`
      const response = await api.post("/auth/login", { email, senha });
      const data = response.data;

      if (response.status === 200) {
        // Passe o usuário E o token para a função de login
        login(data.user, data.token); 
        
        // Redireciona com base no tipo de usuário
        if (data.user.tipo === 'Candidato') {
          navigate("/inicio");
        } else if (data.user.tipo === 'RH') {
          navigate("/dashboard-rh"); 
        } else {
          navigate("/");
        }
      } else {
        alert(data.error || "Erro ao fazer login.");
      }
    } catch (error) {
      console.error("Erro na requisição de login:", error);
      alert(
        error.response?.data?.error || "Não foi possível conectar ao servidor."
      );
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <Input
            type="email"
            id="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="senha">Senha:</label>
          <Input
            type="password"
            id="senha"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <Link to="/cadastro" id="linkCadastro">
            Não tem uma conta? Clique aqui
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