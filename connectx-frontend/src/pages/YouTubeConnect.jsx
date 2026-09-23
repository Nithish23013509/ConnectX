import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

function YouTubeConnect() {
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
            const redirectUri = window.location.origin + "/connect/youtube";
            const response = await api.post("/apps/youtube/connect", { 
                code,
                redirectUri 
            });
            setMessage(response.data || "YouTube connected successfully!");
            setIsSuccess(true);
        } catch (error) {
            console.error("YouTube connection error:", error);
            setMessage("Failed to connect YouTube. Please try again.");
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    const launchGoogleAuth = () => {
        const clientId = "900191005045-qha3ejq67maqqgv555bfpkr6u9l35tso.apps.googleusercontent.com";
        const redirectUri = window.location.origin + "/connect/youtube";
        
        // Scope for readonly youtube access and basic profile
        const scope = "https://www.googleapis.com/auth/youtube.readonly email profile";
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
        
        window.location.href = authUrl;
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: "500px", textAlign: "center" }}>
                <h2>Connect YouTube</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
                    Link your YouTube channel to receive notifications for new video uploads from your subscriptions directly in ConnectX.
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
                            backgroundColor: "#FF0000", // YouTube Red
                            borderColor: "#FF0000"
                        }}
                    >
                        {loading ? "Connecting..." : "Continue with YouTube"}
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

export default YouTubeConnect;
