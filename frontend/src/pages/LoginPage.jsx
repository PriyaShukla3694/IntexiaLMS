import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

const rawBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BASE = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const { email, password } = formData;

    try {
      const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Login failed");
      }

      login(data.token, data.user);

      const role = data.user.role.toLowerCase();
      if (role === "admin") {
        navigate("/admin-dashboard");
      } else if (role === "instructor") {
        navigate("/instructor-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <motion.div
      className="auth-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="auth-box glass">
        <h2>Welcome Back</h2>

        <p>
          Login to continue your journey
        </p>

        <form onSubmit={handleLogin}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />


          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button type="submit">
            Login
          </button>
        </form>

        <p
          className="forgot-password"
          onClick={() =>
            navigate("/forgot-password")
          }
        >
          Forgot Password?
        </p>

        <p className="switch-text">
          New user?
          <span
            onClick={() =>
              navigate("/register")
            }
          >
            {" "}
            Create account
          </span>
        </p>
      </div>
    </motion.div>
  );
}

export default LoginPage;