import mysql from 'mysql2/promise'; // Usando a versão com Promises

const pool = mysql.createPool({
  host: 'localhost', // ou o seu host
  user: 'root', // seu usuário
  password: '1234', // sua senha
  database: 'erpDB', // nome do seu banco de dados
});

export default pool;
