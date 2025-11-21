import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useProfile } from '@/context/ProfileContext';
import { useAuth } from '@/hooks/useAuth';

const DashboardHeader: React.FC = () => {
  const router = useRouter();
  const { profile } = useProfile();
  const { user } = useAuth();

  const getInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return profile.full_name.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'JD';
  };

  const navItems = [
    { label: 'Find Jobs', href: '/', active: false },
    { label: 'Dashboard', href: '/dashboard', active: true },
    { label: 'Messages', href: '/messages', active: false },
    { label: 'Settings', href: '/settings', active: false },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-dark-20 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#10b981]">JobAiro</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-12">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`relative py-2 text-base font-medium transition-colors ${
                  item.active
                    ? 'text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {item.label}
                {item.active && (
                  <div className="absolute -bottom-[21px] left-0 right-0 h-1 bg-[#10b981] rounded-t-full"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* User Avatar */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center text-white font-bold text-base shadow-sm hover:bg-[#059669] transition-colors hover:shadow-md"
            title={profile?.full_name || user?.email || 'Profile'}
          >
            {getInitials()}
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

