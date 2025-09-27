import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useOutsideAlerter from '@/hooks/outSideAlerter';
import { User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/router';

const UserMenu = () => {
    const { user, signOut } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const router = useRouter();

    console.log('User data in UserMenu:', user);

    useOutsideAlerter(dropdownRef, () => {
        setIsDropdownOpen(false);
    });

    const handleSignOut = async () => {
        await signOut();
        setIsDropdownOpen(false);
    };

    const handleLoginClick = () => {
        // Store current page for redirect after login
        sessionStorage.setItem('auth_redirect_url', window.location.pathname);
        router.push('/auth');
    };

    if (user) {
        // Show avatar and dropdown menu
        const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        const initial = userName.charAt(0).toUpperCase();
        const displayName = userName.length > 15 ? `${userName.substring(0, 15)}...` : userName;
        const avatarUrl = user.user_metadata?.avatar_url;

        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors"
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#319795] text-white font-medium">
                            {initial}
                        </div>
                    )}
                    <span className="hidden sm:block font-poppins text-sm font-medium text-gray-700 dark:text-gray-300 max-w-32 truncate">
                        {displayName}
                    </span>
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {userName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                            </p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                            <button
                                onClick={() => {
                                    // TODO: Navigate to dashboard
                                    setIsDropdownOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <User size={16} />
                                Dashboard
                            </button>

                            <button
                                onClick={() => {
                                    // TODO: Navigate to settings
                                    setIsDropdownOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Settings size={16} />
                                Settings
                            </button>

                            <button
                                onClick={() => {
                                    // TODO: Open help/support
                                    setIsDropdownOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <HelpCircle size={16} />
                                Help
                            </button>

                            <hr className="my-2 border-gray-200 dark:border-gray-700" />

                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Show Login and Sign-up buttons
    return (
        <button 
            onClick={handleLoginClick}
            className="font-poppins text-sm font-semibold text-[#319795] dark:text-[#319795] hover:text-[#246463] dark:hover:text-[#246463] transition-colors sm:text-base"
        >
            Login
        </button>
    );
};

export default UserMenu;
