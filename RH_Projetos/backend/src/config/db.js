const mysql = require('mysql2/promise');
require('dotenv').config();

// Cria um pool de conexões em vez de uma única conexão
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4' 
});

module.exports = pool;