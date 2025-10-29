import React, { useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import api from "../../api";
import "./Login.css"; // Importa os estilos

const Login = () => {
    // Estado para controlar a visualização: 'login' ou 'forgotPassword'
    const [view, setView] = useState('login'); 
    
    // Estados para o formulário de Login
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    
    // Estado para o formulário de Recuperação de Senha
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

    // Estados compartilhados
    const [message, setMessage] = useState(""); // Para mensagens de erro e sucesso
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    /**
     * Lida com o submit do formulário de login.
     */
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setMessage(""); // Limpa mensagens anteriores
        if (email === "" || senha === "") {
            setMessage("Preencha todos os campos para entrar!");
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post("/auth/login", { email, senha });
            const data = response.data;

            if (response.status === 200) {
                login(data.user, data.token); // Armazena usuário e token

                // Redireciona com base no tipo de usuário
                if (data.user.tipo === 'Candidato') {
                    navigate("/inicio");
                } else if (data.user.tipo === 'RH') {
                    navigate("/gestao-vaga");
                } else {
                    navigate("/inicio"); // Navegação padrão
                }
            } else {
                // Exibe erro vindo da API
                setMessage(data.error || "Erro ao fazer login.");
            }
        } catch (error) {
            console.error("Erro na requisição de login:", error);
            setMessage(
                error.response?.data?.error || "Não foi possível conectar ao servidor."
            );
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Lida com o submit do formulário de recuperação de senha.
     * (Apenas frontend por enquanto)
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
            // --- LÓGICA DO BACKEND (A SER IMPLEMENTADA) ---
            // Aqui você chamaria sua API, ex:
            // await api.post('/auth/forgot-password', { email: forgotPasswordEmail });
            
            console.log('Solicitação de recuperação de senha para:', forgotPasswordEmail);
            
            // Simula uma pequena espera (remover ao implementar API real)
            await new Promise(resolve => setTimeout(resolve, 1000)); 

            // Exibe mensagem de sucesso
            setMessage("Se o e-mail estiver cadastrado em nosso sistema, você receberá um link para redefinir sua senha em breve.");
            setForgotPasswordEmail(""); // Limpa o campo
            
        } catch (error) {
            console.error("Erro ao solicitar recuperação de senha:", error);
            // Ajuste a mensagem de erro conforme o retorno da sua API
            setMessage(
                error.response?.data?.error || "Não foi possível processar sua solicitação."
            );
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Renderiza a área de mensagens (erro ou sucesso).
     */
    const renderMessage = () => {
        if (!message) return null;
        
        // Determina se a mensagem é de erro (vermelho) ou sucesso (verde)
        const isError = message.includes("Preencha") || 
                        message.includes("Erro") || 
                        message.includes("Não foi") ||
                        message.includes("Por favor") ||
                        message.includes("Não foi possível");
        
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
            
            {/* Link de "Esqueceu a Senha?" */}
            <div className="forgot-password-link-container">
                <span 
                    className="forgot-password-link" 
                    onClick={() => {
                        setView('forgotPassword');
                        setMessage(''); // Limpa mensagens ao trocar de view
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
            
            {/* Link para Voltar */}
            <span 
                className="back-to-login-link" 
                onClick={() => {
                    setView('login');
                    setMessage(''); // Limpa mensagens ao trocar de view
                }}
            >
                Voltar para Login
            </span>
        </form>
    );

    return (
        <div className="login-page-wrapper">
            <div className="login-container">
                {/* Renderiza a view correta com base no estado 'view' */}
                {view === 'login' ? renderLoginView() : renderForgotPasswordView()}
            </div>
        </div>
    );
};

export default Login;