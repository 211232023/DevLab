import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../AuthContext';
import { Link } from 'react-router-dom';
import './GestaoSistema.css';
import Button from '../../components/Button';
import { FaUsers, FaChevronDown, FaTrash, FaExclamationCircle } from 'react-icons/fa';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-backdrop">
            <div className="confirm-modal-content">
                <FaExclamationCircle className="confirm-modal-icon" />
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirm-modal-actions">
                    <Button onClick={onClose} className="btn-cancel">Cancelar</Button>
                    <Button onClick={onConfirm} className="btn-confirm-delete">Confirmar</Button>
                </div>
            </div>
        </div>
    );
};


const GestaoSistema = () => {
    const { user } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedUser, setExpandedUser] = useState(null);
    
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const handleDeletarUsuario = (usuarioId) => {
        const usuario = usuarios.find(u => u.id === usuarioId);
        
        setModalState({
            isOpen: true,
            title: 'Deletar Usuário',
            message: `Tem certeza que deseja deletar o usuário ${usuario.nome}? Esta ação não pode ser desfeita.`,
            onConfirm: () => executeDeletarUsuario(usuarioId)
        });
    };

    const executeDeletarUsuario = async (usuarioId) => {
        try {
            await api.delete(`/usuarios/${usuarioId}`);
            setUsuarios(usuariosAtuais => usuariosAtuais.filter(u => u.id !== usuarioId));
            alert('Usuário deletado com sucesso!');
        } catch (err) {
            alert('Não foi possível deletar o usuário.');
        } finally {
            setModalState({ isOpen: false });
        }
    };
    
    useEffect(() => {
        const carregarTodosOsUsuarios = async () => {
            if (user && user.tipo === 'ADMIN') {
                setLoading(true);
                try {
                    const response = await api.get('/usuarios');
                    setUsuarios(response.data);
                } catch (err) {
                    setError('Não foi possível carregar as informações dos usuários.');
                } finally {
                    setLoading(false);
                }
            }
        };
        carregarTodosOsUsuarios();
    }, [user]);

    const toggleExpandir = (id) => setExpandedUser(expandedUser === id ? null : id);

    if (loading) return <div className="loading-container">Carregando usuários do sistema...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="gestao-page-wrapper">
             <ConfirmModal 
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false })}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
                message={modalState.message}
            />
            <header className="gestao-header">
                <h1>Gerenciamento de Usuários</h1>
                <p>Visualize e gerencie os usuários cadastrados no sistema.</p>
            </header>
            <main className="vagas-accordion">
                {usuarios.length === 0 ? (
                    <div className="nenhuma-vaga-gestao">
                        <h3>Nenhum usuário cadastrado.</h3>
                    </div>
                ) : (
                    usuarios.map((usuario) => (
                        <div key={usuario.id} className={`vaga-item ${expandedUser === usuario.id ? 'expanded' : ''}`}>
                            <div className="vaga-item-header" onClick={() => toggleExpandir(usuario.id)}>
                                <div className="vaga-info">
                                    <h2>{usuario.nome}</h2>
                                    <span className="candidatos-count"><FaUsers /> {usuario.tipo}</span>
                                </div>
                                <div className="vaga-actions">
                                    <button onClick={(e) => { e.stopPropagation(); handleDeletarUsuario(usuario.id); }} className="btn-delete-vaga"><FaTrash /> Deletar Usuário</button>
                                    <FaChevronDown className="expand-icon" />
                                </div>
                            </div>
                            <div className="candidatos-table-container">
                                <table className="candidatos-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nome</th>
                                            <th>CPF</th>
                                            <th>Email</th>
                                            <th>Telefone</th>
                                            <th>Data Cadastro</th>
                                            <th>Gênero</th>
                                            <th>Tipo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{usuario.id}</td>
                                            <td>{usuario.nome}</td>
                                            <td>{usuario.cpf}</td>
                                            <td>{usuario.email}</td>
                                            <td>{usuario.telefone}</td>
                                            <td>{new Date(usuario.data_cadastro).toLocaleDateString()}</td>
                                            <td>{usuario.genero}</td>
                                            <td>{usuario.tipo}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default GestaoSistema;