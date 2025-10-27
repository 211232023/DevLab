import React, { useState, useRef } from "react"; // useRef para guardar os dados temporariamente
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
  const [showCodeInput, setShowCodeInput] = useState(false); // Controla a exibição do campo de código
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Erro geral ou do envio de código
  const [codeError, setCodeError] = useState(''); // Erro específico da validação do código/cadastro final
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Guarda os dados do formulário enquanto aguarda o código
  const pendingFormData = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
    setError(''); // Limpa erros ao digitar
    setSuccess('');
  };

  const handleCodigoChange = (e) => {
    setCodigoVerificacao(e.target.value);
    setCodeError(''); // Limpa erro do código ao digitar
  };

  // 1. Função chamada ao clicar em "Cadastrar" inicialmente
  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCodeError('');

    // Validação inicial
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
      // Guarda os dados atuais para usar após a validação do código
      pendingFormData.current = { ...form };

      // Chama o backend para ENVIAR o código
      const response = await api.post("/usuarios/enviar-codigo", { email: form.email });
      setSuccess(response.data.message || 'Código de verificação enviado para o seu e-mail.');
      setShowCodeInput(true); // Mostra o campo para inserir o código
      setError(''); // Limpa erro geral se houver

    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar o código de verificação. Verifique o e-mail e tente novamente.');
      console.error("Erro ao enviar código:", err);
      pendingFormData.current = null; // Limpa dados pendentes em caso de erro
    } finally {
      setLoading(false);
    }
  };

  // 2. Função chamada ao confirmar o código de verificação
  const handleCodigoSubmit = async () => {
    setCodeError('');
    if (!codigoVerificacao) {
      setCodeError('Por favor, insira o código recebido.');
      return;
    }
    if (!pendingFormData.current) {
        setCodeError('Ocorreu um erro. Por favor, tente o cadastro novamente desde o início.');
        setShowCodeInput(false); // Esconde a seção do código
        return;
    }

    setLoading(true);
    try {
      // Primeiro, VALIDA o código no backend
      await api.post("/usuarios/validar-codigo", {
        email: pendingFormData.current.email,
        codigo: codigoVerificacao
      });

      // Se a validação do código foi bem-sucedida, PROSSEGUE COM O CADASTRO
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

        // Cadastro final bem-sucedido
        setSuccess(registerResponse.data.message || "Cadastro realizado com sucesso! Redirecionando...");
        setShowCodeInput(false); // Esconde a seção do código
        pendingFormData.current = null; // Limpa dados pendentes
        setCodigoVerificacao(''); // Limpa código
        setTimeout(() => navigate("/login"), 2000); // Redireciona

      } catch (registerError) {
           // Erro durante o CADASTRO (após validação do código)
          console.error("Erro na requisição de cadastro:", registerError);
          // Tenta pegar a mensagem de erro específica (ex: email/cpf já existe)
          const specificError = registerError.response?.data?.error;
          setCodeError(specificError || "Não foi possível realizar o cadastro após a verificação. Tente novamente.");
          // Neste ponto, o usuário pode precisar reiniciar o processo ou tentar o código de novo?
          // Depende da sua regra de negócio. Aqui, vamos manter a tela de código aberta com o erro.
          // Poderia também resetar: setShowCodeInput(false); pendingFormData.current = null; setError(specificError || "...");
      }

    } catch (validationErr) {
       // Erro na VALIDAÇÃO do código
      setCodeError(validationErr.response?.data?.error || 'Código de verificação inválido ou expirado.');
      console.error("Erro ao validar código:", validationErr);
      // Mantém a seção do código visível para nova tentativa
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="cadastro-page-wrapper">
      <div className="cadastro-container">
        <h2>Crie sua Conta</h2>

        {/* Mensagens Globais */}
        {error && !showCodeInput && <p className="error-message">{error}</p>}
        {success && !showCodeInput && <p className="success-message">{success}</p>}

        {/* Formulário Principal */}
        {!showCodeInput ? (
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
        ) : (
          /* Seção para Inserir o Código de Verificação */
          <div className="codigo-verification-section">
            <h3>Verifique seu E-mail</h3>
            <p>Enviamos um código de verificação para <strong>{pendingFormData.current?.email}</strong>. Por favor, insira o código abaixo para concluir o cadastro.</p>

            {/* Mensagem de sucesso do envio ou erro da validação/cadastro */}
            {success && <p className="success-message">{success}</p>}
            {codeError && <p className="error-message">{codeError}</p>}

            <div className="form-group codigo-input-wrapper-centered"> {/* Nova classe para centralizar */}
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
                style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.2rem' }} // Estilo inline para exemplo
              />
            </div>

            <Button type="button" onClick={handleCodigoSubmit} className="cadastro-btn" disabled={loading || !codigoVerificacao}>
              {loading ? 'Verificando e cadastrando...' : 'Confirmar Código e Cadastrar'}
            </Button>

             {/* Opção para voltar/cancelar */}
             <Button
                type="button"
                onClick={() => { setShowCodeInput(false); setError(''); setSuccess(''); setCodeError(''); pendingFormData.current = null; setCodigoVerificacao(''); }}
                className="cancel-btn" // Estilize este botão como secundário
                disabled={loading}
             >
                Cancelar
             </Button>

            {/* Opcional: Reenviar código (requer lógica adicional) */}
            {/* <Button type="button" onClick={handleInitialSubmit} disabled={loading}>Reenviar Código</Button> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cadastro;