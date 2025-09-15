import React, { useState } from "react";
import "./CadastroVaga.css";
import Button from "../../components/Button";

export default function CadastroVaga() {
  const [form, setForm] = useState({
    nome: "",
    beneficios: "",
    salario: "",
    escala: "",
    horario: "",
    dataInicial: "",
    dataLimite: "",
    descricao: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados da vaga:", form);
    alert("Vaga cadastrada com sucesso!");
  };

  return (
    <div className="cadastro-vaga-container">
      <h2>Cadastro da Vaga</h2>
      <form onSubmit={handleSubmit}>
        <label>Nome da vaga</label>
        <input
          type="text"
          name="nome"
          value={form.nome}
          onChange={handleChange}
        />

        <div className="form-row">
          <div>
            <label>Benefícios</label>
            <input
              type="text"
              name="beneficios"
              value={form.beneficios}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Salário</label>
            <input
              type="text"
              name="salario"
              value={form.salario}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Escala de trabalho</label>
            <input
              type="text"
              name="escala"
              value={form.escala}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Horário</label>
            <input
              type="text"
              name="horario"
              value={form.horario}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Data inicial</label>
            <input
              type="date"
              name="dataInicial"
              value={form.dataInicial}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Data limite</label>
            <input
              type="date"
              name="dataLimite"
              value={form.dataLimite}
              onChange={handleChange}
            />
          </div>
        </div>

        <label>Descrição da vaga</label>
        <textarea
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
        />

        <Button type="submit">Cadastrar</Button>
      </form>
    </div>
  );
}
