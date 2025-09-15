import React, { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import "./Cadastro.css";
import { Link, useNavigate } from "react-router-dom";

const Cadastro = () => {
  const [form, setForm] = useState({
    nomeCompleto: "",
    cpf: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      form.nomeCompleto === "" ||
      form.cpf === "" ||
      form.email === "" ||
      form.senha === "" ||
      form.confirmarSenha === ""
    ) {
      alert("Preencha todos os campos para se cadastrar!");
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    // Lógica de envio para o backend
    try {
      const response = await fetch("http://localhost:3001/api/register/candidato", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: form.nomeCompleto,
          cpf: form.cpf,
          email: form.email,
          senha: form.senha,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        navigate("/login"); // Redireciona para a página de login em caso de sucesso
      } else {
        alert(data.error || "Erro ao cadastrar candidato.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Não foi possível conectar ao servidor. Tente novamente.");
    }
  };

  return (
    <div className="cadastro-container">
      <h2>Cadastro</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nomeCompleto">Nome Completo:</label>
          <Input
            type="text"
            id="nomeCompleto"
            name="nomeCompleto"
            placeholder="Digite seu nome completo"
            value={form.nomeCompleto}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="cpf">CPF:</label>
          <Input
            type="text"
            id="cpf"
            name="cpf"
            placeholder="Digite seu CPF"
            value={form.cpf}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="Digite seu email"
            value={form.email}
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
            value={form.senha}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmarSenha">Confirmar Senha:</label>
          <Input
            type="password"
            id="confirmarSenha"
            name="confirmarSenha"
            placeholder="Confirme sua senha"
            value={form.confirmarSenha}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <Link to="/login" id="linkLogin">
            Já tem uma conta? Clique aqui
          </Link>
        </div>
        <Button type="submit" className="cadastro-btn">
          Cadastrar
        </Button>
      </form>
    </div>
  );
};

export default Cadastro;