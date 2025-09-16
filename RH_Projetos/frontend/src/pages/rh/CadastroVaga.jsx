import React, { useState } from "react";
import "./CadastroVaga.css";
import Button from "../../components/Button";

export default function CadastroVaga() {
  const [form, setForm] = useState({
    nome: "",
    beneficios: [],
    salario: "",
    escala: "",
    horaInicio: "",
    horaFim: "",
    dataInicial: "",
    dataLimite: "",
    descricao: "",
  });

  const [novoBeneficio, setNovoBeneficio] = useState("");
  const [removendo, setRemovendo] = useState([]);
  const [showHorario, setShowHorario] = useState({ inicio: false, fim: false });

  const todosBeneficiosPreDefinidos = [
    "Vale-refeição",
    "Vale-transporte",
    "Plano de saúde",
    "Seguro de vida",
    "Home office",
    "Auxílio creche",
    "Bônus anual",
    "Participação nos lucros",
    "Estacionamento",
    "Assistência odontológica",
  ];

  const beneficiosPreDefinidos = todosBeneficiosPreDefinidos.filter(
    (b) => !form.beneficios.includes(b)
  );

  const handleAddBeneficio = (b) => {
    if (b && !form.beneficios.includes(b)) {
      setForm({ ...form, beneficios: [...form.beneficios, b] });
      setNovoBeneficio("");
    }
  };

  // Fade-out: adiciona o benefício ao array "removendo", depois remove do estado
  const handleRemoveBeneficio = (b) => {
    setRemovendo((prev) => [...prev, b]);
    setTimeout(() => {
      setForm({
        ...form,
        beneficios: form.beneficios.filter((item) => item !== b),
      });
      setRemovendo((prev) => prev.filter((item) => item !== b));
    }, 300); // 300ms = duração da animação
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados da vaga:", form);
    alert("Vaga cadastrada com sucesso!");
  };

  const handleCancel = () => {
    window.history.back();
  };

  const horarios = Array.from({ length: 24 }, (_, h) =>
    Array.from({ length: 12 }, (_, i) => {
      const minutos = String(i * 5).padStart(2, "0");
      return `${String(h).padStart(2, "0")}:${minutos}`;
    })
  ).flat();

  return (
    <div className="cadastro-vaga-container">
      <h2>Cadastro da Vaga</h2>
      <form onSubmit={handleSubmit} className="form-vaga">
        <label htmlFor="nome">Nome da vaga</label>
        <input
          id="nome"
          type="text"
          name="nome"
          placeholder="Ex: Desenvolvedor Frontend"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
        />

        <div className="form-row">
          <div>
            <label>Benefícios</label>
            <div className="beneficios-box">
              {form.beneficios.map((b) => (
                <div
                  key={b}
                  className={`beneficio-tag fade-in ${
                    removendo.includes(b) ? "fade-out" : ""
                  }`}
                  style={{ animationDuration: "0.3s" }}
                >
                  {b}
                  <span
                    className="remove-tag"
                    onClick={() => handleRemoveBeneficio(b)}
                  >
                    ✕
                  </span>
                </div>
              ))}
              <input
                type="text"
                placeholder="Digite um benefício..."
                value={novoBeneficio}
                onChange={(e) => setNovoBeneficio(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddBeneficio(novoBeneficio.trim());
                  }
                }}
              />
            </div>
            <div className="beneficios-predefinidos">
              {beneficiosPreDefinidos.map((b) => (
                <button
                  type="button"
                  key={b}
                  className="btn-beneficio-pre fade-in"
                  onClick={() => handleAddBeneficio(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="salario">Salário</label>
            <input
              id="salario"
              type="number"
              name="salario"
              placeholder="Ex: 3500.00"
              step="0.01"
              value={form.salario}
              onChange={(e) => setForm({ ...form, salario: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="escala">Escala de trabalho</label>
            <input
              id="escala"
              type="text"
              name="escala"
              placeholder="Ex: 6x1"
              value={form.escala}
              onChange={(e) => setForm({ ...form, escala: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="horario-wrapper">
              <label htmlFor="horaInicio">Horário de início</label>
              <input
                id="horaInicio"
                type="time"
                name="horaInicio"
                value={form.horaInicio}
                onChange={(e) =>
                  setForm({ ...form, horaInicio: e.target.value })
                }
                onFocus={() => setShowHorario({ ...showHorario, inicio: true })}
                onBlur={() =>
                  setTimeout(
                    () => setShowHorario({ ...showHorario, inicio: false }),
                    200
                  )
                }
                required
              />
              {showHorario.inicio && (
                <div className="horario-scroll">
                  {horarios.map((hora) => (
                    <div
                      key={hora}
                      className="horario-opcao"
                      onClick={() => setForm({ ...form, horaInicio: hora })}
                    >
                      {hora}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="horario-wrapper">
              <label htmlFor="horaFim">Horário de término</label>
              <input
                id="horaFim"
                type="time"
                name="horaFim"
                value={form.horaFim}
                onChange={(e) => setForm({ ...form, horaFim: e.target.value })}
                onFocus={() => setShowHorario({ ...showHorario, fim: true })}
                onBlur={() =>
                  setTimeout(
                    () => setShowHorario({ ...showHorario, fim: false }),
                    200
                  )
                }
                required
              />
              {showHorario.fim && (
                <div className="horario-scroll">
                  {horarios.map((hora) => (
                    <div
                      key={hora}
                      className="horario-opcao"
                      onClick={() => setForm({ ...form, horaFim: hora })}
                    >
                      {hora}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="dataInicial">Data inicial</label>
            <input
              id="dataInicial"
              type="date"
              name="dataInicial"
              value={form.dataInicial}
              onChange={(e) =>
                setForm({ ...form, dataInicial: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label htmlFor="dataLimite">Data limite</label>
            <input
              id="dataLimite"
              type="date"
              name="dataLimite"
              value={form.dataLimite}
              onChange={(e) => setForm({ ...form, dataLimite: e.target.value })}
              required
            />
          </div>
        </div>

        <label htmlFor="descricao">Descrição da vaga</label>
        <textarea
          id="descricao"
          name="descricao"
          placeholder="Descreva as responsabilidades, requisitos e diferenciais..."
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          rows="5"
        />

        <div className="form-actions">
          <Button type="submit">Cadastrar</Button>
          <Button type="button" onClick={handleCancel} className="btn-cancel">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
