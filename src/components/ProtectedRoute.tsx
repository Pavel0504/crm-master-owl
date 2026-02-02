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

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

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
