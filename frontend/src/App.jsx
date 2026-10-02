import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import EmailVerification from './pages/auth/EmailVerification';

// Dupilio Core Pages
import Dashboard from './pages/dashboard/Dashboard';
import Profiles from './pages/profiles/Profiles';
import Contests from './pages/contests/Contests';
import Events from './pages/events/Events';
import Problems from './pages/problems/Problems';
import Preparation from './pages/preparation/Preparation';
import Todo from './pages/todo/Todo';
import Leaderboard from './pages/leaderboard/Leaderboard';
import Discussions from './pages/discussions/Discussions';
import AiAssistant from './pages/ai/AiAssistant';
import Settings from './pages/settings/Settings';

// Helper Route guard
const ProtectedRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />

            {/* Dashboard Protected Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profiles" element={<Profiles />} />
              <Route path="contests" element={<Contests />} />
              <Route path="events" element={<Events />} />
              <Route path="problems" element={<Problems />} />
              <Route path="preparation" element={<Preparation />} />
              <Route path="todo" element={<Todo />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="discussions" element={<Discussions />} />
              <Route path="ai-assistant" element={<AiAssistant />} />
              <Route path="settings" element={<Settings />} />

              {/* Seamless Aliases for Backwards Compatibility */}
              <Route path="profile" element={<Navigate to="/profiles" replace />} />
              <Route path="discuss" element={<Navigate to="/discussions" replace />} />
              <Route path="dsa" element={<Navigate to="/problems" replace />} />
              <Route path="dsa/problems" element={<Navigate to="/problems" replace />} />
              <Route path="weak-topics" element={<Navigate to="/preparation" replace />} />
              <Route path="oa-prep" element={<Navigate to="/preparation" replace />} />
              <Route path="company-mock" element={<Navigate to="/preparation" replace />} />
              <Route path="resume" element={<Navigate to="/dashboard" replace />} />
              <Route path="notes" element={<Navigate to="/preparation" replace />} />
            </Route>

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
