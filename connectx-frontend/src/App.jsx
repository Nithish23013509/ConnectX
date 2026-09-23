import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Integrations from "./pages/Integrations";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

import WhatsAppConnect from "./pages/WhatsAppConnect";
import GmailConnect from "./pages/GmailConnect";
import GoogleDriveConnect from "./pages/GoogleDriveConnect";
import GoogleCalendarConnect from "./pages/GoogleCalendarConnect";
import YouTubeConnect from "./pages/YouTubeConnect";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Pages */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Authenticated Pages with Sidebar Layout */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <AppLayout>
                            {(props) => <Dashboard {...props} />}
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/integrations" element={
                    <ProtectedRoute>
                        <AppLayout>
                            {(props) => <Integrations {...props} />}
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/notifications" element={
                    <ProtectedRoute>
                        <AppLayout>
                            {(props) => <Notifications {...props} />}
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/settings" element={
                    <ProtectedRoute>
                        <AppLayout>
                            {(props) => <Settings {...props} />}
                        </AppLayout>
                    </ProtectedRoute>
                } />

                {/* Connect Pages (keep existing) */}
                <Route path="/connect/whatsapp" element={
                    <ProtectedRoute><WhatsAppConnect /></ProtectedRoute>
                } />
                <Route path="/connect/gmail" element={
                    <ProtectedRoute><GmailConnect /></ProtectedRoute>
                } />
                <Route path="/connect/drive" element={
                    <ProtectedRoute><GoogleDriveConnect /></ProtectedRoute>
                } />
                <Route path="/connect/calendar" element={
                    <ProtectedRoute><GoogleCalendarConnect /></ProtectedRoute>
                } />
                <Route path="/connect/youtube" element={
                    <ProtectedRoute><YouTubeConnect /></ProtectedRoute>
                } />

                <Route path="/whatsapp/callback" element={
                    <ProtectedRoute><WhatsAppConnect /></ProtectedRoute>
                } />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
