import React, { useState } from "react";

function CadastroVaga() {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/api/vagas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        alert("Vaga cadastrada com sucesso!");
        setForm({
          nome: "",
          beneficios: "",
          salario: "",
          escala: "",
          horario: "",
          dataInicial: "",
          dataLimite: "",
          descricao: "",
        });
      } else {
        alert("Erro ao cadastrar vaga.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "2rem auto",
        padding: "2rem",
        background: "#e9f0f6",
        borderRadius: "10px",
      }}
    >
      <h2 style={{ marginBottom: "1.5rem" }}>Cadastro da Vaga</h2>
      <form onSubmit={handleSubmit}>
        {/* Nome da vaga */}
        <div style={{ marginBottom: "1rem" }}>
          <label>Nome da vaga</label>
          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </div>

        {/* Benefícios + Salário */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label>Benefícios</label>
            <input
              type="text"
              name="beneficios"
              value={form.beneficios}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Salário</label>
            <input
              type="number"
              name="salario"
              value={form.salario}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
        </div>

        {/* Escala + Horário */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label>Escala de trabalho</label>
            <input
              type="text"
              name="escala"
              value={form.escala}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Horário</label>
            <input
              type="text"
              name="horario"
              value={form.horario}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
        </div>

        {/* Datas */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label>Data inicial</label>
            <input
              type="date"
              name="dataInicial"
              value={form.dataInicial}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Data limite</label>
            <input
              type="date"
              name="dataLimite"
              value={form.dataLimite}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
        </div>

        {/* Descrição */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label>Descrição da vaga</label>
          <textarea
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            rows="5"
            style={{ width: "100%", padding: "10px", fontSize: "1rem" }}
            required
          />
        </div>

        {/* Botão */}
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            background: "#00695c",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Cadastrar
        </button>
      </form>
    </div>
  );
}

export default CadastroVaga;
