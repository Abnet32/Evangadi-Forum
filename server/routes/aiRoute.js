const express = require("express");
const router = express.Router();
const { askAI } = require("../controller/aiController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/ask", authMiddleware, askAI);

module.exports = router;
