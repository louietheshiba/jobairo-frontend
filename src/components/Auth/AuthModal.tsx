import React, { useState } from 'react';
import Modal from '../ui/modal';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup' | 'forgot-password';
  redirectUrl?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialView = 'login',
  redirectUrl 
}) => {
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'forgot-password'>(initialView);

  const handleViewChange = (view: 'login' | 'signup' | 'forgot-password') => {
    setCurrentView(view);
  };

  const handleSuccess = () => {
    onClose();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md mx-auto">
        {currentView === 'login' && (
          <LoginForm 
            onSuccess={handleSuccess}
            onSwitchToSignup={() => handleViewChange('signup')}
            onForgotPassword={() => handleViewChange('forgot-password')}
          />
        )}
        {currentView === 'signup' && (
          <SignupForm 
            onSuccess={handleSuccess}
            onSwitchToLogin={() => handleViewChange('login')}
          />
        )}
        {currentView === 'forgot-password' && (
          <ForgotPasswordForm 
            onSuccess={() => handleViewChange('login')}
            onBackToLogin={() => handleViewChange('login')}
          />
        )}
      </div>
    </Modal>
  );
};

export default AuthModal;