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
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

const App: React.FC = () => {
  return (
<AuthProvider>
      <div className="App">
        <Toaster position="top-right" reverseOrder={false} />
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-dashboard" element={<NewDashboard />} />
            <Route path="/reports-page" element={<ReportsExports />} />
            <Route path="/navbar-demo" element={<NavbarDemo />} />
            <Route path="/incidents" element={<IncidentsPage />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
};

export default App;
