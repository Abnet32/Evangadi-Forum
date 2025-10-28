const db = require("../db/dbConfig");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
require("dotenv").config();

// 🔹 Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = rows[0];

    // 1️⃣ Generate token & expiration
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // 2️⃣ Save to users table
    await db.query(
      "UPDATE users SET reset_token = ?, reset_expires = ? WHERE userid = ?",
      [resetToken, resetExpires, user.userid]
    );

    // 3️⃣ Send reset email
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: '"Support Team" <support@example.com>',
      to: email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset Request</h3>
        <p>Click below to reset your password (expires in 15 minutes):</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // 1️⃣ Find user with token
    const [rows] = await db.query("SELECT * FROM users WHERE reset_token = ?", [
      token,
    ]);

    if (rows.length === 0)
      return res.status(400).json({ message: "Invalid or expired token" });

    const user = rows[0];
    const now = new Date();

    // 2️⃣ Check expiration
    if (now > user.reset_expires) {
      await db.query(
        "UPDATE users SET reset_token = NULL, reset_expires = NULL WHERE userid = ?",
        [user.userid]
      );
      return res
        .status(400)
        .json({ message: "Token expired. Request a new one." });
    }

    // 3️⃣ Hash new password and update
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE userid = ?",
      [hashed, user.userid]
    );

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
