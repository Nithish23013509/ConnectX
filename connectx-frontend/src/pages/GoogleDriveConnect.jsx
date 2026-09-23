import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

function GoogleDriveConnect() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const code = searchParams.get("code");
        if (code) {
            handleGoogleCallback(code);
        }
    }, [searchParams]);

    const handleGoogleCallback = async (code) => {
        setLoading(true);
        try {
            const redirectUri = window.location.origin + "/connect/drive";
            const response = await api.post("/apps/drive/connect", { 
                code,
                redirectUri 
            });
            setMessage(response.data || "Google Drive connected successfully!");
            setIsSuccess(true);
        } catch (error) {
            console.error("Google Drive connection error:", error);
            setMessage("Failed to connect Google Drive. Please try again.");
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    const launchGoogleAuth = () => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const redirectUri = window.location.origin + "/connect/drive";
        
        // Scope for readonly drive access and basic profile
        const scope = "https://www.googleapis.com/auth/drive.readonly email profile";
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
        
        window.location.href = authUrl;
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: "500px", textAlign: "center" }}>
                <h2>Connect Google Drive</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
                    Link your Google Drive to receive real-time notifications for new and updated files directly in ConnectX.
                </p>

                {message && (
                    <div style={{ 
                        padding: "1rem", 
                        borderRadius: "8px", 
                        marginBottom: "1.5rem",
                        backgroundColor: isSuccess ? "rgba(39, 174, 96, 0.1)" : "rgba(231, 76, 60, 0.1)",
                        color: isSuccess ? "var(--success)" : "var(--danger)",
                        border: `1px solid ${isSuccess ? "var(--success)" : "var(--danger)"}`
                    }}>
                        {message}
                    </div>
                )}

                {!isSuccess ? (
                    <button 
                        className="btn-primary" 
                        onClick={launchGoogleAuth}
                        disabled={loading}
                        style={{ 
                            width: "100%", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            gap: "10px",
                            backgroundColor: "#1FA463", // Drive Green
                            borderColor: "#1FA463"
                        }}
                    >
                        {loading ? "Connecting..." : "Continue with Google Drive"}
                    </button>
                ) : (
                    <button 
                        className="btn-secondary" 
                        onClick={() => navigate("/dashboard")}
                        style={{ width: "100%" }}
                    >
                        Return to Dashboard
                    </button>
                )}

                <div style={{ marginTop: "1.5rem" }}>
                    <button 
                        className="btn-secondary btn-sm" 
                        onClick={() => navigate("/dashboard")}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GoogleDriveConnect;
