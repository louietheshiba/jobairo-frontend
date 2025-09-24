import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const UserMenu = () => {
    const { user, signOut } = useAuth();

    if (user) {
        // Show avatar and sign out option
        const initial = user?.email?.charAt(0).toUpperCase() || 'U';
        return (
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-10 text-white">
                    {initial}
                </div>
                <button
                    onClick={signOut}
                    className="font-poppins text-sm font-semibold text-primary-10 dark:text-white sm:text-base"
                >
                    Sign Out
                </button>
            </div>
        );
    }

    // Show Login button
    return (
      <button className="font-poppins text-sm font-semibold text-primary-10 dark:text-white sm:text-base">
        Login
      </button>
    );
};

export default UserMenu;
