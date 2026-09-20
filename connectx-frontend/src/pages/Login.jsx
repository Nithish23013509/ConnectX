import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        setError("");

        try {

            const response = await api.post(
                "/auth/login",
                form
            );

            localStorage.setItem(
                "connectx_token",
                response.data.token
            );

            navigate("/dashboard");

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Invalid email or password"
            );
        }
    };

    return (
        <div className="app-container">
            <div className="auth-panel">
                <h1>ConnectX</h1>
                <p>Welcome back! Please login to your account.</p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">
                        Login
                    </button>
                </form>

                <button className="btn-secondary" onClick={() => navigate("/register")}>
                    Create new account
                </button>
            </div>
        </div>
    );
}

export default Login;
