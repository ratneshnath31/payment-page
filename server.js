const express = require("express");
const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sql = require("mssql");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// SQL Server configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // For Azure SQL
    trustServerCertificate: true // For local dev
  }
};

// Razorpay configuration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Database connection pool
let pool;
async function connectToDatabase() {
  try {
    pool = await sql.connect(dbConfig);
    console.log("Connected to SQL Server");
    
    // Create users table if it doesn't exist
    // ...existing code...
// Create users table if it doesn't exist
await pool.request().query(`
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
  CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    first_name NVARCHAR(100),
    last_name NVARCHAR(100),
    gender NVARCHAR(20),
    mobile NVARCHAR(20),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
  )
`);
// ...existing code...
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
}
connectToDatabase();

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Register endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, gender, mobile, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existing = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM users WHERE email = @email');
    if (existing.recordset.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Insert new user with all fields
    await pool.request()
      .input('first_name', sql.NVarChar, firstName)
      .input('last_name', sql.NVarChar, lastName)
      .input('gender', sql.NVarChar, gender)
      .input('mobile', sql.NVarChar, mobile)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .query(`
        INSERT INTO users (first_name, last_name, gender, mobile, email, password)
        VALUES (@first_name, @last_name, @gender, @mobile, @email, @password)
      `);

    res.json({ message: "Registration successful" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    // Find user
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id, email, password FROM users WHERE email = @email');
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const user = result.recordset[0];
    
    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Create token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      // { expiresIn: process.env.JWT_EXPIRES_IN }
      { expiresIn: '1h' }
    );
    
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Protected profile endpoint
// ...existing code...
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query('SELECT id, first_name, last_name, email, mobile, gender, created_at FROM users WHERE id = @userId');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ user: result.recordset[0] });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});
// ...existing code...

// Create order API (protected)
app.post("/create-order", async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  const options = {
    amount: amount,
    currency: "INR",
    receipt: "receipt_order_" + Date.now(),
  };

  try {
    const order = await razorpay.orders.create(options);

        // Format the created_at timestamp
        function formatTimestamp(unixSeconds) {
            const date = new Date(unixSeconds * 1000);
            return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        }
        order.created_at_formatted = formatTimestamp(order.created_at);

    console.log("Order Created:", order);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error creating order" });
  }
});

// Close database connection on process exit
process.on('SIGINT', async () => {
  await pool.close();
  console.log('Database connection closed');
  process.exit(0);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));


//there is no authentication for the create-order endpoint, you can add it if needed. just add the authenticateToken middleware to the route like this:
// app.post("/create-order", authenticateToken, async (req, res) => { ...
// and make sure to pass the token in the Authorization header when making requests to this endpoint.