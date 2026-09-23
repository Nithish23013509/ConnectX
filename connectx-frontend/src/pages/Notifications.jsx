import { useState } from "react";

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

const FILTER_TABS = [
    { key: "ALL", label: "All" },
    { key: "WHATSAPP", label: "WhatsApp" },
    { key: "GMAIL", label: "Gmail" },
    { key: "YOUTUBE", label: "YouTube" },
    { key: "GOOGLE_DRIVE", label: "Drive" },
    { key: "GOOGLE_CALENDAR", label: "Calendar" },
];

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
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function Notifications({ notifications }) {
    const [filter, setFilter] = useState("ALL");

    const filtered = filter === "ALL" 
        ? notifications 
        : notifications.filter(n => n.provider === filter);

    return (
        <div>
            <div className="page-header">
                <h1>Notifications</h1>
                <p>{notifications.length} total notifications</p>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                {FILTER_TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
                        onClick={() => setFilter(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div className="notifications-list">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <h3>No notifications</h3>
                        <p>{filter === "ALL" 
                            ? "You're all caught up! Connect apps to start receiving notifications." 
                            : `No ${FILTER_TABS.find(t => t.key === filter)?.label || ''} notifications yet.`
                        }</p>
                    </div>
                ) : (
                    filtered.map(n => (
                        <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                            <div className={`notification-provider-icon integration-icon ${PROVIDER_COLORS[n.provider] || ''}`}>
                                {PROVIDER_ICONS[n.provider] || "📨"}
                            </div>
                            <div className="notification-content">
                                <div className="notification-sender">
                                    {n.senderName || n.sender || "Unknown"}
                                </div>
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
    );
}

export default Notifications;
