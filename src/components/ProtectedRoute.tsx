import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEmployeeByUserId, Employee } from '../services/employeeService';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    if (user && !loading) {
      checkAccess();
    } else if (!loading && !user) {
      setCheckingAccess(false);
    }
  }, [user, loading, location.pathname]);

  const checkAccess = async () => {
    if (!user) return;

    setCheckingAccess(true);

    const { data: employeeData } = await getEmployeeByUserId(user.id);
    setEmployee(employeeData);

    setCheckingAccess(false);
  };

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (employee && employee.role === 'user') {
    if (!employee.allowed_pages.includes(location.pathname)) {
      return <Navigate to="/no-access" replace />;
    }
  }

  return <>{children}</>;
}
