import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// Telas Candidatos
import Cadastro from "../pages/candidatos/Cadastro";
import Etapas from "../pages/candidatos/Etapas";
import InscricaoVaga from "../pages/candidatos/InscricaoVaga";
import Login from "../pages/candidatos/Login";
import MinhasCandidaturas from "../pages/candidatos/MinhasCandidaturas";
import TelaInicial from "../pages/candidatos/TelaInicial";
import Teste from "../pages/candidatos/Teste";
import Perfil from "../pages/candidatos/Perfil";

// Telas Rh
import CadastroVaga from "../pages/rh/CadastroVaga";
import DetalheVaga from "../pages/rh/DetalheVaga";
import GestaoVaga from "../pages/rh/GestaoVaga";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                {/* Candidato */}
                <Route path="/" element={<Navigate to="/inicio
                " />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/login" element={<Login />} />
                <Route path="/inicio" element={<TelaInicial />} />
                <Route path="/inscricao/:vagaId" element={<InscricaoVaga />} />
                <Route path="/minhas-candidaturas" element={<MinhasCandidaturas />} />
                <Route path="/etapas/:vagaId" element={<Etapas />} />
                <Route path="/teste" element={<Teste />} />
                <Route path="/perfil" element={<Perfil />} />

                {/* RH */}
                <Route path="/cadastro-vaga" element={<CadastroVaga />} />
                <Route path="/vaga/:id" element={<DetalheVaga />} />
                <Route path="/candidato/:id" element={<GestaoVaga />} />
            </Routes>
        </BrowserRouter>
    );
}
