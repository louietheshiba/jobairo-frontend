import { useRouter } from 'next/router';
import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

const ProtectedRoute = ({
   children,
   redirectTo = '/auth/login',
   requireAuth = true
 }: ProtectedRouteProps) => {
   const { user, loading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Still checking authentication status

    if (requireAuth && !user) {
      // Store the current URL for redirecting back after login
      sessionStorage.setItem('auth_redirect_url', router.asPath);
      router.push(redirectTo);
    } else if (!requireAuth && user) {
      // If user is authenticated but shouldn't be on this page
      router.push(userRole === 'admin' ? '/admin/dashboard' : '/dashboard');
    }
  }, [user, loading, router, redirectTo, requireAuth]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#319795]"></div>
      </div>
    );
  }

  // Show content if auth requirements are met
  if (requireAuth && user) {
    return <>{children}</>;
  } else if (!requireAuth && !user) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
};

export default ProtectedRoute;