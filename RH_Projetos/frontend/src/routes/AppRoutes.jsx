import{ BrowserRouter, Routes, Route} from "react-router-dom";


// Telas Candidatos
import Cadastro from "../pages/candidatos/Cadastro";
import Etapas from "../pages/candidatos/Etapas";
import InscricaoVaga from "../pages/candidatos/InscricaoVaga";
import Login from "../pages/candidatos/Login";
import MinhasCandidaturas from "../pages/candidatos/MinhasCandidaturas";
import TelaInicial from "../pages/candidatos/TelaInicial";
import Teste from "../pages/candidatos/Teste";

// Telas Rh
import CadastroVaga from "../pages/rh/CadastroVaga";
import DetalheVaga from "../pages/rh/DetalheVaga";
import GestaoVaga from "../pages/rh/GestaoVaga";

export default function AppRoutes() {
    return (
      <BrowserRouter>
        <Routes>
          {/* Candidato */}
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/inicio" element={<TelaInicial />} />
          <Route path="/inscricao/:vagaId" element={<InscricaoVaga />} />
          <Route path="/candidaturas" element={<MinhasCandidaturas />} />
          <Route path="/etapas/:vagaId" element={<Etapas />} />
          <Route path="/teste" element={<Teste />} />
  
          {/* RH */}
          <Route path="/rh/cadastro-vaga" element={<CadastroVaga />} />
          <Route path="/rh/vaga/:id" element={<DetalheVaga />} />
          <Route path="/rh/candidato/:id" element={<GestaoVaga />} />
        </Routes>
      </BrowserRouter>
    );
  }
  