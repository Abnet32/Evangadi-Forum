import { useState } from "react";
import axios from "../../Api/axios";
import classes from "./Auth.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages
    try {
      const res = await axios.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      console.error("Forgot password error:", err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Error sending reset link. Please try again.";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes["auth-container"]}>
      <div className={classes["auth-box"]}>
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        {message && (
          <p className={`${classes["auth-message"]} ${
            message.includes("successfully") ? classes["success"] : classes["error"]
          }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
