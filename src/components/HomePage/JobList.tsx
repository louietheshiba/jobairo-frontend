import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

import type { Job, JobListProps } from '@/types/JobTypes';

import JobDetailsModal from '../Modals/JobDetail';
import { Button } from '../ui/button';
import JobListCard from '../ui/jobListCard';

const JobList = ({ filters, handleChange }: JobListProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<null | Job>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobsPerPage = 20;

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        console.log('Fetching jobs from API...');
        const offset = (currentPage - 1) * jobsPerPage;
        const response = await fetch(`/api/jobs?limit=${jobsPerPage}&offset=${offset}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Jobs API response:', data);
        console.log('Jobs array:', data.jobs);
        console.log('Total count:', data.total);

        // If no jobs in database, show sample data for demonstration
        if (!data.jobs || data.jobs.length === 0) {
          console.log('No jobs in database, showing sample data for demonstration');
          // Sample jobs for demonstration
          const sampleJobs: Job[] = [
            {
              id: '1',
              company_id: '1',
              title: 'Senior Software Engineer',
              description: 'Design and maintain CI/CD pipelines, infrastructure as code, and monitoring systems.',
              location: 'Remote, US',
              employment_type: 'Full-time',
              remote_type: 'Remote',
              salary_range: '$120K - $160K',
              status: 'open',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              company: { id: '1', name: 'Tech Corp', size: 'large' }
            },
            {
              id: '2',
              company_id: '2',
              title: 'Frontend Developer',
              description: 'Build performant, accessible web applications using React, TypeScript, and modern CSS.',
              location: 'San Francisco, CA',
              employment_type: 'Full-time',
              remote_type: 'Hybrid',
              salary_range: '$90K - $120K',
              status: 'open',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              company: { id: '2', name: 'Startup Inc', size: 'small' }
            },
            {
              id: '3',
              company_id: '3',
              title: 'Data Scientist',
              description: 'Apply machine learning to personalize recommendations for millions of users.',
              location: 'New York, NY',
              employment_type: 'Full-time',
              remote_type: 'On-site',
              salary_range: '$110K - $140K',
              status: 'open',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              company: { id: '3', name: 'Data Co', size: 'medium' }
            },
            {
              id: '4',
              company_id: '4',
              title: 'Product Manager',
              description: 'Lead product strategy and roadmap for our core platform features.',
              location: 'Remote, Global',
              employment_type: 'Full-time',
              remote_type: 'Remote',
              salary_range: '$130K - $170K',
              status: 'open',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              company: { id: '4', name: 'Product Ltd', size: 'large' }
            },
            {
              id: '5',
              company_id: '5',
              title: 'DevOps Engineer',
              description: 'Manage cloud infrastructure and deployment pipelines for scalable applications.',
              location: 'Austin, TX',
              employment_type: 'Full-time',
              remote_type: 'Hybrid',
              salary_range: '$100K - $130K',
              status: 'open',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              company: { id: '5', name: 'Cloud Systems', size: 'medium' }
            },
            {
              id: '6',
              company_id: '6',
              title: 'UX Designer',
              description: 'Create intuitive user experiences for our mobile and web applications.',
              location: 'Remote, US',
              employment_type: 'Contract',
              remote_type: 'Remote',
              salary_range: '$85K - $115K',
              status: 'open',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              company: { id: '6', name: 'Design Studio', size: 'small' }
            }
          ];

          // Simulate pagination with sample data
          const startIndex = offset;
          const endIndex = startIndex + jobsPerPage;
          const paginatedJobs = sampleJobs.slice(startIndex, endIndex);

          setJobs(paginatedJobs);
          setTotalJobs(sampleJobs.length);
        } else {
          setJobs(data.jobs || []);
          setTotalJobs(data.total || 0);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobs([]);
        setTotalJobs(0);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [currentPage]);

  const handleCardClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const getActiveFilters = () => {
    const active = [];
    if (filters.locations.length) active.push(...filters.locations.map(loc => ({ key: 'locations', value: loc.value, label: `Location: ${loc.label}` })));
    if (filters.jobType) active.push({ key: 'jobType', value: filters.jobType, label: `Job Type: ${filters.jobType}` });
    if (filters.companySize) active.push({ key: 'companySize', value: filters.companySize, label: `Company Size: ${filters.companySize}` });
    if (filters.salaryRange) active.push({ key: 'salaryRange', value: filters.salaryRange, label: `Salary: $${filters.salaryRange[0]}k - $${filters.salaryRange[1]}k` });
    return active;
  };

  const handleRemoveFilter = (filter: any) => {
    if (filter.key === 'locations') {
      handleChange('locations', filters.locations.filter(loc => loc.value !== filter.value));
    } else if (filter.key === 'jobType') {
      handleChange('jobType', '');
    } else if (filter.key === 'companySize') {
      handleChange('companySize', '');
    } else if (filter.key === 'salaryRange') {
      handleChange('salaryRange', null);
    }
  };


  const activeFilters = getActiveFilters();

  return (
    <div className="px-[15px] pb-10 pt-6 sm:pb-[50px] sm:pt-[30px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 sm:gap-7">
        {/* Job count and filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {totalJobs > 0 ? `${totalJobs} jobs found` : (loading ? 'Loading jobs...' : 'No jobs found')}
            </h2>
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-10 px-3 py-1 text-sm text-white"
                  >
                    {filter.label}
                    <button
                      onClick={() => handleRemoveFilter(filter)}
                      className="ml-1 hover:text-gray-200"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-10"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading jobs...</p>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && jobs.length > 0 && (
          <>
            <div className="grid gap-5 gap-y-[30px] sm:gap-y-[50px] md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((item) => (
                <JobListCard key={item.id} item={item} onClick={handleCardClick} />
              ))}
            </div>

            {/* Pagination */}
            {totalJobs > jobsPerPage && (
              <div className="flex flex-col items-center gap-4 mt-12 mb-8">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {((currentPage - 1) * jobsPerPage) + 1}-{Math.min(currentPage * jobsPerPage, totalJobs)} of {totalJobs} jobs
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2 shadow-lg">
                  {/* Previous Button */}
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="!px-4 !py-2.5 !bg-gray-50 !text-gray-700 !border !border-gray-200 !rounded-lg hover:!bg-gray-100 hover:!border-gray-300 disabled:!opacity-50 disabled:!cursor-not-allowed disabled:hover:!bg-gray-50 disabled:hover:!border-gray-200 dark:!bg-gray-700 dark:!text-gray-300 dark:!border-gray-600 dark:hover:!bg-gray-600 dark:hover:!border-gray-500 transition-all duration-200"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: Math.ceil(totalJobs / jobsPerPage) }, (_, i) => i + 1)
                      .filter(page => {
                        const totalPages = Math.ceil(totalJobs / jobsPerPage);
                        // Show first page, last page, current page, and pages around current
                        return page === 1 ||
                               page === totalPages ||
                               (page >= currentPage - 1 && page <= currentPage + 1);
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 py-2 text-gray-400 dark:text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              currentPage === page
                                ? '!bg-primary-10 !text-white !border-primary-10'
                                : '!bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-50 hover:!border-gray-400 dark:!bg-gray-800 dark:!text-gray-300 dark:!border-gray-600 dark:hover:!bg-gray-700 dark:hover:!border-gray-500'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>

                  {/* Next Button */}
                  <Button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= Math.ceil(totalJobs / jobsPerPage)}
                    className="!px-4 !py-2.5 !bg-gray-50 !text-gray-700 !border !border-gray-200 !rounded-lg hover:!bg-gray-100 hover:!border-gray-300 disabled:!opacity-50 disabled:!cursor-not-allowed disabled:hover:!bg-gray-50 disabled:hover:!border-gray-200 dark:!bg-gray-700 dark:!text-gray-300 dark:!border-gray-600 dark:hover:!bg-gray-600 dark:hover:!border-gray-500 transition-all duration-200"
                  >
                   
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* No jobs found */}
        {!loading && jobs.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">No jobs found</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Try adjusting your filters</p>
            </div>
          </div>
        )}
      </div>

      <JobDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        job={selectedJob}
      />
    </div>
  );
};

export default JobList;
