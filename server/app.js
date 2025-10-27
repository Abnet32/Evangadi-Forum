const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/authRoute");
const userRoutes = require("./routes/userRoute");
const questionRoutes = require("./routes/questionRoute");
const answerRoutes = require("./routes/answerRoute");
const aiRoute = require("./routes/aiRoute");
const groupRoutes = require("./routes/groupRoute");
const installRoutes = require("./routes/installRoute");
const authMiddleware = require("./middleware/authMiddleware");
const db = require("./db/dbConfig");

const app = express();
const port = process.env.PORT || 14255;

// -------------------------------
// Middleware
// -------------------------------
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json({limit: "10mb"})); // Limit request size

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);
// -------------------------------
// Test route
// -------------------------------
app.get("/", (req, res) => res.send("Hello from Evangadi Forum!"));

// -------------------------------
// API routes
// -------------------------------

// Public routes (no auth)
app.use("/", installRoutes);
app.use("/api/user", userRoutes); // Register/Login
app.use("/api/auth", authRoutes); // Forgot/Reset Password

// Debug route to test auth endpoints
app.get("/api/auth/test", (req, res) => {
  res.json({
    message: "Auth routes are working!",
    timestamp: new Date().toISOString(),
  });
});

// Protected routes (authMiddleware)
app.use("/api/question", authMiddleware, questionRoutes);
app.use("/api/answer", authMiddleware, answerRoutes);
app.use("/api/ai", authMiddleware, aiRoute);
app.use("/api/groups", authMiddleware, groupRoutes);

// -------------------------------
// Database connection & server start
// -------------------------------

async function startServer() {
  try {
    await db.query("SELECT 1"); // Test DB connection
    console.log("✅ MySQL promise-based pool created");
    // Bind to all interfaces for Render deployment
    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
}

startServer();
