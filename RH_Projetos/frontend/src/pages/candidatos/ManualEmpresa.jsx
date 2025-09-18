import React from "react";
import "./ManualEmpresa.css";

const ManualEmpresa = () => {
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
                <button>Concluir etapa</button>
                <button>Voltar</button>
            </div>

        </div>
    );
};

export default ManualEmpresa;