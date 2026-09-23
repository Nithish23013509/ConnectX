import { useNavigate } from "react-router-dom";

function Landing() {
    const navigate = useNavigate();

    const features = [
        { icon: "⚡", title: "Real-time Notifications", desc: "Get instant push notifications from all your connected apps in one unified feed." },
        { icon: "🔗", title: "6+ Integrations", desc: "Connect Gmail, WhatsApp, YouTube, Google Drive, Calendar, and more with one click." },
        { icon: "📊", title: "Unified Dashboard", desc: "See everything at a glance — stats, recent activity, and quick actions in one place." },
    ];

    const appIcons = [
        { emoji: "💬", bg: "rgba(37, 211, 102, 0.2)", label: "WhatsApp" },
        { emoji: "📧", bg: "rgba(234, 67, 53, 0.2)", label: "Gmail" },
        { emoji: "▶️", bg: "rgba(255, 0, 0, 0.2)", label: "YouTube" },
        { emoji: "📁", bg: "rgba(31, 164, 99, 0.2)", label: "Drive" },
        { emoji: "📅", bg: "rgba(66, 133, 244, 0.2)", label: "Calendar" },
    ];

    return (
        <div className="landing-page">
            <div className="bg-orbs">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
            </div>
            
            <nav className="landing-nav">
                <div className="landing-nav-logo">
                    <div className="sidebar-logo-icon">CX</div>
                    <span className="sidebar-logo-text gradient-text">ConnectX</span>
                </div>
                <div className="landing-nav-actions">
                    <button className="btn-secondary btn-sm" onClick={() => navigate("/login")}>Sign In</button>
                    <button className="btn-primary btn-sm" onClick={() => navigate("/register")}>Get Started</button>
                </div>
            </nav>

            <section className="landing-hero">
                <h1>
                    All Your Apps.{" "}
                    <span className="gradient-text">One Inbox.</span>
                </h1>
                <p>
                    ConnectX brings your notifications from Gmail, WhatsApp, YouTube, Google Drive, 
                    and Calendar into a single, beautiful dashboard. Never miss an update again.
                </p>
                <div className="landing-cta">
                    <button className="btn-primary" onClick={() => navigate("/register")} style={{ padding: '0.875rem 2.5rem', fontSize: '1.05rem' }}>
                        🚀 Get Started Free
                    </button>
                    <button className="btn-secondary" onClick={() => navigate("/login")} style={{ padding: '0.875rem 2.5rem', fontSize: '1.05rem' }}>
                        Sign In
                    </button>
                </div>

                <div className="landing-apps-float">
                    {appIcons.map((app, i) => (
                        <div key={i} className="floating-app-icon" style={{ background: app.bg }} title={app.label}>
                            {app.emoji}
                        </div>
                    ))}
                </div>
            </section>

            <section className="landing-features">
                {features.map((feature, i) => (
                    <div className="feature-card" key={i}>
                        <div className="feature-icon">{feature.icon}</div>
                        <h3>{feature.title}</h3>
                        <p>{feature.desc}</p>
                    </div>
                ))}
            </section>
        </div>
    );
}

export default Landing;
