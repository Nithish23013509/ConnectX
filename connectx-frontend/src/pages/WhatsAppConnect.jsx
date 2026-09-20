import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function WhatsAppConnect() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        businessAccountId: "",
        phoneNumberId: "",
        accountName: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        try {

            await api.post(
                "/apps/whatsapp/connect",
                form
            );

            setSuccess(
                "WhatsApp connected successfully."
            );

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Unable to connect WhatsApp."
            );
        }
    };

    return (
        <div className="app-container">
            <div className="auth-panel">
                <h1>Connect WhatsApp</h1>
                <p>Link your WhatsApp Business account to ConnectX.</p>

                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <input
                        name="accountName"
                        placeholder="Business Name (Optional)"
                        value={form.accountName}
                        onChange={handleChange}
                    />

                    <input
                        name="businessAccountId"
                        placeholder="WhatsApp Business Account ID"
                        value={form.businessAccountId}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="phoneNumberId"
                        placeholder="Phone Number ID"
                        value={form.phoneNumberId}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">
                        Connect WhatsApp
                    </button>
                </form>

                <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default WhatsAppConnect;
