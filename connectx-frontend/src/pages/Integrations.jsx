import { useNavigate } from "react-router-dom";
import api from "../services/api";

const PROVIDER_ROUTES = {
    WHATSAPP: "/connect/whatsapp",
    GMAIL: "/connect/gmail",
    GOOGLE_DRIVE: "/connect/drive",
    GOOGLE_CALENDAR: "/connect/calendar",
    YOUTUBE: "/connect/youtube",
};

const PROVIDER_ICONS = {
    WHATSAPP: "💬",
    GMAIL: "📧",
    GOOGLE_DRIVE: "📁",
    GOOGLE_CALENDAR: "📅",
    YOUTUBE: "▶️",
    GITHUB: "🐙",
};

const PROVIDER_COLORS = {
    WHATSAPP: "whatsapp",
    GMAIL: "gmail",
    GOOGLE_DRIVE: "drive",
    GOOGLE_CALENDAR: "calendar",
    YOUTUBE: "youtube",
    GITHUB: "github",
};

const PROVIDER_DESCRIPTIONS = {
    WHATSAPP: "Receive WhatsApp messages as notifications in real-time.",
    GMAIL: "Get notified when new emails arrive in your inbox.",
    GOOGLE_DRIVE: "Track new files added to your Google Drive.",
    GOOGLE_CALENDAR: "Get alerts for upcoming calendar events.",
    YOUTUBE: "Stay updated with your YouTube channel activity.",
    GITHUB: "Monitor repository events and pull requests.",
};

function Integrations({ apps, refreshApps }) {
    const navigate = useNavigate();
    const connectedCount = apps.filter(a => a.status === "CONNECTED").length;

    const handleDisconnect = async (app) => {
        if (window.confirm(`Are you sure you want to disconnect ${app.displayName}?`)) {
            try {
                await api.delete(`/apps/${app.provider}`);
                refreshApps();
            } catch (error) {
                console.error("Failed to disconnect", error);
                alert("Failed to disconnect app.");
            }
        }
    };

    const handleConnect = (provider) => {
        const route = PROVIDER_ROUTES[provider];
        if (route) navigate(route);
    };

    return (
        <div>
            <div className="page-header">
                <h1>Integrations</h1>
                <p>{connectedCount} of {apps.length} apps connected</p>
            </div>

            <div className="integrations-grid">
                {apps.map(app => (
                    <div 
                        key={app.provider} 
                        className="integration-card" 
                        data-provider={app.provider}
                    >
                        <div className="integration-header">
                            <div className={`integration-icon ${PROVIDER_COLORS[app.provider] || ''}`}>
                                {PROVIDER_ICONS[app.provider] || "🔗"}
                            </div>
                            <div className="integration-info">
                                <div className="integration-name">{app.displayName}</div>
                                {app.status === "CONNECTED" && app.accountEmail && (
                                    <div className="integration-email">{app.accountEmail}</div>
                                )}
                            </div>
                            <div className="integration-status">
                                {app.status === "CONNECTED" ? (
                                    <span className="badge badge-connected">
                                        <span className="badge-dot"></span>
                                        Connected
                                    </span>
                                ) : (
                                    <span className="badge badge-disconnected">
                                        <span className="badge-dot"></span>
                                        Not Connected
                                    </span>
                                )}
                            </div>
                        </div>

                        <p style={{ fontSize: '0.85rem', margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>
                            {PROVIDER_DESCRIPTIONS[app.provider] || "Connect this app to receive notifications."}
                        </p>

                        {app.status === "CONNECTED" && app.accountName && (
                            <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-secondary)' }}>
                                Signed in as <strong>{app.accountName}</strong>
                            </p>
                        )}

                        <div className="btn-row">
                            {app.status === "CONNECTED" ? (
                                <>
                                    <button className="btn-secondary btn-sm" onClick={() => handleConnect(app.provider)}>
                                        Manage
                                    </button>
                                    <button className="btn-danger btn-sm" onClick={() => handleDisconnect(app)}>
                                        Disconnect
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className={`btn-connect ${PROVIDER_COLORS[app.provider] || ''}`}
                                    onClick={() => handleConnect(app.provider)}
                                >
                                    Connect {app.displayName}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Integrations;
