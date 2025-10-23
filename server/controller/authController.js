const crypto = require("crypto");
const bcrypt = require("bcrypt");
const db = require("../db/dbConfig");
const sendEmail = require("../utils/sendEmail");

// 🔒 Helper to hash token securely
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * ✅ POST /api/user/forgot-password
 * Step 1: User submits their email to request a password reset
 */
exports.forgotPassword = async (req, res) => {
  console.log("🔍 Forgot password endpoint hit:", req.body);
  const { email } = req.body;

  // Validate email input
  if (!email || !email.includes("@")) {
    console.log("❌ Invalid email provided:", email);
    return res.status(400).json({ message: "Please provide a valid email address" });
  }

  try {
    // 1️⃣ Check if user exists
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0)
      return res.status(404).json({ message: "No account found with this email address" });

    // 2️⃣ Generate reset token (raw + hashed)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(rawToken);

    // 3️⃣ Set expiry time (10 minutes from now)
    const expires = new Date(Date.now() + 10 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // 4️⃣ Store hashed token & expiry in DB
    await db.query(
      "UPDATE users SET reset_token=?, reset_expires=? WHERE email=?",
      [hashedToken, expires, email]
    );

    // 5️⃣ Create password reset link (send raw token in link)
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    // 6️⃣ Email content
    const html = `
      <h2>Password Reset Request</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>This link expires in 10 minutes.</p>
    `;

    // 7️⃣ Send email
    await sendEmail(
      email,
      "Password Reset Request",
      `Reset your password using this link: ${resetUrl}`,
      html
    );

    res.json({ message: "Password reset email sent successfully!" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Error sending reset email" });
  }
};

/**
 * ✅ POST /api/user/reset-password/:token
 * Step 2: User submits new password with reset token
 */
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  // Validate inputs
  if (!token) {
    return res.status(400).json({ message: "Reset token is required" });
  }
  
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }

  try {
    // 1️⃣ Hash token from URL to compare
    const hashedToken = hashToken(token);

    // 2️⃣ Look up user by hashed token
    const [users] = await db.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()",
      [hashedToken]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = users[0];

    // 3️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4️⃣ Update password & clear reset fields
    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE userid = ?",
      [hashedPassword, user.userid]
    );

    // 5️⃣ Optionally, auto-login the user after reset (optional)
    // const token = jwt.sign({ id: user.userid }, process.env.JWT_SECRET, { expiresIn: "1d" });
    // res.json({ message: "Password reset successful", token });

    res.json({ message: "Password has been reset successfully!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Something went wrong, try again later" });
  }
};
