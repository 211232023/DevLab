import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api';
import { useAuth } from '../../AuthContext';
import './GestaoSistema.css';
// import Button from '../../components/Button'; // Removido
import { FaUsers, FaTrash, FaExclamationCircle } from 'react-icons/fa';

// Modal de Confirmação (Atualizado para usar <button>)
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-backdrop">
            <div className="confirm-modal-content">
                <FaExclamationCircle className="confirm-modal-icon" />
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirm-modal-actions">
                    <button onClick={onClose} className="btn-cancel">Cancelar</button>
                    <button onClick={onConfirm} className="btn-confirm-delete">Confirmar</button>
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
    
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    // States para filtros e ordenação
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [sortOrder, setSortOrder] = useState('default');

    // Carregar usuários
    useEffect(() => {
        const fetchUsuarios = async () => {
            if (user && user.tipo === 'ADMIN') {
                setLoading(true);
                try {
                    const response = await api.get('/usuarios');
                    setUsuarios(response.data);
                } catch (err) {
                    setError('Não foi possível carregar os usuários.');
                    console.error("Erro ao buscar usuários:", err);
                } finally {
                    setLoading(false);
                }
            } else {
                setError('Acesso não autorizado.');
                setLoading(false);
            }
        };

        fetchUsuarios();
    }, [user]);

    // Lógica de filtragem e ordenação
    const filteredUsuarios = useMemo(() => {
        let resultado = usuarios || [];

        // 1. Filtrar por Tipo
        if (filterType && filterType !== 'All') {
            resultado = resultado.filter(u => (u.tipo || '').toUpperCase() === filterType);
        }

        // 2. Filtrar por Nome (SearchTerm)
        if (searchTerm && searchTerm.trim() !== '') {
            const termo = searchTerm.trim().toLowerCase();
            resultado = resultado.filter(u => (u.nome || '').toLowerCase().includes(termo));
        }

        // 3. Ordenação
        if (sortOrder === 'alpha-asc') {
            resultado = resultado.slice().sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
        } else if (sortOrder === 'alpha-desc') {
            resultado = resultado.slice().sort((a, b) => (b.nome || '').localeCompare(a.nome || ''));
        }
        
        return resultado;
    }, [usuarios, searchTerm, filterType, sortOrder]);


    // Funções de Ação
    const handleDeleteClick = (usuarioId) => {
        const usuario = usuarios.find(u => u.id === usuarioId);
        if (usuario.id === user.id) {
            alert("Você não pode deletar a si mesmo.");
            return;
        }
        
        setModalState({
            isOpen: true,
            title: 'Deletar Usuário',
            message: `Tem certeza que deseja deletar permanentemente o usuário ${usuario.nome}? Esta ação é irreversível.`,
            onConfirm: () => executeDeleteUsuario(usuarioId)
        });
    };

    const executeDeleteUsuario = async (id) => {
        try {
            await api.delete(`/usuarios/${id}`);
            setUsuarios(usuarios.filter(u => u.id !== id));
            alert('Usuário deletado com sucesso!');
        } catch (err) {
            alert('Não foi possível deletar o usuário.');
        } finally {
            setModalState({ isOpen: false });
        }
    };

    const handleToggleTipo = async (id, novoTipo) => {
        if (id === user.id) {
            alert("Você não pode alterar o tipo do seu próprio usuário.");
            return;
        }
        
        try {
            await api.put(`/usuarios/${id}/tipo`, { tipo: novoTipo });
            setUsuarios(usuarios.map(u => 
                u.id === id ? { ...u, tipo: novoTipo } : u
            ));
            alert('Tipo de usuário atualizado com sucesso!');
        } catch (err) {
            alert('Não foi possível alterar o tipo do usuário.');
        }
    };

    // Função de formatar data
    const formatarData = (dataString) => {
        if (!dataString) return 'N/A';
        const data = new Date(dataString);
        if (isNaN(data.getTime())) return 'N/A';
        return data.toLocaleDateString('pt-BR');
    };

    // Renderização
    if (loading) return <div className="loading-container">Carregando usuários...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="gestao-sistema-wrapper">
            <ConfirmModal 
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false })}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
                message={modalState.message}
            />
            <header className="gestao-sistema-header">
                <h1>Gestão do Sistema</h1>
                <p>Gerencie todos os usuários cadastrados na plataforma.</p>
            </header>

            <main className="gestao-sistema-main">
                
                {/* Barra de Filtros */}
                <div className="filtros-bar-sistema">
                    <input
                        type="search"
                        className="filtro-input"
                        placeholder="Pesquisar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Pesquisar usuário por nome"
                    />
                    
                    <select 
                        className="filtro-select" 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        aria-label="Filtrar por tipo"
                    >
                        <option value="All">Todos os Tipos</option>
                        <option value="CANDIDATO">Candidato</option>
                        <option value="RH">RH</option>
                        <option value="ADMIN">Admin</option>
                    </select>

                    <select 
                        className="filtro-select" 
                        value={sortOrder} 
                        onChange={(e) => setSortOrder(e.target.value)}
                        aria-label="Ordenar usuários"
                    >
                        <option value="default">Ordem de Cadastro</option>
                        <option value="alpha-asc">Ordem Alfabética (A-Z)</option>
                        <option value="alpha-desc">Ordem Alfabética (Z-A)</option>
                    </select>
                </div>

                {/* Tabela de Usuários (Atualizada para usar <button>) */}
                <div className="tabela-usuarios-container">
                    {filteredUsuarios.length === 0 ? (
                        <p className="nenhum-usuario">Nenhum usuário encontrado com os filtros atuais.</p>
                    ) : (
                        <table className="tabela-usuarios">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Telefone</th>
                                    <th>CPF</th>
                                    <th>Tipo</th>
                                    <th style={{ textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsuarios.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>{usuario.id}</td>
                                        <td>{usuario.nome}</td>
                                        <td>{usuario.email}</td>
                                        <td>{usuario.telefone || 'N/A'}</td>
                                        <td>{usuario.cpf || 'N/A'}</td>
                                        <td>
                                            <span className={`tipo-tag tipo-${(usuario.tipo || 'CANDIDATO').toLowerCase()}`}>
                                                {usuario.tipo}
                                            </span>
                                        </td>
                                        <td className="coluna-acoes-sistema">
                                            {usuario.tipo === 'CANDIDATO' && (
                                                <>
                                                    <button onClick={() => handleToggleTipo(usuario.id, 'ADMIN')} className="btn-acao-sistema promote-admin">Tornar Admin</button>
                                                    <button onClick={() => handleToggleTipo(usuario.id, 'RH')} className="btn-acao-sistema promote-rh">Tornar RH</button>
                                                </>
                                            )}
                                            {usuario.tipo === 'RH' && (
                                                <>
                                                    <button onClick={() => handleToggleTipo(usuario.id, 'ADMIN')} className="btn-acao-sistema promote-admin">Tornar Admin</button>
                                                    <button onClick={() => handleToggleTipo(usuario.id, 'CANDIDATO')} className="btn-acao-sistema demote">Rebaixar</button>
                                                </>
                                            )}
                                            {usuario.tipo === 'ADMIN' && (
                                                <>
                                                    <button onClick={() => handleToggleTipo(usuario.id, 'RH')} className="btn-acao-sistema promote-rh">Tornar RH</button>
                                                    <button onClick={() => handleToggleTipo(usuario.id, 'CANDIDATO')} className="btn-acao-sistema demote">Rebaixar</button>
                                                </>
                                            )}
                                            <button onClick={() => handleDeleteClick(usuario.id)} className="btn-acao-sistema delete" title="Deletar Usuário">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default GestaoSistema;