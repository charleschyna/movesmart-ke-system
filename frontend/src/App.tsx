import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import NewDashboard from './components/dashboard/NewDashboard';
import NavbarDemo from './components/demo/NavbarDemo';
import IncidentsPage from './components/incidents/IncidentsPage';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new-dashboard" element={<NewDashboard />} />
          <Route path="/navbar-demo" element={<NavbarDemo />} />
          <Route path="/incidents" element={<IncidentsPage />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
