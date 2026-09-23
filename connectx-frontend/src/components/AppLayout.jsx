import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import api from "../services/api";
import { connectWebSocket, disconnectWebSocket } from "../services/websocket";

function AppLayout({ children }) {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [apps, setApps] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
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
                        setNotifications(prev => {
                            const exists = prev.some(n => n.id === newNotification.id);
                            if (exists) return prev;
                            return [newNotification, ...prev];
                        });
                    }
                );
            } catch (error) {
                console.error("Failed to load app data:", error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    localStorage.removeItem("connectx_token");
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
        return () => disconnectWebSocket();
    }, [navigate]);

    const refreshApps = async () => {
        try {
            const appsResponse = await api.get("/apps");
            setApps(appsResponse.data);
        } catch (e) {
            console.error("Failed to refresh apps:", e);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p style={{ color: 'var(--text-muted)' }}>Loading ConnectX...</p>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? '✕' : '☰'}
            </button>
            <Sidebar 
                user={user} 
                notifications={notifications}
                sidebarOpen={sidebarOpen}
                onCloseSidebar={() => setSidebarOpen(false)}
            />
            <main className="app-main">
                {typeof children === 'function' 
                    ? children({ user, apps, notifications, setNotifications, refreshApps })
                    : children
                }
            </main>
        </div>
    );
}

export default AppLayout;
