import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../AuthContext";
import "./CadastroVaga.css";
import Button from "../../components/Button";

export default function CadastroVaga() {
  const { user } = useAuth();

  const estadoInicialForm = {
    nome: "",
    area: "",
    beneficios: [],
    salario: "",
    escala: "",
    dataInicial: "",
    dataLimite: "",
    descricao: "",
  };

  const [form, setForm] = useState(estadoInicialForm);
  const [novoBeneficio, setNovoBeneficio] = useState("");
  const [removendo, setRemovendo] = useState([]);
  const [mostrarBeneficios, setMostrarBeneficios] = useState(false);

  // --- NOVOS ESTADOS PARA CONTROLE DE FEEDBACK ---
  const [isLoading, setIsLoading] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const todosBeneficiosPreDefinidos = [
    "Vale-refeição", "Vale-transporte", "Plano de saúde", "Seguro de vida",
    "Home office", "Auxílio creche", "Bônus anual", "Participação nos lucros",
    "Estacionamento", "Assistência odontológica",
  ];

  const beneficiosPreDefinidos = todosBeneficiosPreDefinidos.filter(
    (b) => !form.beneficios.includes(b)
  );
  
  // --- NOVA FUNÇÃO PARA LIDAR COM MUDANÇAS NOS INPUTS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };


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

  // --- FUNÇÃO DE SUBMISSÃO ATUALIZADA ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Bloqueia o botão
    setMensagemSucesso(""); // Limpa mensagem anterior

    if (!user || !user.id) {
      alert("Erro de autenticação. Por favor, faça o login novamente.");
      setIsLoading(false); // Libera o botão
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
      const response = await axios.post("http://localhost:3001/api/vagas", vagaDataParaAPI);

      console.log("Vaga cadastrada:", response.data);
      setMensagemSucesso("Vaga cadastrada com sucesso!"); // Define a mensagem de sucesso

      // Reseta o formulário para o estado inicial
      setForm(estadoInicialForm);
      setMostrarBeneficios(false);

    } catch (error) {
      console.error("Erro ao cadastrar vaga:", error.response ? error.response.data : error.message);
      alert("Falha ao cadastrar a vaga. Verifique o console para detalhes.");
    } finally {
      setIsLoading(false); // Libera o botão, independente de sucesso ou falha
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="cadastro-vaga-container">
      <h2>Cadastro da Vaga</h2>

      {/* Exibe a mensagem de sucesso quando ela existir */}
      {mensagemSucesso && (
        <div className="mensagem-sucesso">{mensagemSucesso}</div>
      )}

      <form onSubmit={handleSubmit} className="form-vaga">
        <label htmlFor="nome">Nome da vaga</label>
        <input
          id="nome" type="text" name="nome" placeholder="Ex: Desenvolvedor Frontend"
          value={form.nome} onChange={handleChange}
          required
        />

        <label htmlFor="area">Área</label>
        <select
          id="area" name="area" value={form.area}
          onChange={handleChange}
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
                  className={`beneficio-tag fade-in ${removendo.includes(b) ? "fade-out" : ""}`}
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
          onChange={handleChange}
          required
        />

        <label htmlFor="escala">Escala de trabalho</label>
        <input
          id="escala" type="text" name="escala" placeholder="Ex: 6x1, 5x2, 12x36..."
          value={form.escala}
          onChange={handleChange}
          required
        />

        <div className="form-row">
          <div>
            <label htmlFor="dataInicial">Data de Abertura</label>
            <input
              id="dataInicial" type="date" name="dataInicial"
              value={form.dataInicial}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="dataLimite">Data de Fechamento</label>
            <input
              id="dataLimite" type="date" name="dataLimite"
              value={form.dataLimite}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <label htmlFor="descricao">Descrição da vaga</label>
        <textarea
          id="descricao" name="descricao"
          placeholder="Descreva as responsabilidades, requisitos e diferenciais..."
          value={form.descricao}
          onChange={handleChange}
          rows="5"
          required
        />

        <div className="form-actions">
          {/* Botão atualizado para mostrar estado de loading */}
          <Button type="submit" className="btn-cadastroVaga" disabled={isLoading}>
            {isLoading ? "Cadastrando..." : "Cadastrar"}
          </Button>
          <Button style={{backgroundColor:"#B22222"}}
            type="button" onClick={handleCancel} className="btn-cancel"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}