import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function WhatsAppConnect() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const launchWhatsAppSignup = () => {
        if (!window.FB) {
            setMessage("Meta SDK is still loading. Please try again.");
            setIsSuccess(false);
            return;
        }

        setLoading(true);
        setMessage("");

        window.FB.login(
            (response) => {
                const handleResponse = async () => {
                    console.log("Embedded Signup response:", response);
                    setLoading(false);

                if (response.authResponse?.code) {
                    const code = response.authResponse.code;
                    console.log("Authorization code received");

                    try {
                        const backendResponse = await api.post(
                            "/apps/whatsapp/embedded-signup",
                            { 
                                code: code
                            }
                        );

                        console.log("Backend response:", backendResponse.data);

                        setMessage("WhatsApp authorization received by ConnectX.");
                        setIsSuccess(true);
                    } catch (error) {
                        console.error("Embedded Signup backend error:", error);
                        setMessage("Authorization succeeded, but ConnectX could not complete the connection.");
                        setIsSuccess(false);
                    }
                } else {
                    setMessage("WhatsApp connection was cancelled or unsuccessful.");
                    setIsSuccess(false);
                }
                };
                handleResponse();
            },
            {
                config_id: "3428342227347876",
                response_type: "code",
                override_default_response_type: true,
                extras: {
                    setup: {}
                }
            }
        );
    };

    return (
        <div className="app-container">
            <div className="auth-panel">
                <h1>Connect WhatsApp</h1>
                <p>Connect your WhatsApp Business account securely through Meta.</p>

                {message && (
                    <div className={isSuccess ? "success-msg" : "error-msg"}>
                        {message}
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
                    <button
                        onClick={launchWhatsAppSignup}
                        disabled={loading}
                        style={{ 
                            background: "var(--whatsapp)", 
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem"
                        }}
                    >
                        {loading ? "Opening Meta..." : "Continue with Meta"}
                    </button>

                    <button 
                        className="btn-secondary" 
                        onClick={() => navigate("/dashboard")}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WhatsAppConnect;
