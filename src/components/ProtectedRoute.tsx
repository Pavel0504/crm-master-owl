import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEmployeeByUserId, Employee } from '../services/employeeService';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    if (user) {
      checkAccess();
    } else {
      setCheckingAccess(false);
    }
  }, [user, location.pathname]);

  const checkAccess = async () => {
    if (!user) return;

    setCheckingAccess(true);

    const { data: employeeData } = await getEmployeeByUserId(user.id);
    setEmployee(employeeData);

    setCheckingAccess(false);
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (employee) {
    if (employee.role === 'user') {
      if (!employee.allowed_pages.includes(location.pathname)) {
        return <Navigate to="/no-access" replace />;
      }
    }
  }

  return <>{children}</>;
}
