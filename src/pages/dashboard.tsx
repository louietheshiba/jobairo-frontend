

import React, { useState } from 'react';
import { Home, Heart, FileText, EyeOff, Search, Eye, Settings, Eye as ViewIcon, Heart as SaveIcon, FileText as ApplyIcon, BarChart3, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Meta } from '@/layouts/Meta';
import JobListCard from '@/components/ui/jobListCard';
import JobDetailsModal from '@/components/Modals/JobDetail';
import { Select } from '@/components/ui/select';
import type { Job } from '@/types/JobTypes';
import type { Option } from '@/types/FiltersType';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Container from '@/layouts/Container';
import Header from '@/layouts/Header';
import Footer from '@/layouts/Footer';

// Mock recommended jobs data
const mockRecommendedJobs: Job[] = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    salary: '$140K/year',
    source: ['Meta', 'Hybrid', 'Posted 2 days ago'],
    job_type: 'Full Time',
    company_name: 'Meta',
    description: 'Design and maintain CI/CD pipelines, infrastructure as code, and monitoring systems for high-scale applications serving billions of users worldwide.',
    requirements: ['Kubernetes', 'Terraform', 'AWS'],
    benefits: ['Competitive salary', 'Stock options', 'Health benefits'],
  },
  {
    id: 2,
    title: 'Frontend Developer',
    salary: '$125K/year',
    source: ['Netflix', 'Onsite', 'Posted 4 days ago'],
    job_type: 'Full Time',
    company_name: 'Netflix',
    description: 'Build performant, accessible web applications using React, TypeScript, and modern CSS. Focus on creating delightful user experiences at scale.',
    requirements: ['React', 'TypeScript', 'CSS'],
    benefits: ['Flexible work', 'Learning budget', 'Top-tier benefits'],
  },
  {
    id: 3,
    title: 'Data Scientist',
    salary: '$135K/year',
    source: ['Spotify', 'Remote', 'Posted 1 day ago'],
    job_type: 'Full Time',
    company_name: 'Spotify',
    description: 'Apply machine learning to personalize music recommendations for millions of users. Work with large-scale data pipelines and experimentation frameworks.',
    requirements: ['Python', 'ML/AI', 'Data Engineering'],
    benefits: ['Remote work', 'Music streaming', 'Innovation focus'],
  },
];

// Mock applied jobs data with application details
const mockAppliedJobs: (Job & { appliedDate: string; status: string; notes?: string })[] = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    salary: '$140K/year',
    source: ['Meta', 'Hybrid', 'Posted 2 days ago'],
    job_type: 'Full Time',
    company_name: 'Meta',
    description: 'Design and maintain CI/CD pipelines...',
    requirements: ['Kubernetes', 'Terraform', 'AWS'],
    benefits: ['Competitive salary', 'Stock options', 'Health benefits'],
    appliedDate: '2024-01-12',
    status: 'Applied',
    notes: 'Submitted resume and cover letter. Following up in 1 week.',
  },
  {
    id: 2,
    title: 'Frontend Developer',
    salary: '$125K/year',
    source: ['Netflix', 'Onsite', 'Posted 4 days ago'],
    job_type: 'Full Time',
    company_name: 'Netflix',
    description: 'Build performant, accessible web applications...',
    requirements: ['React', 'TypeScript', 'CSS'],
    benefits: ['Flexible work', 'Learning budget', 'Top-tier benefits'],
    appliedDate: '2024-01-08',
    status: 'Interview',
    notes: 'Passed initial screening. Technical interview scheduled for next week.',
  },
];

