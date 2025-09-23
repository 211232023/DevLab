import React, { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import "./Cadastro.css";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";

const Cadastro = () => {
  const [form, setForm] = useState({
    nomeCompleto: "",
    cpf: "",
    email: "",
    telefone: "",
    genero: "",
    senha: "",
    confirmarSenha: "",
    tipo: "Candidato",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const key in form) {
      if (form[key] === "") {
        alert("Preencha todos os campos para se cadastrar!");
        return;
      }
    }

    if (form.senha !== form.confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        nome: form.nomeCompleto,
        cpf: form.cpf,
        email: form.email,
        telefone: form.telefone,
        genero: form.genero,
        senha: form.senha,
        tipo: form.tipo,
      });

      if (response.status === 201 || response.status === 200) {
        alert(response.data.message || "Cadastro realizado com sucesso!");
        navigate("/login");
      } else {
        alert(response.data.error || "Erro ao cadastrar usuário.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert(
        error.response?.data?.error || "Não foi possível conectar ao servidor."
      );
    }
  };

  return (
    <div className="cadastro-page-wrapper">
      <div className="cadastro-container">
        <h2>Crie sua Conta</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nomeCompleto">Nome Completo</label>
            <Input type="text" id="nomeCompleto" name="nomeCompleto" placeholder="Digite seu nome completo" value={form.nomeCompleto} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cpf">CPF</label>
              <Input type="text" id="cpf" name="cpf" placeholder="000.000.000-00" value={form.cpf} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <Input type="text" id="telefone" name="telefone" placeholder="(99) 99999-9999" value={form.telefone} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <Input type="email" id="email" name="email" placeholder="Digite seu email" value={form.email} onChange={handleChange} required />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="genero">Gênero</label>
              <select id="genero" name="genero" value={form.genero} onChange={handleChange} required className="input-select">
                <option value="" disabled>Selecione</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="tipo">Tipo de Conta</label>
              <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange} required className="input-select">
                <option value="Candidato">Candidato</option>
                <option value="RH">Recursos Humanos</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <Input type="password" id="senha" name="senha" placeholder="Crie uma senha" value={form.senha} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="confirmarSenha">Confirmar Senha</label>
              <Input type="password" id="confirmarSenha" name="confirmarSenha" placeholder="Confirme sua senha" value={form.confirmarSenha} onChange={handleChange} required />
            </div>
          </div>

          <Button type="submit" className="cadastro-btn">
            Cadastrar
          </Button>

          <Link to="/login" className="link-login">
            Já tem uma conta? Faça o login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Cadastro;