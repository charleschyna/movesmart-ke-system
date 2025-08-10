import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/dashboard/Dashboard';
import NewDashboard from './components/dashboard/NewDashboard';
import NavbarDemo from './components/demo/NavbarDemo';
import IncidentsPage from './components/incidents/IncidentsPage';
import ReportsExports from './components/features/ReportsExports';
import NotificationCenter from './components/notifications/NotificationCenter';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import './index.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <div className="App bg-background text-foreground min-h-screen">
            <Toaster position="top-right" reverseOrder={false} />
            <Router>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/new-dashboard" element={<NewDashboard />} />
                <Route path="/reports-page" element={<ReportsExports />} />
                <Route path="/navbar-demo" element={<NavbarDemo />} />
                <Route path="/incidents" element={<IncidentsPage />} />
                <Route path="/notifications" element={<NotificationCenter />} />
              </Routes>
            </Router>
          </div>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
