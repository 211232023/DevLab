import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'; 
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-logo">
                    <img src="/logo2.png" alt="DevLab Logo" className="footer-logo-img" />
                </div>
                <div className="footer-info">
                    <p>Telefone: (99) 99999-9999</p>
                    <p>Endereço: Rua Exemplo, 123 - Cidade, UF</p>
                </div>
                <div className="footer-social">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-btn" aria-label="Facebook">
                        <FaFacebook />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-btn" aria-label="Twitter">
                        <FaTwitter />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-btn" aria-label="Instagram">
                        <FaInstagram />
                    </a>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} DevLab. Todos os direitos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;