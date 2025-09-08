import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Cadastro from "./pages/candidatos/Cadastro"; // Página de Cadastro
import TelaInicial from "./pages/candidatos/TelaInicial"; // Página Home
import MinhasCandidaturas from "./pages/candidatos/MinhasCandidaturas"; // Página Minhas Vagas
import Login from "./pages/candidatos/Login"; // Página Login

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Navigate to="/cadastro" />} /> {/* Redireciona para Cadastro */}
                <Route path="/TelaInicial" element={<TelaInicial />} />
                <Route path="/minhas-candidaturas" element={<MinhasCandidaturas />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
            </Routes>
        </Router>
    );
};

export default App;
