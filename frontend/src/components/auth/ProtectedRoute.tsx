import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  element: JSX.Element;
  requiredPerms?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, requiredPerms }) => {
  const { user, hasPerm } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPerms && requiredPerms.length > 0) {
    const ok = requiredPerms.some(p => hasPerm(p));
    if (!ok) {
      return (
        <div className="p-10 text-center">
          <h1 className="text-2xl font-semibold mb-2">Access denied</h1>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </div>
      );
    }
  }

  return element;
};

export default ProtectedRoute;
