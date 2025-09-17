import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../AuthContext";
import "./CadastroVaga.css";
import Button from "../../components/Button";

// A Navbar foi removida daqui, pois já é renderizada pelo AppRoutes.jsx

export default function CadastroVaga() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    nome: "",
    area: "",
    beneficios: [],
    salario: "",
    escala: "",
    dataInicial: "",
    dataLimite: "",
    descricao: "",
  });

  const [novoBeneficio, setNovoBeneficio] = useState("");
  const [removendo, setRemovendo] = useState([]);
  const [mostrarBeneficios, setMostrarBeneficios] = useState(false);

  const todosBeneficiosPreDefinidos = [
    "Vale-refeição", "Vale-transporte", "Plano de saúde", "Seguro de vida",
    "Home office", "Auxílio creche", "Bônus anual", "Participação nos lucros",
    "Estacionamento", "Assistência odontológica",
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

  const handleRemoveBeneficio = (b) => {
    setRemovendo((prev) => [...prev, b]);
    setTimeout(() => {
      setForm({
        ...form,
        beneficios: form.beneficios.filter((item) => item !== b),
      });
      setRemovendo((prev) => prev.filter((item) => item !== b));
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      alert("Erro de autenticação. Por favor, faça o login novamente.");
      return;
    }

    const vagaDataParaAPI = {
      rh_id: user.id,
      titulo: form.nome,
      area: form.area,
      salario: parseFloat(form.salario),
      descricao: form.descricao,
      data_Abertura: form.dataInicial,
      data_fechamento: form.dataLimite,
      escala_trabalho: form.escala,
      beneficios: form.beneficios.join(', '),
    };

    try {
      const response = await axios.post("http://localhost:3001/vagas", vagaDataParaAPI);

      console.log("Vaga cadastrada:", response.data);
      alert("Vaga cadastrada com sucesso!");

      setForm({
        nome: "", area: "", beneficios: [], salario: "", escala: "",
        dataInicial: "", dataLimite: "", descricao: "",
      });
      setMostrarBeneficios(false);

    } catch (error) {
      console.error("Erro ao cadastrar vaga:", error.response ? error.response.data : error.message);
      alert("Falha ao cadastrar a vaga. Verifique o console para detalhes.");
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    // O <Navbar /> foi removido do topo deste return
    <div className="cadastro-vaga-container">
      <h2>Cadastro da Vaga</h2>
      <form onSubmit={handleSubmit} className="form-vaga">
        <label htmlFor="nome">Nome da vaga</label>
        <input
          id="nome" type="text" name="nome" placeholder="Ex: Desenvolvedor Frontend"
          value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
        />

        <label htmlFor="area">Área</label>
        <select
          id="area" name="area" value={form.area}
          onChange={(e) => setForm({ ...form, area: e.target.value })}
          required
        >
          <option value="">Selecione a área</option>
          <option value="Saúde">Saúde</option>
          <option value="Tecnologia">Tecnologia</option>
          <option value="Engenharia">Engenharia</option>
          <option value="Ciências Humanas e Sociais">Ciências Humanas e Sociais</option>
          <option value="Gestão e Negócios">Gestão e Negócios</option>
          <option value="Artes e Design">Artes e Design</option>
        </select>

        <div className="form-group">
          <button
            type="button" className="beneficios-toggle-btn"
            onClick={() => setMostrarBeneficios(!mostrarBeneficios)}
          >
            {mostrarBeneficios ? "Ocultar Benefícios" : "Adicionar Benefícios"}
          </button>
        </div>

        {mostrarBeneficios && (
          <div className="beneficios-container">
            <div className="beneficios-box">
              {form.beneficios.map((b) => (
                <div
                  key={b}
                  className={`beneficio-tag fade-in ${removendo.includes(b) ? "fade-out" : ""
                    }`}
                  style={{ animationDuration: "0.3s" }}
                >
                  {b}
                  <span className="remove-tag" onClick={() => handleRemoveBeneficio(b)}>
                    ✕
                  </span>
                </div>
              ))}
              <input
                type="text" placeholder="Digite um benefício..."
                value={novoBeneficio} onChange={(e) => setNovoBeneficio(e.target.value)}
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
                  type="button" key={b} className="btn-beneficio-pre fade-in"
                  onClick={() => handleAddBeneficio(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}

        <label htmlFor="salario">Salário</label>
        <input
          id="salario" type="number" name="salario" placeholder="Ex: 3500.00"
          step="0.01" value={form.salario}
          onChange={(e) => setForm({ ...form, salario: e.target.value })}
          required
        />

        <label htmlFor="escala">Escala de trabalho</label>
        <input
          id="escala" type="text" name="escala" placeholder="Ex: 6x1, 5x2, 12x36..."
          value={form.escala}
          onChange={(e) => setForm({ ...form, escala: e.target.value })}
          required
        />

        <div className="form-row">
          <div>
            <label htmlFor="dataInicial">Data de Abertura</label>
            <input
              id="dataInicial" type="date" name="dataInicial"
              value={form.dataInicial}
              onChange={(e) =>
                setForm({ ...form, dataInicial: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label htmlFor="dataLimite">Data de Fechamento</label>
            <input
              id="dataLimite" type="date" name="dataLimite"
              value={form.dataLimite}
              onChange={(e) => setForm({ ...form, dataLimite: e.target.value })}
              required
            />
          </div>
        </div>

        <label htmlFor="descricao">Descrição da vaga</label>
        <textarea
          id="descricao" name="descricao"
          placeholder="Descreva as responsabilidades, requisitos e diferenciais..."
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          rows="5"
          required
        />

        <div className="form-actions">
          <button type="submit" className="btn-cadastroVaga">
            Cadastrar
          </button>
          <button>
            type="button"
            onClick={handleCancel}
            className="btn-cancel"
          </button>
          <button type="submit" className="btn-cadastroVaga">Cadastrar</button>
          <button
            style={{ backgroundColor: "red" }}
            type="button" onClick={handleCancel} className="btn-cancel"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}