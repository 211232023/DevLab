import React, { useState, useRef } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import "./Cadastro.css"; // Certifique-se que o CSS atualizado está sendo importado
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
  const [codigoVerificacao, setCodigoVerificacao] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const pendingFormData = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
    setError('');
    setSuccess('');
  };

  const handleCodigoChange = (e) => {
    setCodigoVerificacao(e.target.value);
    setCodeError('');
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCodeError('');

    for (const key in form) {
      if (form[key] === "") {
        setError("Preencha todos os campos para se cadastrar!");
        return;
      }
    }

    if (form.senha !== form.confirmarSenha) {
      setError("As senhas não coincidem!");
      return;
    }

    setLoading(true);
    try {
      pendingFormData.current = { ...form };
      const response = await api.post("/usuarios/enviar-codigo", { email: form.email });
      setSuccess(response.data.message || 'Código de verificação enviado para o seu e-mail.');
      setShowCodeInput(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar o código de verificação. Verifique o e-mail e tente novamente.');
      console.error("Erro ao enviar código:", err);
      pendingFormData.current = null;
    } finally {
      setLoading(false);
    }
  };

  const handleCodigoSubmit = async () => {
    setCodeError('');
    if (!codigoVerificacao) {
      setCodeError('Por favor, insira o código recebido.');
      return;
    }
    if (!pendingFormData.current) {
        setCodeError('Ocorreu um erro. Por favor, tente o cadastro novamente desde o início.');
        setShowCodeInput(false);
        return;
    }

    setLoading(true);
    try {
      await api.post("/usuarios/validar-codigo", {
        email: pendingFormData.current.email,
        codigo: codigoVerificacao
      });

      try {
        const dadosParaCadastrar = {
            nome: pendingFormData.current.nomeCompleto,
            cpf: pendingFormData.current.cpf,
            email: pendingFormData.current.email,
            telefone: pendingFormData.current.telefone,
            genero: pendingFormData.current.genero,
            senha: pendingFormData.current.senha,
            tipo: pendingFormData.current.tipo,
        };
        const registerResponse = await api.post("/auth/register", dadosParaCadastrar);
        setSuccess(registerResponse.data.message || "Cadastro realizado com sucesso! Redirecionando...");
        setShowCodeInput(false);
        pendingFormData.current = null;
        setCodigoVerificacao('');
        setTimeout(() => navigate("/login"), 2000);
      } catch (registerError) {
          console.error("Erro na requisição de cadastro:", registerError);
          const specificError = registerError.response?.data?.error;
          setCodeError(specificError || "Não foi possível realizar o cadastro após a verificação. Tente novamente.");
      }
    } catch (validationErr) {
      setCodeError(validationErr.response?.data?.error || 'Código de verificação inválido ou expirado.');
      console.error("Erro ao validar código:", validationErr);
    } finally {
      setLoading(false);
    }
  };

  // Determina a classe do container principal para ajustar o tamanho
  const containerClassName = `cadastro-container ${showCodeInput ? 'code-input-active' : ''}`;

  return (
    <div className="cadastro-page-wrapper">
      {/* Aplica a classe condicional aqui */}
      <div className={containerClassName}>

        {/* Formulário Principal */}
        {!showCodeInput ? (
          <>
            <h2>Crie sua Conta</h2>
            {/* Mensagens Globais */}
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleInitialSubmit} className="cadastro-form">
              {/* --- Campos do Formulário (iguais aos anteriores) --- */}
              <div className="form-group">
                <label htmlFor="nomeCompleto">Nome Completo</label>
                <Input type="text" id="nomeCompleto" name="nomeCompleto" placeholder="Digite seu nome completo" value={form.nomeCompleto} onChange={handleChange} required disabled={loading}/>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cpf">CPF</label>
                  <Input type="text" id="cpf" name="cpf" placeholder="000.000.000-00" value={form.cpf} onChange={handleChange} required disabled={loading}/>
                </div>
                <div className="form-group">
                  <label htmlFor="telefone">Telefone</label>
                  <Input type="text" id="telefone" name="telefone" placeholder="(99) 99999-9999" value={form.telefone} onChange={handleChange} required disabled={loading}/>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <Input type="email" id="email" name="email" placeholder="Digite seu email" value={form.email} onChange={handleChange} required disabled={loading}/>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="genero">Gênero</label>
                  <select id="genero" name="genero" value={form.genero} onChange={handleChange} required className="input-select" disabled={loading}>
                    <option value="" disabled>Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                    <option value="Prefiro não informar">Prefiro não informar</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="tipo">Tipo de Conta</label>
                  <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange} required className="input-select" disabled={loading}>
                    <option value="Candidato">Candidato</option>
                    <option value="RH">Recursos Humanos</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="senha">Senha</label>
                  <Input type="password" id="senha" name="senha" placeholder="Crie uma senha" value={form.senha} onChange={handleChange} required disabled={loading}/>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmarSenha">Confirmar Senha</label>
                  <Input type="password" id="confirmarSenha" name="confirmarSenha" placeholder="Confirme sua senha" value={form.confirmarSenha} onChange={handleChange} required disabled={loading}/>
                </div>
              </div>

              <Button type="submit" className="cadastro-btn" disabled={loading}>
                {loading ? 'Enviando código...' : 'Cadastrar'}
              </Button>

              <Link to="/login" className="link-login">
                Já tem uma conta? Faça o login
              </Link>
            </form>
          </>
        ) : (
          /* Seção para Inserir o Código de Verificação */
          <div className="codigo-verification-section">
            <h3>Verifique seu E-mail</h3>
            <p>Enviamos um código de verificação para <strong>{pendingFormData.current?.email}</strong>. Por favor, insira o código abaixo para concluir o cadastro.</p>

            {/* Mensagem de sucesso do envio ou erro da validação/cadastro */}
            {success && <p className="success-message">{success}</p>}
            {codeError && <p className="error-message">{codeError}</p>}

            <div className="form-group codigo-input-wrapper-centered">
              <label htmlFor="codigoVerificacao">Código de Verificação</label>
              <Input
                type="text"
                id="codigoVerificacao"
                name="codigoVerificacao"
                placeholder="Código de 6 dígitos"
                value={codigoVerificacao}
                onChange={handleCodigoChange}
                maxLength="6"
                required
                disabled={loading}
                className="codigo-input-style" // Adiciona classe para estilo específico
              />
            </div>

            {/* Botão principal (verde) */}
            <Button type="button" onClick={handleCodigoSubmit} className="cadastro-btn" disabled={loading || !codigoVerificacao}>
              {loading ? 'Verificando e cadastrando...' : 'Confirmar Código e Cadastrar'}
            </Button>

             {/* Botão secundário (estilo link) */}
             <button
                type="button"
                onClick={() => { setShowCodeInput(false); setError(''); setSuccess(''); setCodeError(''); pendingFormData.current = null; setCodigoVerificacao(''); }}
                className="cancel-link-btn" // Nova classe para estilo de link
                disabled={loading}
             >
                Cancelar ou corrigir e-mail
             </button>

            {/* Opcional: Reenviar código */}
            {/* <Button type="button" onClick={handleInitialSubmit} className="secondary-btn" disabled={loading}>Reenviar Código</Button> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cadastro;