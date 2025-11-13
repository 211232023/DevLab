// RH_Projetos/frontend/src/pages/candidatos/Login.jsx
import React, { useState } from "react"; // <-- Removido useEffect
import Input from "../../components/Input";
import Button from "../../components/Button";
import { Link, useNavigate } from "react-router-dom"; // <-- Removido useParams
import { useAuth } from "../../AuthContext";
import api from "../../api";
import "./Login.css"; // Importa os estilos

const Login = () => {
    // Estado para controlar a visualização: 'login', 'forgotPassword' ou 'resetPassword'
    const [view, setView] = useState('login');
    
    // Estados para o formulário de Login
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    
    // Estado para o formulário de Recuperação de Senha
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

    // --- ESTADOS ATUALIZADOS para Redefinir Senha ---
    const [codigoVerificacao, setCodigoVerificacao] = useState(""); // <-- ADICIONADO
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // ------------------------------------------

    // Estados compartilhados
    const [message, setMessage] = useState(""); // Para mensagens de erro e sucesso
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    
    // --- REMOVIDO: Bloco de useEffect e useParams que verificava o token na URL ---

    /**
     * Lida com o submit do formulário de login.
     */
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        if (email === "" || senha === "") {
            setMessage("Preencha todos os campos para entrar!");
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post("/auth/login", { email, senha });
            const data = response.data;

            if (response.status === 200) {
                login(data.user, data.token);
                if (data.user.tipo === 'Candidato') {
                    navigate("/inicio");
                } else if (data.user.tipo === 'RH') {
                    navigate("/gestao-vaga");
                } else {
                    navigate("/inicio");
                }
            } else {
                setMessage(data.message || data.error || "Erro ao fazer login.");
            }
        } catch (error) {
            console.error("Erro na requisição de login:", error);
            setMessage(
                error.response?.data?.message || error.response?.data?.error || "Não foi possível conectar ao servidor."
            );
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Lida com o submit do formulário de solicitação de recuperação de senha.
     * (PASSO 1: Enviar código)
     */
    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        if (forgotPasswordEmail === "") {
            setMessage("Por favor, digite seu e-mail.");
            return;
        }

        setIsLoading(true);
        try {
            // ATENÇÃO: A rota foi alterada para refletir a nova ação de enviar código
            await api.post('/auth/forgot-password-send-code', { email: forgotPasswordEmail });
            
            // ATUALIZADO: Muda de view em vez de só mostrar a mensagem
            setMessage("Código de verificação enviado para o seu e-mail.");
            setView('resetPassword'); // Manda o usuário para a tela de inserir o código e a nova senha
            
        } catch (error) {
            console.error("Erro ao solicitar recuperação de senha:", error);
            setMessage(
                error.response?.data?.message || "Não foi possível processar sua solicitação."
            );
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Lida com o submit do formulário de redefinição de senha.
     * (PASSO 2: Verificar código e Redefinir)
     */
    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // ATUALIZADO: Verifica o código também
        if (!codigoVerificacao || !newPassword || !confirmPassword) {
            setMessage('Por favor, preencha todos os campos (código, nova senha e confirmação).');
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage('As senhas não coincidem.');
            return;
        }

        setIsLoading(true);
        try {
            // ATUALIZADO: Envia email, código e nova senha.
            // ATENÇÃO: A rota foi alterada para refletir a nova ação com código
            const response = await api.post(`/auth/reset-password-with-code`, {
                email: forgotPasswordEmail, // Email digitado no passo anterior
                codigo: codigoVerificacao,
                password: newPassword
            });

            setMessage(response.data.message + " Redirecionando para o login em 3 segundos...");

            setTimeout(() => {
                navigate('/login');
                // Limpa os estados por segurança ao voltar para o login
                setView('login');
                setForgotPasswordEmail('');
                setCodigoVerificacao('');
                setNewPassword('');
                setConfirmPassword('');
                setMessage(''); // Limpa a mensagem de sucesso
            }, 3000);

        } catch (error) {
            console.error("Erro ao redefinir senha:", error);
            setMessage(
                // Mensagem atualizada
                error.response?.data?.message || 'Erro ao processar sua solicitação. O código pode estar inválido ou ter expirado.'
            );
        } finally {
            setIsLoading(false);
        }
    };
    // ------------------------------------------------------------------------

    /**
     * Renderiza a área de mensagens (erro ou sucesso).
     */
    const renderMessage = () => {
        if (!message) return null;
        
        const lowerCaseMessage = message.toLowerCase();

        // Lógica de detecção de erro (mantida)
        const isError = lowerCaseMessage.includes("preencha") || 
                        lowerCaseMessage.includes("erro") || 
                        lowerCaseMessage.includes("não foi") ||
                        lowerCaseMessage.includes("por favor") ||
                        lowerCaseMessage.includes("não foi possível") ||
                        lowerCaseMessage.includes("inválidos") ||
                        lowerCaseMessage.includes("inválido") ||
                        lowerCaseMessage.includes("inválidas") ||
                        lowerCaseMessage.includes("não encontrado") ||
                        lowerCaseMessage.includes("expirado") ||
                        lowerCaseMessage.includes("coincidem");
        
        const messageClass = isError 
            ? "message-area error-message" 
            : "message-area success-message";
        
        return (
            <div className={messageClass}>
                {message}
            </div>
        );
    };

    /**
     * Renderiza o formulário de Login. (Sem alterações)
     */
    const renderLoginView = () => (
        <form onSubmit={handleLoginSubmit}>
            <h2>Faça o login!</h2>
            {renderMessage()}
            <div className="form-group">
                <label htmlFor="email">Email:</label>
                <Input
                    type="email"
                    id="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>
            <div className="form-group">
                <label htmlFor="senha">Senha:</label>
                <Input
                    type="password"
                    id="senha"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>
            
            <div className="forgot-password-link-container">
                <span
                    className="forgot-password-link"
                    onClick={() => {
                        setView('forgotPassword');
                        setMessage('');
                    }}
                >
                    Esqueceu a Senha?
                </span>
            </div>

            <Button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
            </Button>
            <Link to="/cadastro" className="link-cadastro">
                Não tem uma conta? Cadastre-se
            </Link>
        </form>
    );

    /**
     * Renderiza o formulário de Recuperação de Senha (Passo 1: Inserir E-mail).
     */
    const renderForgotPasswordView = () => (
        <form onSubmit={handleForgotPasswordSubmit}>
            <h2>Recuperar Senha</h2>
            <p className="forgot-password-instructions">
                {/* Texto atualizado */}
                Digite o e-mail associado à sua conta e enviaremos um código de verificação.
            </p>
            {renderMessage()}
            <div className="form-group">
                <label htmlFor="forgot-email">Email:</label>
                <Input
                    type="email"
                    id="forgot-email"
                    placeholder="Digite seu email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>
            <Button type="submit" className="login-btn" disabled={isLoading}>
                 {/* Texto atualizado */}
                {isLoading ? "Enviando..." : "Enviar Código"}
            </Button>
            
            <span
                className="back-to-login-link"
                onClick={() => {
                    setView('login');
                    setMessage('');
                }}
            >
                Voltar para Login
            </span>
        </form>
    );

    /**
     * Renderiza o formulário de Redefinição de Senha (Passo 2: Inserir Código + Nova Senha).
     */
    const renderResetPasswordView = () => (
        <form onSubmit={handleResetPasswordSubmit}>
            <h2>Redefinir Senha</h2>
            <p className="forgot-password-instructions">
                 {/* Texto atualizado para incluir o e-mail */}
                Verifique seu e-mail (<strong>{forgotPasswordEmail}</strong>) e insira o código recebido.
            </p>
            {renderMessage()}
            
            {/* --- CAMPO DE CÓDIGO ADICIONADO --- */}
            <div className="form-group">
                <label htmlFor="codigoVerificacao">Código de Verificação:</label>
                <Input
                    type="text"
                    id="codigoVerificacao"
                    placeholder="Código de 6 dígitos"
                    value={codigoVerificacao}
                    onChange={(e) => setCodigoVerificacao(e.target.value)}
                    maxLength="6"
                    required
                    disabled={isLoading}
                />
            </div>
            {/* --- FIM DA ADIÇÃO --- */}

            <div className="form-group">
                <label htmlFor="newPassword">Nova Senha:</label>
                <Input
                    type="password"
                    id="newPassword"
                    placeholder="Digite sua nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>
            <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Nova Senha:</label>
                <Input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>
            
            <Button type="submit" className="login-btn" disabled={isLoading}>
                 {/* Texto atualizado */}
                {isLoading ? 'Salvando...' : 'Verificar e Salvar'}
            </Button>

            {/* --- LINK DE CANCELAR ADICIONADO --- */}
            <span
                className="back-to-login-link"
                onClick={() => {
                    setView('login');
                    setMessage('');
                    setForgotPasswordEmail(''); // Limpa o email
                    setCodigoVerificacao('');
                    setNewPassword('');
                    setConfirmPassword('');
                }}
            >
                Cancelar e Voltar para Login
            </span>
            {/* --- FIM DA ADIÇÃO --- */}
        </form>
    );
    // --------------------------------------------------------------------

    return (
        <div className="login-page-wrapper">
            <div className="login-container">
                {/* Lógica de renderização mantida */}
                {view === 'login' && renderLoginView()}
                {view === 'forgotPassword' && renderForgotPasswordView()}
                {view === 'resetPassword' && renderResetPasswordView()}
            </div>
        </div>
    );
};

export default Login;