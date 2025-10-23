import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ProtectedRouteProps } from '../../types';
import Loading from './Loading';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading message='Verificando autenticación...' />;
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  if (user) {
    // Check role requirements
    if (requiredRoles.length > 0) {
      const userRoles = user.roles.map(role => role.name);
      const hasRequiredRole = requiredRoles.some(role =>
        userRoles.includes(role)
      );

      if (!hasRequiredRole) {
        return <Navigate to='/unauthorized' replace />;
      }
    }

    // Check permission requirements
    if (requiredPermissions.length > 0) {
      const userPermissions = user.roles.flatMap(role =>
        role.permissions.map(permission => permission.name)
      );
      const hasRequiredPermission = requiredPermissions.some(permission =>
        userPermissions.includes(permission)
      );

      if (!hasRequiredPermission) {
        return <Navigate to='/unauthorized' replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
