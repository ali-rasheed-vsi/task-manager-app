'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo 
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🛡️ ProtectedRoute: Effect triggered', {
      isLoading,
      hasUser: !!user,
      requireAuth,
      redirectTo,
      currentPath: window.location.pathname
    });
    
    if (!isLoading) {
      if (requireAuth && !user) {
        console.log('🛡️ ProtectedRoute: User not authenticated, redirecting to login');
        router.push(redirectTo || '/login');
      } else if (!requireAuth && user) {
        console.log('🛡️ ProtectedRoute: User is authenticated but on auth page, redirecting to dashboard');
        router.push(redirectTo || '/dashboard');
      } else {
        console.log('🛡️ ProtectedRoute: No redirect needed');
      }
    } else {
      console.log('🛡️ ProtectedRoute: Still loading, waiting...');
    }
  }, [user, isLoading, requireAuth, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
