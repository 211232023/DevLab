import React, { useState, useRef } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import "./Cadastro.css"; 
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import InputMask from "react-input-mask"; 

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
    setSuccess(''); 
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCodeError('');

    // Validações
    for (const key in form) {
      if (form[key] === "") {
        setError("Preencha todos os campos para se cadastrar!");
        return;
      }
    }
    if (form.nomeCompleto.trim().split(' ').length < 2) {
      setError("Por favor, digite seu nome completo (nome e sobrenome).");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Por favor, insira um formato de e-mail válido.");
      return;
    }
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(form.cpf)) {
      setError("O CPF deve estar no formato 000.000.000-00.");
      return;
    }
    const telefoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    if (!telefoneRegex.test(form.telefone)) {
      setError("O telefone deve estar no formato (99) 99999-9999.");
      return;
    }
    if (form.senha.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      setError("As senhas não coincidem!");
      return;
    }

    // Envio
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

  const containerClassName = `cadastro-container ${showCodeInput ? 'code-input-active' : ''}`;

  return (
    <div className="cadastro-page-wrapper">
      <div className={containerClassName}>

        {!showCodeInput ? (
          <>
            <h2>Crie sua Conta</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleInitialSubmit} className="cadastro-form">
              <div className="form-group">
                <label htmlFor="nomeCompleto">Nome Completo</label>
                <Input type="text" id="nomeCompleto" name="nomeCompleto" placeholder="Digite seu nome completo" value={form.nomeCompleto} onChange={handleChange} required disabled={loading}/>
              </div>
              <div className="form-row">
                
                {/* --- INÍCIO DA CORREÇÃO --- */}
                {/* A prop 'disabled' foi MOVIDA daqui... */}
                <div className="form-group">
                  <label htmlFor="cpf">CPF</label>
                  <InputMask
                    mask="999.999.999-99"
                    value={form.cpf}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <Input
                        {...inputProps}
                        type="text"
                        id="cpf"
                        name="cpf"
                        placeholder="000.000.000-00"
                        required
                        disabled={loading} // <-- ...para CÁ
                      />
                    )}
                  </InputMask>
                </div>
                
                <div className="form-group">
                  <label htmlFor="telefone">Telefone</label>
                  <InputMask
                    mask="(99) 99999-9999"
                    value={form.telefone}
                    onChange={handleChange}
                  >
                    {(inputProps) => (
                      <Input
                        {...inputProps}
                        type="text"
                        id="telefone"
                        name="telefone"
                        placeholder="(99) 99999-9999"
                        required
                        disabled={loading} // <-- ...para CÁ
                      />
                    )}
                  </InputMask>
                </div>
                {/* --- FIM DA CORREÇÃO --- */}

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
                  <Input type="password" id="senha" name="senha" placeholder="Mínimo 8 caracteres" value={form.senha} onChange={handleChange} required disabled={loading}/>
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
                className="codigo-input-style" 
              />
            </div>

            <Button type="button" onClick={handleCodigoSubmit} className="cadastro-btn" disabled={loading || !codigoVerificacao}>
              {loading ? 'Verificando e cadastrando...' : 'Confirmar Código e Cadastrar'}
            </Button>

             <button
                type="button"
                onClick={() => { setShowCodeInput(false); setError(''); setSuccess(''); setCodeError(''); pendingFormData.current = null; setCodigoVerificacao(''); }}
                className="cancel-link-btn"
                disabled={loading}
             >
                Cancelar ou corrigir e-mail
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cadastro;