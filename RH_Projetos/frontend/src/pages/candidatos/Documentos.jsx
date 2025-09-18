import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Documentos.css";
import Button from "../../components/Button";
import Input from "../../components/Input";

const Documentos = () => {
    const [form, setForm] = useState({
        rgcpf: null,
        certidao: null,
        residencia: null,
        historico: null,
        reservista: null,
        cnh: null,
        genero: "",
    });
    const [enviado, setEnviado] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, files, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (
            !form.rgcpf ||
            !form.certidao ||
            !form.residencia ||
            !form.historico ||
            (form.genero === "masculino" && !form.reservista)
        ) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }
        setEnviado(true);
    };

    return (
        <div className="documentos-container">
            <h2>Envio de Documentos</h2>
            {!enviado ? (
                <form className="documentos-form" onSubmit={handleSubmit}>
                    <label>
                        Gênero:
                        <select name="genero" value={form.genero} onChange={handleChange} required>
                            <option value="">Selecione</option>
                            <option value="masculino">Masculino</option>
                            <option value="feminino">Feminino</option>
                            <option value="outro">Outro</option>
                        </select>
                    </label>
                    <label>
                        RG/CPF (obrigatório):
                        <Input type="file" name="rgcpf" accept=".pdf,.jpg,.png" onChange={handleChange} required />
                    </label>
                    <label>
                        Certidão de nascimento (obrigatório):
                        <Input type="file" name="certidao" accept=".pdf,.jpg,.png" onChange={handleChange} required />
                    </label>
                    <label>
                        Comprovante de residência (obrigatório):
                        <Input type="file" name="residencia" accept=".pdf,.jpg,.png" onChange={handleChange} required />
                    </label>
                    <label>
                        Histórico escolar (obrigatório):
                        <Input type="file" name="historico" accept=".pdf,.jpg,.png" onChange={handleChange} required />
                    </label>
                    {form.genero === "masculino" && (
                        <label>
                            Reservista (obrigatório para homens):
                            <Input type="file" name="reservista" accept=".pdf,.jpg,.png" onChange={handleChange} required />
                        </label>
                    )}
                    <label>
                        CNH (opcional):
                        <Input type="file" name="cnh" accept=".pdf,.jpg,.png" onChange={handleChange} />
                    </label>
                    <Button type="submit" className="btn-enviar">Enviar Documentos</Button>
                </form>
            ) : (
                <div style={{ textAlign: "center" }}>
                    <h3>Documentos enviados com sucesso!</h3>
                    <Button
                        className="btn-enviar"
                        onClick={() => navigate("/etapas/:vagasId")}
                        style={{ marginTop: "24px" }}
                    >
                        Voltar para Etapas
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Documentos;