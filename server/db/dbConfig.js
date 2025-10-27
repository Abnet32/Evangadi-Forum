const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const requiredEnv = ["DB_HOST", "DB_USER", "DB_PASS", "DB_NAME", "DB_PORT"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`❌ Missing environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

// Aiven requires SSL
const sslOptions = {
  minVersion: "TLSv1.2",
  rejectUnauthorized: false,
  // ✅ If you downloaded a CA certificate from Aiven:
  // ca: fs.readFileSync(path.join(__dirname, "ca.pem")),
};

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: sslOptions,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
});

console.log("✅ MySQL pool initialized");

module.exports = pool;