// Mock saved jobs data with save dates
const mockSavedJobs: (Job & { savedDate: string })[] = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    salary: '$140K/year',
    source: ['Meta', 'Hybrid', 'Posted 2 days ago'],
    job_type: 'Full Time',
    company_name: 'Meta',
    description: 'Design and maintain CI/CD pipelines, infrastructure as code, and monitoring systems for high-scale applications serving billions of users worldwide.',
    requirements: ['Kubernetes', 'Terraform', 'AWS'],
    benefits: ['Competitive salary', 'Stock options', 'Health benefits'],
    savedDate: '2024-01-15',
  },
  {
    id: 2,
    title: 'Frontend Developer',
    salary: '$125K/year',
    source: ['Netflix', 'Onsite', 'Posted 4 days ago'],
    job_type: 'Full Time',
    company_name: 'Netflix',
    description: 'Build performant, accessible web applications using React, TypeScript, and modern CSS. Focus on creating delightful user experiences at scale.',
    requirements: ['React', 'TypeScript', 'CSS'],
    benefits: ['Flexible work', 'Learning budget', 'Top-tier benefits'],
    savedDate: '2024-01-10',
  },
];
const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('relevant');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobsView, setSavedJobsView] = useState<'grid' | 'list'>('grid');
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [savedJobsSort, setSavedJobsSort] = useState('date');

  const handleCardClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };


  return (
    <ProtectedRoute requireAuth={true}>
      <Container>
        <Header />
        <Meta title="Dashboard - Job Airo" description="Job Airo Dashboard" />
        <div className="min-h-screen bg-gray-50 dark:bg-dark-25 font-poppins">
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg dark:bg-dark-20 flex flex-col fixed left-0 top-0 h-screen z-10">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                  <Link href="/" className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, User!</p>
              </div>

              <nav className="mt-6">
                <div className="px-3">
                  <button
                    onClick={() => setActiveTab('relevant')}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${activeTab === 'relevant'
                        ? 'bg-primary-10 text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30'
                      }`}
                  >
                    <Home className="w-5 h-5 mr-3" />
                    Relevant Jobs
                  </button>

                  <button
                    onClick={() => setActiveTab('saved')}
                    className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${activeTab === 'saved'
                        ? 'bg-primary-10 text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30'
                      }`}
                  >
                    <Heart className="w-5 h-5 mr-3" />
                    Saved Jobs
                  </button>

                  <button
                    onClick={() => setActiveTab('applied')}
                    className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${activeTab === 'applied'
                        ? 'bg-primary-10 text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30'
                      }`}
                  >
                    <FileText className="w-5 h-5 mr-3" />
                    Applied Jobs
                  </button>

                  <button
                    onClick={() => setActiveTab('hidden')}
                    className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${activeTab === 'hidden'
                        ? 'bg-primary-10 text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30'
                      }`}
                  >
                    <EyeOff className="w-5 h-5 mr-3" />
                    Hidden Jobs
                  </button>

                  <button
                    onClick={() => setActiveTab('searches')}
                    className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${activeTab === 'searches'
                        ? 'bg-primary-10 text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30'
                      }`}
                  >
                    <Search className="w-5 h-5 mr-3" />
                    Saved Searches
                  </button>

                  <button
                    onClick={() => setActiveTab('viewed')}
                    className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${activeTab === 'viewed'
                        ? 'bg-primary-10 text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30'
                      }`}
                  >
                    <Eye className="w-5 h-5 mr-3" />
                    Recently Viewed
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center px-3 py-2 mt-1 text-left rounded-lg transition-colors ${activeTab === 'settings'
                        ? 'bg-primary-10 text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30'
                      }`}
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Settings
                  </button>
                </div>

                {/* Logout Button */}
                <div className="mt-auto p-6 border-t border-gray-200 dark:border-gray-700">
                  <button className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-30 rounded-lg transition-colors">
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
              <div className="max-w-6xl mx-auto">
                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-dark-20 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900 transition-colors duration-200">
                        <ViewIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Jobs Viewed</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-dark-20 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900 transition-colors duration-200">
                        <SaveIcon className="w-6 h-6 text-red-600 dark:text-red-300" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Jobs Saved</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-dark-20 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900 transition-colors duration-200">
                        <ApplyIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Jobs Applied</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-dark-20 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900 transition-colors duration-200">
                        <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Response Rate</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">25%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-sm dark:bg-dark-20">
                  <div className="p-6">
                    {activeTab === 'relevant' && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recommended Jobs</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              Personalized job recommendations based on your activity
                            </p>
                          </div>
                          <button className="inline-flex items-center px-4 py-2 bg-primary-10 text-white text-sm font-medium rounded-md hover:bg-primary-15 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-10 focus:ring-offset-2">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh Recommendations
                          </button>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                          {mockRecommendedJobs.map((job, index) => (
                            <div key={job.id} className="relative">
                              <JobListCard item={job} onClick={handleCardClick} />
                              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                  💡 {index === 0 ? 'Similar to Senior Developer role you saved' :
                                    index === 1 ? 'Matches your React experience' :
                                      'Based on companies you viewed'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-center gap-3">
                          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                            Not Interested
                          </button>
                          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                            Hide This
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === 'saved' && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Saved Jobs</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              Jobs you've saved for later ({mockSavedJobs.length})
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* View Toggle */}
                            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                              <button
                                onClick={() => setSavedJobsView('grid')}
                                className={`px-3 py-1 rounded-md text-sm transition-colors ${savedJobsView === 'grid'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300'
                                  }`}
                              >
                                Grid
                              </button>
                              <button
                                onClick={() => setSavedJobsView('list')}
                                className={`px-3 py-1 rounded-md text-sm transition-colors ${savedJobsView === 'list'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300'
                                  }`}
                              >
                                List
                              </button>
                            </div>

                            {/* Sort Dropdown */}
                            <Select
                              value={{ label: savedJobsSort === 'date' ? 'Date Saved' : savedJobsSort === 'company' ? 'Company' : 'Salary', value: savedJobsSort }}
                              onChange={(selected) => {
                                const value = selected as Option;
                                setSavedJobsSort(value?.value || 'date');
                              }}
                              options={[
                                { label: 'Date Saved', value: 'date' },
                                { label: 'Company', value: 'company' },
                                { label: 'Salary', value: 'salary' }
                              ]}
                              placeholder="Sort by"
                            />
                          </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedJobs.length > 0 && (
                          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                              {selectedJobs.length} job{selectedJobs.length > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex gap-2">
                              <button className="inline-flex items-center px-3 py-1.5 bg-primary-10 text-white text-sm font-medium rounded-md hover:bg-primary-15 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-10 focus:ring-offset-2">
                                Apply to All
                              </button>
                              <button className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                                Unsave Selected
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Jobs Grid/List */}
                        <div className={savedJobsView === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
                          {mockSavedJobs.map((job) => (
                            <div key={job.id} className="relative">
                              {savedJobsView === 'grid' ? (
                                <>
                                  <div className="absolute top-2 left-2 z-10">
                                    <input
                                      type="checkbox"
                                      checked={selectedJobs.includes(job.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedJobs([...selectedJobs, job.id]);
                                        } else {
                                          setSelectedJobs(selectedJobs.filter(id => id !== job.id));
                                        }
                                      }}
                                      className="w-4 h-4 text-primary-10 bg-gray-100 border-gray-300 rounded focus:ring-primary-10 dark:focus:ring-primary-10 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <JobListCard item={job} onClick={handleCardClick} />
                                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Saved on {new Date(job.savedDate).toLocaleDateString()}
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center p-4 bg-white dark:bg-dark-20 rounded-lg shadow-sm">
                                  <input
                                    type="checkbox"
                                    checked={selectedJobs.includes(job.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedJobs([...selectedJobs, job.id]);
                                      } else {
                                        setSelectedJobs(selectedJobs.filter(id => id !== job.id));
                                      }
                                    }}
                                    className="w-4 h-4 text-primary-10 bg-gray-100 border-gray-300 rounded focus:ring-primary-10 dark:focus:ring-primary-10 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mr-4"
                                  />
                                  <div className="flex-1 cursor-pointer" onClick={() => handleCardClick(job)}>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{job.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.company_name} • {job.job_type}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-900 dark:text-white">{job.salary}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Saved {new Date(job.savedDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Export Options */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Export your saved jobs</span>
                            <div className="flex gap-3">
                              <button className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                                Export as PDF
                              </button>
                              <button className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                                Export as CSV
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'applied' && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Applied Jobs</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              Track your job applications ({mockAppliedJobs.length})
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <Select
                              value={{ label: 'All Status', value: 'all' }}
                              onChange={() => { }}
                              options={[
                                { label: 'All Status', value: 'all' },
                                { label: 'Applied', value: 'applied' },
                                { label: 'Viewed', value: 'viewed' },
                                { label: 'Interview', value: 'interview' },
                                { label: 'Rejected', value: 'rejected' },
                                { label: 'Accepted', value: 'accepted' }
                              ]}
                              placeholder="Filter by status"
                            />

                            <input
                              type="date"
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-10 focus:border-transparent"
                              placeholder="Filter by date"
                            />
                          </div>
                        </div>

                        {/* Timeline View */}
                        <div className="space-y-6">
                          {mockAppliedJobs.map((job, index) => (
                            <div key={job.id} className="relative">
                              {/* Timeline line */}
                              {index < mockAppliedJobs.length - 1 && (
                                <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-300 dark:bg-gray-600"></div>
                              )}

                              <div className="flex items-start gap-4">
                                {/* Timeline dot */}
                                <div className="flex-shrink-0 w-12 h-12 bg-primary-10 rounded-full flex items-center justify-center text-white font-bold">
                                  {index + 1}
                                </div>

                                {/* Job Card */}
                                <div className="flex-1 bg-white dark:bg-dark-20 rounded-lg shadow-sm p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {job.title}
                                      </h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {job.company_name} • {job.salary}
                                      </p>
                                    </div>

                                    {/* Status Badge */}
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'Applied'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        : job.status === 'Interview'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                      }`}>
                                      {job.status}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>Applied {new Date(job.appliedDate).toLocaleDateString()}</span>
                                    <button
                                      onClick={() => handleCardClick(job)}
                                      className="text-primary-10 hover:text-primary-15 font-medium transition-colors"
                                    >
                                      View Details
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'hidden' && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hidden Jobs</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              Jobs you've hidden from recommendations (2)
                            </p>
                          </div>
                          <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                            Unhide All
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Product Manager</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Amazon • Full Time • $150K/year</p>
                                <div className="inline-flex items-center px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-full">
                                  Not interested in management roles
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                Unhide
                              </button>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Sales Manager</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Microsoft • Full Time • $130K/year</p>
                                <div className="inline-flex items-center px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-full">
                                  Not interested in sales positions
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                Unhide
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Note:</strong> Hidden jobs will be automatically deleted after 30 days.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'searches' && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Saved Searches</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              Your saved filter combinations (3)
                            </p>
                          </div>
                          <button className="px-4 py-2 bg-primary-10 text-white rounded-lg hover:bg-primary-15 transition-colors">
                            Create New Search
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white hover:text-primary-10 dark:hover:text-primary-10 transition-colors cursor-pointer">Senior Developer Roles</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Position: Senior Software Engineer • Location: Remote • Salary: $120K+
                                </p>
                              </div>
                              <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
                                5 new jobs
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <button className="inline-flex items-center px-4 py-2 bg-primary-10 text-white text-sm font-medium rounded-md hover:bg-primary-15 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-10 focus:ring-offset-2">
                                Run Search
                              </button>
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-300 text-primary-10 focus:ring-primary-10" />
                                <span className="text-gray-700 dark:text-gray-300">Email alerts</span>
                              </label>
                              <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium transition-colors">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
                                Delete
                              </button>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white hover:text-primary-10 dark:hover:text-primary-10 transition-colors cursor-pointer">Frontend Positions</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Position: Frontend Developer • Location: San Francisco • Experience: Mid Level
                                </p>
                              </div>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                                2 new jobs
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <button className="inline-flex items-center px-4 py-2 bg-primary-10 text-white text-sm font-medium rounded-md hover:bg-primary-15 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-10 focus:ring-offset-2">
                                Run Search
                              </button>
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-300 text-primary-10 focus:ring-primary-10" defaultChecked />
                                <span className="text-gray-700 dark:text-gray-300">Email alerts</span>
                              </label>
                              <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium transition-colors">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'viewed' && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recently Viewed</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              Jobs you've viewed in the last 50 days (8)
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                              Clear History
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-4 opacity-60 hover:opacity-100 transition-opacity">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Senior Software Engineer</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Meta • Full Time • $140K/year</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Viewed 2 hours ago</p>
                                <div className="flex gap-1 mt-1">
                                  <button className="px-2 py-1 bg-primary-10 text-white rounded text-xs hover:bg-primary-15 transition-colors">
                                    Save
                                  </button>
                                  <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                    Hide
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-4 opacity-60 hover:opacity-100 transition-opacity">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Frontend Developer</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Netflix • Full Time • $125K/year</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Viewed 1 day ago</p>
                                <div className="flex gap-1 mt-1">
                                  <button className="px-2 py-1 bg-primary-10 text-white rounded text-xs hover:bg-primary-15 transition-colors">
                                    Save
                                  </button>
                                  <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                    Hide
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'settings' && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Account Settings</h3>

                        <div className="space-y-6">
                          {/* Profile Section */}
                          <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6">
                            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Full Name
                                </label>
                                <input
                                  type="text"
                                  defaultValue="John Doe"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-10 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  defaultValue="john.doe@example.com"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-10 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Phone
                                </label>
                                <input
                                  type="tel"
                                  defaultValue="+1 (555) 123-4567"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-10 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Location
                                </label>
                                <input
                                  type="text"
                                  defaultValue="San Francisco, CA"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-10 focus:border-transparent"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Job Preferences */}
                          <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6">
                            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Job Preferences</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Desired Salary Range
                                </label>
                                <input
                                  type="text"
                                  defaultValue="$120,000 - $160,000"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-10 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Preferred Job Types
                                </label>
                                <Select
                                  value={{ label: 'Full Time', value: 'full-time' }}
                                  onChange={() => { }}
                                  options={[
                                    { label: 'Full Time', value: 'full-time' },
                                    { label: 'Part Time', value: 'part-time' },
                                    { label: 'Contract', value: 'contract' }
                                  ]}
                                  placeholder="Select job type"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Preferred Locations
                                </label>
                                <input
                                  type="text"
                                  defaultValue="Remote, San Francisco"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-10 focus:border-transparent"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Privacy & Data */}
                          <div className="bg-white dark:bg-dark-20 rounded-lg shadow-sm p-6">
                            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Privacy & Data</h4>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">Data Visibility</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Control who can see your profile</p>
                                </div>
                                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                  <option>Private</option>
                                  <option>Public</option>
                                </select>
                              </div>

                              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Export Your Data</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                  Download all your data including applications, saved jobs, and search history.
                                </p>
                                <button className="px-4 py-2 bg-primary-10 text-white rounded-lg hover:bg-primary-15 transition-colors">
                                  Export as JSON
                                </button>
                              </div>

                              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h5 className="font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                  Permanently delete your account and all associated data.
                                </p>
                                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                  Delete Account
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-4">
                            <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              Cancel
                            </button>
                            <button className="px-6 py-2 bg-primary-10 text-white rounded-lg hover:bg-primary-15 transition-colors">
                              Save Changes
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <JobDetailsModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            job={selectedJob}
          />
        </div>
        <Footer />
      </Container>
    </ProtectedRoute>
  );
};

export default Dashboard;