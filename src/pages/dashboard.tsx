import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Container from '@/layouts/Container';
import Header from '@/layouts/Header';
import Footer from '@/layouts/Footer';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute requireAuth={true}>
      <Container>
        <Header />
        <main className="min-h-screen py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to your Dashboard
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Profile Information
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                    <strong>Email:</strong> {user?.email}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                    <strong>Name:</strong> {user?.user_metadata?.full_name || 'Not provided'}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Member since:</strong> {new Date(user?.created_at || '').toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                    Saved Jobs
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You haven't saved any jobs yet. Start browsing to save interesting positions!
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Applications
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Track your job applications and their status in one place.
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    Search Alerts
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Set up alerts for new jobs matching your criteria.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                  <div className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    Browse Jobs
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Discover new opportunities
                  </div>
                </button>

                <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                  <div className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    Update Profile
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Keep your information current
                  </div>
                </button>

                <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                  <div className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    Settings
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your preferences
                  </div>
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </Container>
    </ProtectedRoute>
  );
};

export default Dashboard;