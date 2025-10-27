const crypto = require("crypto");
const bcrypt = require("bcrypt");
const db = require("../db/dbConfig");
const sendEmail = require("../utils/sendEmail");

// Helper to hash token
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

exports.forgotPassword = async (req, res) => {
  console.log("🔍 Forgot password endpoint hit:", req.body);
  const { email } = req.body;
  if (!email || !email.includes("@"))
    return res.status(400).json({ message: "Invalid email" });

  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0)
      return res.status(404).json({ message: "No account found" });

    // Generate and hash token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(rawToken);
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Save token and expiry
    await db.query(
      "UPDATE users SET reset_token=?, reset_expires=? WHERE email=?",
      [hashedToken, expires, email]
    );

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
    const html = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>This link expires in 10 minutes.</p>
    `;

    // Send email via Brevo
    await sendEmail(
      email,
      "Password Reset Request",
      `Reset your password here: ${resetUrl}`,
      html
    );

    res.json({ message: "Password reset email sent successfully!" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Failed to send reset email" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!token || !newPassword || newPassword.length < 8)
    return res.status(400).json({ message: "Invalid request" });

  try {
    const hashedToken = hashToken(token);
    const [users] = await db.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()",
      [hashedToken]
    );

    if (users.length === 0)
      return res.status(400).json({ message: "Invalid or expired token" });

    const user = users[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE userid = ?",
      [hashedPassword, user.userid]
    );

    res.json({ message: "Password has been reset successfully!" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
