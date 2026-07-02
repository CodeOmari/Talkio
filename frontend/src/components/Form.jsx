import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from './LoadingIndicator'

import '../styles/Form.css'
import Logo from '../assets/Logo.svg'

export default function Form({route, method}){
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const isLogin = method === "login";
    const action = method === "login" ? "Login" : "Register";

     const handleSubmit = async (e) => {
        e.preventDefault();

        const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

        if (method === 'register') {
           if (password1 !== password2) {
            alert("Passwords do not match");
            return;
           }

           if (!passwordRegex.test(password1)) {
             alert("Password must be at least 8 characters long and include at least one special character");
             return;
           }
    }

        setLoading(true);

        try {
        let payload;

        if (method === 'login') {
            payload = { 
            email, 
            password: password1,
            };
        } else {
            payload = { 
            username, 
            email,
            password1, 
            password2, 
            };
        }

        console.log("Payload:", payload);

        const res = await api.post(route, payload);

        if (method === "login") {
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            navigate("/");
        } else {
            alert("Account created successfully! Please log in.");
            navigate("/login");
        }
        } catch (error) {
            if (method === "login") {
                alert("Incorrect username or password");
            } else {
                if (error.response && error.response.data) {
                const data = error.response.data;

                const messages = Object.values(data).flat().join("\n");
                    alert(messages);
                } else {
                    alert("Registration failed. Try again.");
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return(
         <div className="auth-page">
            <div className="auth-card">

                <div className="brand-icon">
                    <img src={Logo} alt="Talkio icon" />
                </div>

                <h1 className="brand-title">Welcome to Talkio</h1>
                <p className="brand-subtitle">Real-time messaging. Find friends by their username.</p>

                <div className="tab-toggle">
                    <Link to="/login" className={isLogin ? "active" : ""}>Sign in</Link>
                    <Link to="/register" className={!isLogin ? "active" : ""}>Create account</Link>
                </div>

                <form onSubmit={handleSubmit} className="form-container">

                {method === 'register' && (
                    <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                        className="form-input"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                        required
                    />
                    <p className="form-hint">3–24 characters. Letters, numbers, underscores. Friends will use this to find you.</p>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                    className="form-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                    className="form-input"
                    type="password"
                    value={password1}
                    onChange={(e) => setPassword1(e.target.value)}
                    placeholder=""
                    required
                    />
                </div>

                {method === 'register' && (
                    <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input
                        className="form-input"
                        type="password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        placeholder=""
                        required
                    />
                    </div>
                )}

                {loading && <LoadingIndicator />}

                <button className="form-button" type="submit">
                    {action}
                </button>

                </form>
            </div>
    </div>
    );
}