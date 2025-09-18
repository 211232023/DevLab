import React from "react";
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-social">
                <button className="footer-btn" title="Facebook">
                    <img src="/face.png" alt="Facebook" className="footer-icon" />
                </button>
                <button className="footer-btn" title="X">
                    <img src="/x.png" alt="X" className="footer-icon" />
                </button>
                <button className="footer-btn" title="Instagram">
                    <img src="/insta.png" alt="Instagram" className="footer-icon" />
                </button>
            </div>
            <div className="footer-info">
                Telefone: (99) 99999-9999 | Endereço: Rua Exemplo, 123 - Cidade, UF
            </div>
            <div className="footer-logo">
                <img src="/logo2.png" alt="DevLab Logo" className="footer-logo-img" />
            </div>
        </footer>
    );
};

export default Footer;