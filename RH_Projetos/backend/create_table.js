const mysql = require('mysql2/promise');
require('dotenv').config();

const createDatabaseAndTables = async () => {
    try {
        // Conectar ao servidor MySQL sem um banco de dados inicial
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        const dbName = process.env.DB_NAME;

        // Criar o banco de dados se ele não existir
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`Banco de dados "${dbName}" criado ou já existente.`);

        // Mudar para o novo banco de dados para criar as tabelas
        await connection.execute(`USE \`${dbName}\``);
        console.log(`Usando o banco de dados "${dbName}".`);

        // Comandos SQL para criar as tabelas
        const createTablesSql = [
            `CREATE TABLE IF NOT EXISTS candidatos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                cpf CHAR(11) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                senha VARCHAR(255) NOT NULL,
                data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`,
            `CREATE TABLE IF NOT EXISTS rh (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                senha VARCHAR(255) NOT NULL,
                data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`,
            `CREATE TABLE IF NOT EXISTS vagas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                rh_id INT NOT NULL,
                titulo VARCHAR(100) NOT NULL,
                area VARCHAR(50),
                salario DECIMAL(10,2),
                descricao TEXT,
                requisitos TEXT,
                manual VARCHAR(255),
                data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (rh_id) REFERENCES rh(id)
            );`,
            `CREATE TABLE IF NOT EXISTS candidaturas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                candidato_id INT NOT NULL,
                vaga_id INT NOT NULL,
                status ENUM(
                    'Aguardando Teste',
                    'Teste Disponível',
                    'Manual',
                    'Envio de Documentos',
                    'Entrevista',
                    'Finalizado'
                ) DEFAULT 'Aguardando Teste',
                data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (candidato_id) REFERENCES candidatos(id),
                FOREIGN KEY (vaga_id) REFERENCES vagas(id),
                UNIQUE KEY (candidato_id, vaga_id)
            );`,
            `CREATE TABLE IF NOT EXISTS testes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vaga_id INT NOT NULL,
                titulo VARCHAR(100) NOT NULL,
                descricao TEXT,
                FOREIGN KEY (vaga_id) REFERENCES vagas(id)
            );`,
            `CREATE TABLE IF NOT EXISTS questoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                teste_id INT NOT NULL,
                enunciado TEXT NOT NULL,
                tipo ENUM('multipla_escolha', 'dissertativa') NOT NULL,
                FOREIGN KEY (teste_id) REFERENCES testes(id)
            );`,
            `CREATE TABLE IF NOT EXISTS opcoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                questao_id INT NOT NULL,
                texto VARCHAR(255) NOT NULL,
                correta BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (questao_id) REFERENCES questoes(id)
            );`,
            `CREATE TABLE IF NOT EXISTS respostas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                candidato_id INT NOT NULL,
                questao_id INT NOT NULL,
                resposta_texto TEXT,
                resposta_opcao_id INT,
                FOREIGN KEY (candidato_id) REFERENCES candidatos(id),
                FOREIGN KEY (questao_id) REFERENCES questoes(id),
                FOREIGN KEY (resposta_opcao_id) REFERENCES opcoes(id)
            );`,
            `CREATE TABLE IF NOT EXISTS documentos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                candidatura_id INT NOT NULL,
                tipo VARCHAR(50) NOT NULL,
                caminho VARCHAR(255) NOT NULL,
                data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (candidatura_id) REFERENCES candidaturas(id)
            );`
        ];

        // Executar os comandos SQL de criação de tabela
        for (const sql of createTablesSql) {
            await connection.execute(sql);
        }

        console.log('Todas as tabelas foram criadas com sucesso.');
        connection.end();
        console.log('Conexão fechada.');

    } catch (err) {
        console.error('Erro ao criar o banco de dados ou as tabelas:', err);
    }
};

createDatabaseAndTables();