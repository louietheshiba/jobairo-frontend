import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/context/ProfileContext';
import useOutsideAlerter from '@/hooks/outSideAlerter';
import { User, LogOut } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const UserMenu = () => {
    const { user, signOut } = useAuth();
    const { profile } = useProfile();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const router = useRouter();


    useOutsideAlerter(dropdownRef, () => {
        setIsDropdownOpen(false);
    });

    const handleSignOut = async () => {
        await signOut();
        setIsDropdownOpen(false);
        router.push('/auth/login');
        
    };

    if (user) {
        const userName = profile.full_name;
        const initial = userName.charAt(0).toUpperCase();
        const displayName = userName.length > 15 ? `${userName.substring(0, 15)}...` : userName;
        const avatarUrl = profile.avatar_url;

        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-[#282828] rounded-lg p-2 transition-colors"
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-10 text-white font-medium">
                            {initial}
                        </div>
                    )}
                    <span className="hidden sm:block font-poppins text-sm font-medium text-gray-700 dark:text-gray-300 max-w-32 truncate">
                        {displayName}
                    </span>
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#282828] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
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
                            <Link href='/dashboard'>
                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <User size={16} />
                                    Dashboard
                                </button>
                            </Link>

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
            onClick={() => router.push('/auth/login')}
            className="bg-gradient-to-r from-[#10b981] to-[#047857] text-white font-poppins text-sm font-semibold px-3 py-1.5 rounded-[10px] shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300 sm:text-base"
        >
            Sign Up/Login
        </button>
    );
};

export default UserMenu;
