import { useNavigate } from "react-router-dom";

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

function formatTimeAgo(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function Dashboard({ user, apps, notifications }) {
    const navigate = useNavigate();

    const connectedCount = apps.filter(a => a.status === "CONNECTED").length;
    const todayCount = notifications.filter(n => {
        const d = new Date(n.receivedAt || n.createdAt);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    }).length;

    const recentNotifications = notifications.slice(0, 5);
    const disconnectedApps = apps.filter(a => a.status !== "CONNECTED").slice(0, 4);

    return (
        <div>
            <div className="page-header">
                <h1>Welcome back, <span className="gradient-text">{user?.name?.split(" ")[0] || "User"}</span>! 👋</h1>
                <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
                <div className="stat-card glass-gradient-purple">
                    <div className="stat-card-icon">🔗</div>
                    <div className="stat-card-value">{connectedCount}</div>
                    <div className="stat-card-label">Connected Apps</div>
                </div>
                <div className="stat-card glass-gradient-pink">
                    <div className="stat-card-icon">🔔</div>
                    <div className="stat-card-value">{notifications.length}</div>
                    <div className="stat-card-label">Total Notifications</div>
                </div>
                <div className="stat-card glass-gradient-blue">
                    <div className="stat-card-icon">✨</div>
                    <div className="stat-card-value">{todayCount}</div>
                    <div className="stat-card-label">New Today</div>
                </div>
            </div>

            {/* Two Column: Recent Notifications + Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Recent Notifications */}
                <div className="card">
                    <div className="card-header">
                        <span className="section-title">Recent Notifications</span>
                        <button className="btn-secondary btn-sm" onClick={() => navigate("/notifications")}>
                            View All
                        </button>
                    </div>
                    <div className="notifications-list">
                        {recentNotifications.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">🔔</div>
                                <h3>No notifications yet</h3>
                                <p>Connect your apps to start receiving notifications</p>
                            </div>
                        ) : (
                            recentNotifications.map(n => (
                                <div key={n.id} className="notification-item">
                                    <div className={`notification-provider-icon integration-icon ${PROVIDER_COLORS[n.provider] || ''}`}>
                                        {PROVIDER_ICONS[n.provider] || "📨"}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-sender">{n.senderName || n.sender || "Unknown"}</div>
                                        <div className="notification-message">{n.message}</div>
                                        <div className="notification-meta">
                                            <span className={`notification-provider-tag tag-${n.provider?.toLowerCase()}`}>
                                                {n.provider?.replace("_", " ")}
                                            </span>
                                            <span className="notification-time">{formatTimeAgo(n.receivedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <div className="card-header">
                        <span className="section-title">Quick Actions</span>
                        <button className="btn-secondary btn-sm" onClick={() => navigate("/integrations")}>
                            All Apps
                        </button>
                    </div>
                    {disconnectedApps.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🎉</div>
                            <h3>All apps connected!</h3>
                            <p>You've connected all available integrations</p>
                        </div>
                    ) : (
                        <>
                            <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Connect more apps to receive notifications:</p>
                            <div className="quick-actions">
                                {disconnectedApps.map(app => (
                                    <button
                                        key={app.provider}
                                        className={`btn-connect ${PROVIDER_COLORS[app.provider] || ''}`}
                                        onClick={() => {
                                            const route = PROVIDER_ROUTES[app.provider];
                                            if (route) navigate(route);
                                        }}
                                    >
                                        {PROVIDER_ICONS[app.provider] || "🔗"} Connect {app.displayName}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
