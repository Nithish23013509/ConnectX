import { useState } from "react";

function Settings({ user, apps }) {
    const connectedCount = apps.filter(a => a.status === "CONNECTED").length;

    // Local toggle state (UI only — no backend for notification prefs yet)
    const [prefs, setPrefs] = useState({
        WHATSAPP: true,
        GMAIL: true,
        YOUTUBE: true,
        GOOGLE_DRIVE: true,
        GOOGLE_CALENDAR: true,
    });

    const togglePref = (provider) => {
        setPrefs(prev => ({ ...prev, [provider]: !prev[provider] }));
    };

    const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U";

    return (
        <div style={{ maxWidth: 700 }}>
            <div className="page-header">
                <h1>Settings</h1>
                <p>Manage your profile and preferences</p>
            </div>

            {/* Profile Section */}
            <div className="settings-section">
                <h3>👤 Profile</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div className="sidebar-avatar" style={{ width: 64, height: 64, fontSize: '1.5rem', borderRadius: 16 }}>
                        {initials}
                    </div>
                    <div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{user?.name || "User"}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user?.email || ""}</div>
                    </div>
                </div>
                <div className="settings-row">
                    <span className="settings-label">Name</span>
                    <span className="settings-value">{user?.name || "—"}</span>
                </div>
                <div className="settings-row">
                    <span className="settings-label">Email</span>
                    <span className="settings-value">{user?.email || "—"}</span>
                </div>
                <div className="settings-row">
                    <span className="settings-label">Connected Apps</span>
                    <span className="settings-value">{connectedCount} of {apps.length}</span>
                </div>
            </div>

            {/* Notification Preferences */}
            <div className="settings-section">
                <h3>🔔 Notification Preferences</h3>
                <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Choose which app notifications you want to receive.</p>
                {[
                    { key: "WHATSAPP", label: "WhatsApp", icon: "💬" },
                    { key: "GMAIL", label: "Gmail", icon: "📧" },
                    { key: "YOUTUBE", label: "YouTube", icon: "▶️" },
                    { key: "GOOGLE_DRIVE", label: "Google Drive", icon: "📁" },
                    { key: "GOOGLE_CALENDAR", label: "Google Calendar", icon: "📅" },
                ].map(item => (
                    <div className="settings-row" key={item.key}>
                        <span className="settings-label">{item.icon} {item.label}</span>
                        <button 
                            className={`toggle ${prefs[item.key] ? 'active' : ''}`}
                            onClick={() => togglePref(item.key)}
                        />
                    </div>
                ))}
            </div>

            {/* Danger Zone */}
            <div className="settings-section danger-zone">
                <h3>⚠️ Danger Zone</h3>
                <div className="settings-row">
                    <div>
                        <span className="settings-label">Delete Account</span>
                        <p style={{ fontSize: '0.8rem', margin: '4px 0 0', color: 'var(--text-muted)' }}>
                            Permanently delete your account and all data.
                        </p>
                    </div>
                    <button className="btn-danger btn-sm">Delete Account</button>
                </div>
            </div>
        </div>
    );
}

export default Settings;
