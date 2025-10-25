import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ProtectedRouteProps } from '../../types';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to='/login' replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const userRoles = user.roles.map(role => role.name);
    const hasRequiredRole = requiredRoles.some(role =>
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return <Navigate to='/unauthorized' replace />;
    }
  }

  // Check permission-based access
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

  return <>{children}</>;
};

export default ProtectedRoute;
