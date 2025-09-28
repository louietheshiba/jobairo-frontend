

import React, { useState } from 'react';
import { Meta } from '@/layouts/Meta';
import JobDetailsModal from '@/components/Modals/JobDetail';
import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';
import DashboardStats from '@/components/Dashboard/DashboardStats';
import DashboardContent from '@/components/Dashboard/DashboardContent';
import { ProfileProvider } from '@/context/ProfileContext';
import type { Job } from '@/types/JobTypes';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Container from '@/layouts/Container';

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
      <ProfileProvider user={user}>
        <Container>

          <Meta title="Dashboard - Job Airo" description="Job Airo Dashboard" />
          <div className="min-h-screen bg-gray-50 dark:bg-dark-25 font-poppins">
            <div className="flex min-h-screen">
              <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

              {/* Main Content */}
              <div className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
                <div className="max-w-6xl mx-auto">
                  <DashboardStats />

                  <DashboardContent
                    activeTab={activeTab}
                    mockRecommendedJobs={mockRecommendedJobs}
                    mockAppliedJobs={mockAppliedJobs}
                    mockSavedJobs={mockSavedJobs}
                    onCardClick={handleCardClick}
                  />
                </div>
              </div>
            </div>

            <JobDetailsModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              job={selectedJob}
            />
          </div>
        </Container>
      </ProfileProvider>
    </ProtectedRoute>
  );
};

export default Dashboard;