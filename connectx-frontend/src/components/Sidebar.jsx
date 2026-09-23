import { NavLink, useNavigate } from "react-router-dom";

function Sidebar({ user, notifications, sidebarOpen, onCloseSidebar }) {
    const navigate = useNavigate();
    const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U";
    const unreadCount = notifications?.filter(n => !n.read)?.length || notifications?.length || 0;

    const logout = () => {
        localStorage.removeItem("connectx_token");
        navigate("/login");
    };

    const navItems = [
        { path: "/dashboard", icon: "🏠", label: "Dashboard" },
        { path: "/integrations", icon: "🔗", label: "Integrations" },
        { path: "/notifications", icon: "🔔", label: "Notifications", badge: unreadCount },
        { path: "/settings", icon: "⚙️", label: "Settings" },
    ];

    return (
        <>
            {sidebarOpen && <div className="sidebar-overlay" onClick={onCloseSidebar} style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99,
                display: 'none',
            }} />}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">CX</div>
                    <span className="sidebar-logo-text gradient-text">ConnectX</span>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            onClick={onCloseSidebar}
                        >
                            <span className="sidebar-link-icon">{item.icon}</span>
                            {item.label}
                            {item.badge > 0 && (
                                <span className="sidebar-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-user">
                    <div className="sidebar-avatar">{initials}</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.name || "User"}</div>
                        <div className="sidebar-user-email">{user?.email || ""}</div>
                    </div>
                    <button className="sidebar-logout" onClick={logout} title="Logout">🚪</button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
