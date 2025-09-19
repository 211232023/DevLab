import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ManualEmpresa.css";

const ManualEmpresa = () => {
    const navigate = useNavigate();
    const { candidaturaId } = useParams();

    const handleEtapa = () => {
        navigate(`/etapas/${candidaturaId}`);
    };
    return (
        <div className="manual-container">
            <h2>Manuais da empresa</h2>
            <br />
            <p className="intro-text">
                Bem-vindo à seção de manuais da empresa. Aqui você encontrará
                informações importantes sobre políticas, procedimentos e orientações para colaboradores.
                Consulte este espaço sempre que tiver dúvidas sobre as práticas internas da organização.
            </p>
            <br />
            <h3>Manual da empresa</h3>
            <a className="manual-link"
                href="MANUAL-DE-CONDUTA-E-ETICA-DO-COLABORADOR.pdf"
                target="_blank"
                rel="noopener noreferrer"
            >
                Manual de Conduta e Ética do Colaborador (PDF)
            </a>
            <br />
            <br />
            <label className="checkbox-label">
                <input type="checkbox" />
                Li e concordo com as políticas da empresa
            </label>

            <div className="button-group">
                <button onClick={handleEtapa} >Voltar para as etapas </button>
            </div>

        </div >
    );
};

export default ManualEmpresa;