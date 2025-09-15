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
    responsabilidades: "",
    requisitosObrigatorios: "",
    requisitosDiferenciais: "",
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
              type="number"
              name="salario"
              value={form.salario}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="R$ 0,00"
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
            <label>Horário de início do expediente</label>
            <input
              type="time"
              name="horario"
              value={form.horario}
              onChange={handleChange}
            />

            <label>Horário do fim do expediente</label>
            <input
              type="time"
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

        <label>Responsabilidades</label>
        <textarea
          name="responsabilidades"
          value={form.responsabilidades}
          onChange={handleChange}
        />

        <label>Requisitos Obrigatórios</label>
        <textarea
          name="requisitosObrigatorios"
          value={form.requisitosObrigatorios}
          onChange={handleChange}
        />

        <Button type="submit">Cadastrar</Button>
      </form>
    </div>
  );
}
