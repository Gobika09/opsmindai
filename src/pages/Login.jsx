import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../utils/api";
import "../styles/auth.css";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await loginUser(email, password);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      nav("/app");
    } catch (err) {
      alert(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-shell single">
        <div className="auth-left">
          <div className="brand">
            <span className="brand-icon">🧠</span>
            <span className="brand-text">NeuralBrain</span>
          </div>
          <h1 className="hero">Employee Login</h1>
          <p className="hero-sub">
            Use the credentials provided by Admin.
          </p>
        </div>

        <div className="auth-right">
          <div className="card">
            <h2 className="card-title">Sign In</h2>
            <p className="card-sub">Enter your company credentials</p>

            <form onSubmit={handleLogin} className="form">
              <div className="field">
                <label>Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@company.com"
                />
              </div>

              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button className="primary" disabled={loading} type="submit">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="legal">
              If you don’t have credentials, contact Admin.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}