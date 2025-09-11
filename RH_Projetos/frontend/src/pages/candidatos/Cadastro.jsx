import React, { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import "./Cadastro.css";
import { Link } from "react-router-dom";

const Cadastro = () => {
  // Estado inicial do formulário
  const [form, setForm] = useState({
    nomeCompleto: "",
    cpf: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  // Função para lidar com mudanças nos campos de entrada
  const handleChange = (e) => {
    const { name, value } = e.target; // Obtém o nome e o valor do campo alterado
    setForm({ ...form, [name]: value }); // Atualiza o estado com base no nome do campo
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();

    // Verifica se todos os campos estão preenchidos
    if (
        form.nomeCompleto === "" ||
        form.cpf === "" ||
        form.email === "" ||
        form.senha === "" ||
        form.confirmarSenha === ""
    ) {
        alert("Preencha todos os campos para se cadastrar!");
        return; // Impede o envio
    }

    // Verifica se as senhas coincidem
    if (form.senha !== form.confirmarSenha) {
        alert("As senhas não coincidem!");
        return; // Impede o envio
    }

    // Aqui vai a lógica de envio para o backend (exemplo com fetch)
    // fetch("/api/cadastro", { method: "POST", body: JSON.stringify(form) })

    console.log("Formulário enviado:", form);
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
