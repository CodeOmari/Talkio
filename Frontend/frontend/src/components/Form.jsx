import { useState } from "react";
import api from "../api";
// npm install react react-dom
// npm install react-router-dom
import { useNavigate, Link } from "react-router-dom"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from './LoadingIndicator'

import '../styles/Form.css'

export default function Form({route, method}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isLogin = method === "login";
  const action = isLogin ? "Login" : "Register";


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      let payload;

      if (isLogin) {
        payload = { email, password1: password };
      } else {
        payload = { username, email, password1:password, password2:confirmPassword };
      }

      const res = await api.post(route, payload);

      if (isLogin) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access_token);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh_token);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      alert("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1>Talkio</h1>

      {/* Username only for register */}
      {!isLogin && (
        <input
          className="form-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
      )}

      <input
        className="form-input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      {/* Confirm password only for register */}
      {!isLogin && (
        <input
          className="form-input"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
        />
      )}

      {loading && <LoadingIndicator />}

      <button className="form-button" type="submit">
        {action}
      </button>

      {isLogin && (
        <Link to="/register" className="register-link">
          Need an account? Sign up now.
        </Link>
      )}
    </form>
  );
}