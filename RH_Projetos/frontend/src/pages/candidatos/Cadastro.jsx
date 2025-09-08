import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Input from "../../components/Input";
import Button from "../../components/Button";
import "./Cadastro.css";

const Cadastro = () => {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulário enviado:", form);
  };

  return (
    <div className="cadastro-container">
      <form className="cadastro-form" onSubmit={handleSubmit}>
        <h2>Cadastro de Candidato</h2>

        <Input
          label="Nome completo"
          name="nome"
          placeholder="Digite seu nome"
          value={form.nome}
          onChange={handleChange}
        />
        <Input
          label="CPF"
          name="cpf"
          placeholder="Digite seu CPF"
          value={form.nome}
          onChange={handleChange}
        />
        <Input
          label="E-mail"
          name="email"
          type="email"
          placeholder="Digite seu e-mail"
          value={form.email}
          onChange={handleChange}
        />
        <Input
          label="Senha"
          name="senha"
          type="password"
          placeholder="Digite sua senha"
          value={form.senha}
          onChange={handleChange}
        />
        <Input
          label="Confirmar senha"
          name="confirmarSenha"
          type="password"
          placeholder="Confirme sua senha"
          value={form.confirmarSenha}
          onChange={handleChange}
        />

        <Button type="submit">Cadastrar</Button>
      </form>
    </div>
  );
};

export default Cadastro;
