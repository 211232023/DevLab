import React, { useState } from "react";
import "./Login.css";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { Link } from "react-router-dom"; 

const Login = () => {
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const handleMostrarSenha = () => {
        setMostrarSenha(!mostrarSenha);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("CPF:", cpf);
        console.log("Senha:", senha);
        // Adicione aqui a lógica de autenticação
        if (cpf === "" && senha === "") {
            alert("Insira um CPF e uma senha válidos");
        } // Exemplo simples de validação 
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="cpf">CPF:</label>
                    <Input
                        type="text"
                        id="cpf"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        placeholder="Digite seu CPF"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="senha">Senha:</label>
                        <Input
                            type={"password"}
                            id="senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Digite sua senha"
                            required
                        />
                </div>
                <div className="form-group">
                    <Link to="/cadastro" id="linkLogin">Não tem uma conta? Clique aqui</Link>
                </div>
                <Button type="submit" className="login-btn">Entrar</Button>
            </form>
        </div>
    );
};

export default Login;