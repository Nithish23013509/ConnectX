import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import WhatsAppConnect from "./pages/WhatsAppConnect";
import GmailConnect from "./pages/GmailConnect";

function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Navigate to="/dashboard" />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/connect/whatsapp"
                    element={
                        <ProtectedRoute>
                            <WhatsAppConnect />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/connect/gmail"
                    element={
                        <ProtectedRoute>
                            <GmailConnect />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/whatsapp/callback"
                    element={
                        <ProtectedRoute>
                            <WhatsAppConnect />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;
