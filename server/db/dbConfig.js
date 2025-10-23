const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise"); // Promise-based mysql2

// Ensure required environment variables exist
const requiredEnv = ["DB_HOST", "DB_USER", "DB_PASS", "DB_NAME", "DB_PORT"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(
    `❌ Missing environment variables: ${missingEnv.join(
      ", "
    )}. Please check your .env file.`
  );
  process.exit(1);
}

// SSL options for Aiven (simplified)
// Note: Using rejectUnauthorized: false for development/production compatibility

// Create a promise-based connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false, // ✅ Accept self-signed certificates
  },
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000, // 10 seconds
});

console.log("✅ MySQL promise-based pool created");

module.exports = pool;
