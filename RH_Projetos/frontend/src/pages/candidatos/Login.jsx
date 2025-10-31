// RH_Projetos/frontend/src/pages/candidatos/Login.jsx
import React, { useState, useEffect } from "react"; // <-- Importe useEffect
import Input from "../../components/Input";
import Button from "../../components/Button";
import { Link, useNavigate, useParams } from "react-router-dom"; // <-- Importe useParams
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

    // --- NOVOS ESTADOS para Redefinir Senha ---
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // ------------------------------------------

    // Estados compartilhados
    const [message, setMessage] = useState(""); // Para mensagens de erro e sucesso
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const { token } = useParams(); // <-- Pega o :token da URL

    // --- NOVO EFEITO para verificar o token na URL ---
    useEffect(() => {
        // Se um token estiver presente na URL, mude para a view de redefinição
        if (token) {
            setView('resetPassword');
        }
    }, [token]); // Executa sempre que o 'token' da URL mudar
    // -------------------------------------------------

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
            await api.post('/auth/forgot-password', { email: forgotPasswordEmail });
            
            setMessage("Se o e-mail estiver cadastrado em nosso sistema, você receberá um link para redefinir sua senha em breve.");
            setForgotPasswordEmail(""); 
            
        } catch (error) {
            console.error("Erro ao solicitar recuperação de senha:", error);
            setMessage(
                error.response?.data?.message || "Não foi possível processar sua solicitação."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // --- NOVA FUNÇÃO: Lida com o submit do formulário de redefinição de senha ---
    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!newPassword || !confirmPassword) {
            setMessage('Por favor, preencha as duas senhas.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage('As senhas não coincidem.');
            return;
        }

        setIsLoading(true);
        try {
            // Envia o token (da URL) e a nova senha
            const response = await api.post(`/auth/reset-password/${token}`, { 
                password: newPassword 
            });

            setMessage(response.data.message + " Redirecionando para o login em 3 segundos...");

            // Desabilita o botão e redireciona para o login após 3 segundos
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error) {
            console.error("Erro ao redefinir senha:", error);
            setMessage(
                error.response?.data?.message || 'Erro ao processar sua solicitação. O link pode ter expirado.'
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
        
        const isError = message.includes("Preencha") || 
                        message.includes("Erro") || 
                        message.includes("Não foi") ||
                        message.includes("Por favor") ||
                        message.includes("Não foi possível") ||
                        message.includes("inválidos") ||
                        message.includes("inválido") ||
                        message.includes("expirado") ||
                        message.includes("coincidem");
        
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
     * Renderiza o formulário de Login.
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
     * Renderiza o formulário de Recuperação de Senha.
     */
    const renderForgotPasswordView = () => (
        <form onSubmit={handleForgotPasswordSubmit}>
            <h2>Recuperar Senha</h2>
            <p className="forgot-password-instructions">
                Digite o e-mail associado à sua conta e enviaremos um link para redefinir sua senha.
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
                {isLoading ? "Enviando..." : "Enviar Link"}
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

    // --- NOVA FUNÇÃO: Renderiza o formulário de Redefinição de Senha ---
    const renderResetPasswordView = () => (
        <form onSubmit={handleResetPasswordSubmit}>
            <h2>Redefinir Senha</h2>
            <p className="forgot-password-instructions">
                Digite sua nova senha.
            </p>
            {renderMessage()}
            
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
                {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
            </Button>
        </form>
    );
    // --------------------------------------------------------------------

    return (
        <div className="login-page-wrapper">
            <div className="login-container">
                {/* --- LÓGICA DE RENDERIZAÇÃO ATUALIZADA --- */}
                {view === 'login' && renderLoginView()}
                {view === 'forgotPassword' && renderForgotPasswordView()}
                {view === 'resetPassword' && renderResetPasswordView()}
                {/* ------------------------------------------- */}
            </div>
        </div>
    );
};

export default Login;