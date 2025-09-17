import React, { useState } from "react";
import axios from "axios"; // Para fazer a requisição à API
import { useAuth } from "../../AuthContext"; // Para obter o ID do usuário de RH
import "./CadastroVaga.css";
import Button from "../../components/Button";
import Navbar from "../../components/Navbar"; // Adicionado para manter o layout da página

export default function CadastroVaga() {
  // Hook para obter informações do usuário logado
  const { user } = useAuth();

  // Estado do formulário, mantido como você definiu
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

  /**
   * Função executada ao submeter o formulário.
   * Ela monta o objeto de dados e o envia para o backend.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Valida se o usuário de RH está logado
    if (!user || !user.id) {
      alert("Usuário não autenticado. Por favor, faça login novamente.");
      return;
    }

    // Mapeia os dados do estado 'form' para o padrão da tabela do banco de dados
    const vagaDataParaAPI = {
      rh_id: user.id,
      titulo: form.nome,
      area: form.area,
      salario: parseFloat(form.salario),
      descricao: form.descricao,
      data_Abertura: form.dataInicial,
      data_fechamento: form.dataLimite,
      escala_trabalho: form.escala,
      // O backend espera uma string, então unimos o array de benefícios
      beneficios: form.beneficios.join(', '),
    };

    try {
      // Faz a requisição POST para a API
      const response = await axios.post("http://localhost:3001/vagas", vagaDataParaAPI);
      
      console.log("Vaga cadastrada com sucesso:", response.data);
      alert("Vaga cadastrada com sucesso!");
      
      // Limpa o formulário após o cadastro
      setForm({
        nome: "", area: "", beneficios: [], salario: "", escala: "",
        dataInicial: "", dataLimite: "", descricao: "",
      });
      setMostrarBeneficios(false);

    } catch (error) {
      console.error("Erro ao cadastrar vaga:", error.response ? error.response.data : error.message);
      alert("Falha ao cadastrar a vaga. Verifique os dados e tente novamente.");
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <>
      <Navbar />
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

          <label htmlFor="area">Área</label>
          <select
            id="area"
            name="area"
            value={form.area}
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
              type="button"
              className="beneficios-toggle-btn"
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
          )}

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

          <label htmlFor="escala">Escala de trabalho</label>
          <input
            id="escala"
            type="text"
            name="escala"
            placeholder="Ex: 6x1, 5x2, 12x36..."
            value={form.escala}
            onChange={(e) => setForm({ ...form, escala: e.target.value })}
            required
          />

          <div className="form-row">
            <div>
              <label htmlFor="dataInicial">Data de Abertura</label>
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
              <label htmlFor="dataLimite">Data de Fechamento</label>
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
            required
          />

          <div className="form-actions">
            <Button type="submit" className="btn-cadastroVaga">
              Cadastrar
            </Button>
            <Button
              style={{ backgroundColor: "red" }}
              type="button"
              onClick={handleCancel}
              className="btn-cancel"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}