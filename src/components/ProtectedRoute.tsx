import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEmployeeByUserId, Employee } from '../services/employeeService';
import { useEffect, useState } from 'react';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      checkAccess();
    } else if (!loading && !user) {
      setCheckingAccess(false);
    }
  }, [user, loading, location.pathname]);

  const checkAccess = async () => {
    if (!user) return;

    // Only show spinner on initial load, not on every navigation
    if (!initialLoadDone) {
      setCheckingAccess(true);
    }

    const { data: employeeData } = await getEmployeeByUserId(user.id);
    setEmployee(employeeData);

    setCheckingAccess(false);
    setInitialLoadDone(true);
  };

  if (loading || (checkingAccess && !initialLoadDone)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-peach-50 to-rose-50 dark:from-gray-900 dark:via-burgundy-950 dark:to-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 dark:border-burgundy-400"></div>
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

  return <Outlet />;
}
