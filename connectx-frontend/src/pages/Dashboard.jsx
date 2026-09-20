import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { connectWebSocket, disconnectWebSocket } from "../services/websocket";

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [apps, setApps] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const userResponse = await api.get("/user/me");
                setUser(userResponse.data);

                const appsResponse = await api.get("/apps");
                setApps(appsResponse.data);

                const notificationsResponse = await api.get("/notifications");
                setNotifications(notificationsResponse.data);

                connectWebSocket(
                    userResponse.data.id,
                    (newNotification) => {
                        setNotifications(previous => {
                            const alreadyExists = previous.some(
                                notification => notification.id === newNotification.id
                            );
                            if (alreadyExists) return previous;
                            return [newNotification, ...previous];
                        });
                    }
                );
            } catch (error) {
                console.error("Dashboard loading error:", error);
                // Temporarily disable auto-logout on error so we can debug Vercel
                // localStorage.removeItem("connectx_token");
                // navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();

        return () => {
            disconnectWebSocket();
        };
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("connectx_token");
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="app-container">
                <h2>Loading ConnectX...</h2>
            </div>
        );
    }

    // Get initials for avatar
    const initials = user.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U";

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>ConnectX</h1>
                    <p style={{ margin: 0 }}>Unified Multi-App Workspace</p>
                </div>
                
                <div className="user-profile">
                    <div className="avatar">{initials}</div>
                    <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{user.email}</div>
                    </div>
                    <button className="btn-secondary btn-sm" onClick={logout} style={{ marginLeft: "1rem" }}>
                        Logout
                    </button>
                </div>
            </header>

            <div className="dashboard-grid">
                {/* Apps Section */}
                <section className="section-panel">
                    <h2>Connected Apps</h2>
                    
                    <div className="apps-list">
                        {apps.map((app) => (
                            <div className="app-card" key={app.provider}>
                                <div className="app-header">
                                    <h3>{app.displayName}</h3>
                                    
                                    {app.status === "CONNECTED" ? (
                                        <span className="status-badge status-connected">
                                            <span style={{ fontSize: "10px" }}>🟢</span> Connected
                                        </span>
                                    ) : (
                                        <span className="status-badge status-disconnected">
                                            <span style={{ fontSize: "10px" }}>⚪</span> Not Connected
                                        </span>
                                    )}
                                </div>

                                {app.status === "CONNECTED" ? (
                                    <>
                                        {app.accountEmail && (
                                            <p style={{ margin: 0, fontSize: "0.9rem" }}>{app.accountEmail}</p>
                                        )}
                                        {app.accountName && (
                                            <p style={{ margin: 0, fontSize: "0.9rem" }}>{app.accountName}</p>
                                        )}
                                        <div className="btn-row">
                                            <button 
                                                className="btn-secondary btn-sm"
                                                onClick={() => {
                                                    if (app.provider === "WHATSAPP") {
                                                        navigate("/connect/whatsapp");
                                                    }
                                                }}
                                            >Manage</button>
                                            <button 
                                                className="btn-danger btn-sm"
                                                onClick={async () => {
                                                    if (window.confirm(`Are you sure you want to disconnect ${app.displayName}?`)) {
                                                        try {
                                                            await api.delete(`/apps/${app.provider}`);
                                                            const appsResponse = await api.get("/apps");
                                                            setApps(appsResponse.data);
                                                        } catch (error) {
                                                            console.error("Failed to disconnect", error);
                                                            alert("Failed to disconnect app.");
                                                        }
                                                    }
                                                }}
                                            >Disconnect</button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="btn-row">
                                        <button
                                            className="btn-sm"
                                            onClick={() => {
                                                if (app.provider === "WHATSAPP") {
                                                    navigate("/connect/whatsapp");
                                                }
                                            }}
                                        >
                                            Connect {app.displayName}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Notifications Section */}
                <section className="section-panel">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h2 style={{ margin: 0 }}>Notifications</h2>
                        <span style={{ background: "var(--primary)", padding: "0.2rem 0.6rem", borderRadius: "99px", fontSize: "0.8rem", fontWeight: "bold" }}>
                            {notifications.length}
                        </span>
                    </div>

                    <div className="notifications-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {notifications.length === 0 ? (
                            <p style={{ textAlign: "center", padding: "2rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                                You're all caught up! No notifications yet.
                            </p>
                        ) : (
                            notifications.map((notification) => (
                                <div 
                                    key={notification.id} 
                                    className={`notification-card ${!notification.read ? 'unread' : ''}`}
                                    style={{ borderLeftColor: notification.provider === 'WHATSAPP' ? 'var(--whatsapp)' : 'var(--primary)' }}
                                >
                                    <div className="notification-header">
                                        <span className={`provider-badge provider-${notification.provider.toLowerCase()}`}>
                                            {notification.provider}
                                        </span>
                                        <small style={{ color: "var(--text-muted)" }}>
                                            {new Date(notification.receivedAt).toLocaleString([], { 
                                                month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' 
                                            })}
                                        </small>
                                    </div>
                                    
                                    <h4 style={{ margin: "0 0 0.5rem 0", color: "#fff", fontSize: "1rem" }}>
                                        {notification.title || notification.sender}
                                    </h4>
                                    
                                    <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.4" }}>
                                        {notification.message}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Dashboard;
