const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const answerRoutes = require("./routes/answerRoute");
const questionRoutes = require("./routes/questionRoute");
const userRoutes = require("./routes/userRoute");
const aiRoute = require("./routes/aiRoute");
const authRoutes = require("./routes/authRoute");
const installRoutes = require("./routes/installRoute");
const groupRoutes = require("./routes/groupRoute");
const authMiddleware = require("./middleware/authMiddleware");
const db = require("./db/dbConfig");

const app = express();
const port = process.env.PORT || 14255;

// -------------------------------
// Middleware
// -------------------------------
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

// -------------------------------
// Optional: HTTP logger in dev
// -------------------------------
if (process.env.NODE_ENV !== "production") {
  app.use(require("morgan")("dev"));
}

// -------------------------------
// Test route
// -------------------------------
app.get("/", (req, res) => res.send("Hello from Evangadi Forum!"));

// -------------------------------
// API routes
// -------------------------------
app.use("/", installRoutes);
app.use("/api/user", userRoutes);
app.use("/api", authRoutes);
app.use("/api", authMiddleware, questionRoutes);
app.use("/api", authMiddleware, answerRoutes);
app.use("/api/ai", authMiddleware, aiRoute);
app.use("/api/groups", authMiddleware, groupRoutes);

// -------------------------------
// Health endpoint
// -------------------------------
app.get("/health", (req, res) => res.json({ status: "ok" }));

// -------------------------------
// 404 & Global Error Handler
// -------------------------------
app.use((req, res, next) =>
  res.status(404).json({ message: "Route not found" })
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// -------------------------------
// Database connection & server start
// --------
