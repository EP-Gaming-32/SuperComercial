import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost', // host
  user: 'root', // nome do usuário
  password: '1234', // senha
  database: 'erpDB', // nome do banco
});

export default pool;
