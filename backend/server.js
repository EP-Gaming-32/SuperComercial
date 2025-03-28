const express = require('express');
const mysql = require('mysql2');
const crypto = require('crypto');  // Use the built-in crypto module
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Enable CORS so your Next.js frontend can make requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json());
app.use(bodyParser.json());

// MySQL database connection configuration
const db = mysql.createConnection({
  host: 'localhost',  // Update with your MySQL host
  user: 'root',       // Your MySQL username
  password: '1234',   // Your MySQL password
  database: 'erpDB'    // Your MySQL database name
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Helper function to hash passwords with SHA-256 and return as a buffer
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest(); // Returns a buffer
}

// Register endpoint using SHA-256 hashing
app.post('/cadastro', async (req, res) => {
  const { nome, email, telefone, celular, senha } = req.body;

  // Basic validation
  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Hash the password using SHA-256 and return it as a buffer (binary data)
    const hashedSenha = hashPassword(senha);
  
    // Insert the new user into the "usuarios" table with the hashed password (binary data)
    const sql = `INSERT INTO usuarios (nome, email, telefone, celular, Senha) VALUES (?, ?, ?, ?, ?)`;
    const values = [nome, email, telefone, celular, hashedSenha];
  
    db.query(sql, values, (error, results) => {
      if (error) {
        console.error("Error inserting user:", error);
        return res.status(500).json({ message: "Registration error" });
      }
      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Registration error" });
  }
});

// Login endpoint using SHA-256 hashing
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
  
    // Basic validation
    if (!email || !senha) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      // Find the user by email
      const sql = `SELECT * FROM usuarios WHERE email = ?`;
      db.query(sql, [email], (error, results) => {
        if (error) {
          console.error("Error querying user:", error);
          return res.status(500).json({ message: "Login error" });
        }
  
        if (results.length === 0) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
  
        const user = results[0];
  
        // Ensure 'Senha' from database is a Buffer
        const storedSenha = user.Senha;
  
        // Hash the provided password using SHA-256 and return it as a buffer (binary data)
        const hashedSenha = hashPassword(senha);

        console.log('Stored Password (Buffer):', storedSenha);
        console.log('Hashed Password (Buffer):', hashedSenha);
  
        // Compare the hashed password (binary data) with the stored password (buffer from database)
        if (Buffer.compare(hashedSenha, storedSenha) !== 0) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
  
        // Generate a JWT token
        const token = jwt.sign({ id: user.UsuarioID, email: user.email }, 'your_secret_key', { expiresIn: '1h' });
        res.json({ message: "Login successful", token });
      });
    } catch (err) {
      console.error("Error during login:", err);
      res.status(500).json({ message: "Login error" });
    }
  });
  

// Start the server on port 5000 (or any port you prefer)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
