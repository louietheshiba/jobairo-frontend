import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/context/ProfileContext';
import useOutsideAlerter from '@/hooks/outSideAlerter';
import { LogOut, Home, ArrowLeft, X } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const UserMenu = () => {
    const { user, signOut, userRole } = useAuth();
    const { profile } = useProfile();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const router = useRouter();

    useOutsideAlerter(dropdownRef, () => setIsDropdownOpen(false));

    const handleSignOut = async () => {
        await signOut();
        setIsDropdownOpen(false);
    };

    if (user) {
        const userName = profile?.full_name || 'User';
        const initial = userName.charAt(0).toUpperCase();
        const displayName =
            userName.length > 15 ? `${userName.substring(0, 15)}...` : userName;
        const avatarUrl = user.user_metadata?.avatar_url;

        return (
            <div className="relative" ref={dropdownRef}>
                {/* Profile button */}
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-[#282828] rounded-lg p-2 transition-colors"
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#10b981] text-white font-semibold">
                            {initial}
                        </div>
                    )}
                    <span className="hidden sm:block font-poppins text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[8rem] truncate">
                        {displayName}
                    </span>
                </button>

                {/* Dropdown menu (centered) */}
                {isDropdownOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 sm:bg-transparent sm:inset-auto sm:absolute sm:right-1 sm:top-full sm:mt-2 sm:justify-end sm:w-auto sm:z-[9999]">
                        <div className="relative w-[90%] sm:w-64 bg-white dark:bg-[#282828] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-4 animate-fadeIn sm:py-2 sm:rounded-lg sm:shadow-lg">

                            {/* Close button (mobile only) */}
                            <button
                                onClick={() => setIsDropdownOpen(false)}
                                className="absolute top-3 right-3 sm:hidden text-gray-500 hover:text-gray-300"
                            >
                                <X size={18} />
                            </button>

                            {/* User Info */}
                            <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-700 text-center sm:text-left">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {userName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {user.email}
                                </p>
                            </div>

                            {/* Menu Items */}
                            <div className="flex flex-col py-2 text-center sm:text-left w-full">
                                {router.pathname.startsWith('/dashboard') ? (
                                    <Link href="/">
                                        <button
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="flex items-center justify-center sm:justify-start gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 rounded-md"
                                        >
                                            <ArrowLeft size={16} />
                                            <span className="font-medium">Back to Home</span>
                                        </button>
                                    </Link>
                                ) : (
                                    <Link href={userRole === 'admin' ? '/dashboard' : '/dashboard'}>
                                        <button
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="flex items-center justify-center sm:justify-start gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 rounded-md"
                                        >
                                            <Home size={16} />
                                            <span className="font-medium">Go to Dashboard</span>
                                        </button>
                                    </Link>
                                )}

                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center justify-center sm:justify-start gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-md mt-1"
                                >
                                    <LogOut size={16} />
                                    <span className="font-medium">Sign Out</span>
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Guest mode
    return (
        <button
            onClick={() => router.push('/auth/login')}
            className="bg-[#10b981] text-white font-poppins text-sm sm:text-base font-semibold px-4 sm:px-5 py-1.5 rounded-lg shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300"
        >
            Sign Up / Login
        </button>
    );
};

export default UserMenu;
