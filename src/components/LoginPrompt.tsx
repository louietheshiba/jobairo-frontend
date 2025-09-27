import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';

interface LoginPromptProps {
  children: React.ReactNode;
  action: string;
  className?: string;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ children, action, className = '' }) => {
  const { user } = useAuth();
  const router = useRouter();

  if (user) {
    return <>{children}</>;
  }

  const handleClick = () => {
    // Store current page for redirect after login
    sessionStorage.setItem('auth_redirect_url', window.location.pathname);
    router.push('/auth');
  };

  return (
    <div 
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
      title={`Login to ${action}`}
    >
      {children}
      {/* Optional overlay for visual feedback */}
      <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
        <span className="text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded shadow-sm">
          Login to {action}
        </span>
      </div>
    </div>
  );
};

export default LoginPrompt;