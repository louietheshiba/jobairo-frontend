import type { FiltersType } from '@/types/FiltersType';

export const WORK_SCHEDULE_LIST = [
  {
    id: 1,
    label: 'Remote',
    value: 'Remote',
  },
  {
    id: 2,
    label: 'Hybrid',
    value: 'Hybrid',
  },
  {
    id: 3,
    label: 'On-Site',
    value: 'On-Site',
  },
];

export const EDUCATION_LIST = [
  {
    id: 1,
    label: 'All Education Levels',
    value: 'All Education Levels',
  },
  {
    id: 2,
    label: 'High school degree',
    value: 'High school degree',
  },
  {
    id: 3,
    label: 'Associate degree',
    value: 'Associate degree',
  },
  {
    id: 4,
    label: `Bachelor's degree`,
    value: `Bachelor's degree`,
  },
  {
    id: 5,
    label: `Master’s degree`,
    value: `Master’s degree`,
  },
  {
    id: 6,
    label: 'Doctoral degree',
    value: 'Doctoral degree',
  },
];

export const EXPERIENCE_LEVEL_LIST = [
  { id: 1, label: 'No Prior Experience', value: 'No Prior Experience' },
  { id: 2, label: 'Entry Level', value: 'Entry Level' },
  { id: 3, label: 'Mid Level', value: 'Mid Level' },
  { id: 4, label: 'Senior Level', value: 'Senior Level' },
];

export const JOB_TYPE_LIST = [
  { id: 1, label: 'Full-time', value: 'Full-time' },
  { id: 2, label: 'Part-time', value: 'Part-time' },
  { id: 3, label: 'Contractor', value: 'Contractor' },
  { id: 4, label: 'Temporary', value: 'Temporary' },
  { id: 5, label: 'Intern', value: 'Intern' },
  { id: 6, label: 'Volunteer', value: 'Volunteer' },
];

export const RELEVANCE_LIST = [
  { id: 1, label: 'Relevance', value: '' },
  { id: 2, label: 'No Relevance', value: '' },
  { id: 3, label: 'Most Recent', value: 'Most Recent' },
  { id: 4, label: 'Oldest', value: 'Oldest' },
  { id: 5, label: 'Highest Salary', value: 'Highest Salary' },
  { id: 6, label: 'Least Experience', value: 'Least Experience' },
];

export const DATE_POSTED_LIST = [
  { id: 8, label: 'Date Posted', value: '' },
  { id: 9, label: 'No Date Filter', value: '' },
  { id: 1, label: '24hrs', value: '24hrs' },
  { id: 2, label: '2 days', value: '2 days' },
  { id: 3, label: '4 days', value: '4 days' },
  { id: 4, label: '7 days', value: '7 days' },
  { id: 5, label: '30 days', value: '30 days' },
  { id: 6, label: '60 days', value: '60 days' },
  { id: 7, label: '90 days', value: '90 days' },
];

export const MARK_JOBS_LIST = [
  { id: 4, label: 'No Marked Jobs Filter', value: '' },
  { id: 1, label: 'Exclude Saved jobs', value: 'Exclude Saved jobs' },
  { id: 2, label: 'Exclude applied jobs', value: 'Exclude applied jobs' },
  { id: 3, label: 'Exclude viewed jobs', value: 'Exclude viewed jobs' },
];

export const COMPANY_SIZE_LIST = [
  { id: 1, label: '1-10 employees', value: '1-10 employees' },
  { id: 2, label: '11-50 employees', value: '11-50 employees' },
  { id: 3, label: '51-200 employees', value: '51-200 employees' },
  { id: 4, label: '201-500 employees', value: '201-500 employees' },
  { id: 5, label: '501-1000 employees', value: '501-1000 employees' },
  { id: 6, label: '1000+ employees', value: '1000+ employees' },
];

export const INITIAL_FILTERS: FiltersType = {
  position: '',
  locations: [],
  workSchedule: [],
  jobType: '',
  company: '',
  datePosted: DATE_POSTED_LIST[0]?.label || '',
  education: '',
  experienceLevel: '',
  relevance: RELEVANCE_LIST[0]?.label || '',
  markedJobs: [],
  companySize: '',
  salaryRange: null,
};

export const SUGGETIONS = [
  {
    id: 1,
    label: 'software engineer',
    value: 'software engineer',
  },
  {
    id: 2,
    label: 'senior associate',
    value: 'senior associate',
  },
  {
    id: 3,
    label: 'senior software engineer',
    value: 'senior software engineer',
  },
  {
    id: 4,
    label: 'manager',
    value: 'manager',
  },
  {
    id: 5,
    label: 'assistant manager',
    value: 'assistant manager',
  },
  {
    id: 6,
    label: 'senior manager',
    value: 'senior manager',
  },
  {
    id: 7,
    label: 'senior engineer',
    value: 'senior engineer',
  },
  {
    id: 8,
    label: 'analyst',
    value: 'analyst',
  },
  {
    id: 9,
    label: 'senior analyst',
    value: 'senior analyst',
  },
  {
    id: 10,
    label: 'data engineer',
    value: 'data engineer',
  },
  {
    id: 11,
    label: 'senior consultant',
    value: 'senior consultant',
  },
  {
    id: 12,
    label: 'associate',
    value: 'associate',
  },
  {
    id: 13,
    label: 'consultant',
    value: 'consultant',
  },
  {
    id: 14,
    label: 'relationship manager',
    value: 'relationship manager',
  },
  {
    id: 15,
    label: 'software developer',
    value: 'software developer',
  },
  {
    id: 16,
    label: 'software development engineer',
    value: 'software development engineer',
  },
  {
    id: 17,
    label: 'project manager',
    value: 'project manager',
  },
  {
    id: 18,
    label: 'customer sales executive',
    value: 'customer sales executive',
  },
  {
    id: 19,
    label: 'business analyst',
    value: 'business analyst',
  },
  {
    id: 20,
    label: 'executive',
    value: 'executive',
  },
  {
    id: 21,
    label: 'lead software engineer',
    value: 'lead software engineer',
  },
  {
    id: 22,
    label: 'product manager',
    value: 'product manager',
  },
  {
    id: 23,
    label: 'team leader',
    value: 'team leader',
  },
  {
    id: 24,
    label: 'sales manager',
    value: 'sales manager',
  },
  {
    id: 25,
    label: 'staff software engineer',
    value: 'staff software engineer',
  },
  {
    id: 26,
    label: 'engineer',
    value: 'engineer',
  },
  {
    id: 27,
    label: 'deputy manager',
    value: 'deputy manager',
  },
  {
    id: 28,
    label: 'vice president',
    value: 'vice president',
  },
  {
    id: 29,
    label: 'acquisition manager',
    value: 'acquisition manager',
  },
  {
    id: 30,
    label: 'application developer',
    value: 'application developer',
  },
  {
    id: 31,
    label: 'full stack developer',
    value: 'full stack developer',
  },
  {
    id: 32,
    label: 'data scientist',
    value: 'data scientist',
  },
  {
    id: 33,
    label: 'engineering manager',
    value: 'engineering manager',
  },
  {
    id: 34,
    label: 'devops engineer',
    value: 'devops engineer',
  },
  {
    id: 35,
    label: 'associate consultant',
    value: 'associate consultant',
  },
  {
    id: 36,
    label: 'associate director',
    value: 'associate director',
  },
  {
    id: 37,
    label: 'associate manager',
    value: 'associate manager',
  },
  {
    id: 38,
    label: 'java developer',
    value: 'java developer',
  },
  {
    id: 39,
    label: 'director',
    value: 'director',
  },
  {
    id: 40,
    label: 'premier acquisition manager',
    value: 'premier acquisition manager',
  },
  {
    id: 41,
    label: 'customer service representative',
    value: 'customer service representative',
  },
  {
    id: 42,
    label: 'data analyst',
    value: 'data analyst',
  },
  {
    id: 43,
    label: 'business advisor',
    value: 'business advisor',
  },
  {
    id: 44,
    label: 'principal engineer',
    value: 'principal engineer',
  },
  {
    id: 45,
    label: 'lead engineer',
    value: 'lead engineer',
  },
  {
    id: 46,
    label: 'senior executive',
    value: 'senior executive',
  },
  {
    id: 47,
    label: 'technical lead',
    value: 'technical lead',
  },
  {
    id: 48,
    label: 'area sales manager',
    value: 'area sales manager',
  },
  {
    id: 49,
    label: 'shift supervisor',
    value: 'shift supervisor',
  },
  {
    id: 50,
    label: 'senior developer',
    value: 'senior developer',
  },
  {
    id: 51,
    label: 'senior data engineer',
    value: 'senior data engineer',
  },
  {
    id: 52,
    label: 'barista',
    value: 'barista',
  },
  {
    id: 53,
    label: 'solution architect',
    value: 'solution architect',
  },
  {
    id: 54,
    label: 'apprentice',
    value: 'apprentice',
  },
  {
    id: 55,
    label: 'sales executive',
    value: 'sales executive',
  },
  {
    id: 56,
    label: 'team lead',
    value: 'team lead',
  },
  {
    id: 57,
    label: 'sap consultant',
    value: 'sap consultant',
  },
  {
    id: 58,
    label: 'site reliability engineer',
    value: 'site reliability engineer',
  },
  {
    id: 59,
    label: 'salesforce developer',
    value: 'salesforce developer',
  },
  {
    id: 60,
    label: 'officer',
    value: 'officer',
  },
  {
    id: 61,
    label: 'senior specialist',
    value: 'senior specialist',
  },
  {
    id: 62,
    label: 'technical support engineer',
    value: 'technical support engineer',
  },
  {
    id: 63,
    label: 'branch manager',
    value: 'branch manager',
  },
  {
    id: 64,
    label: 'staff engineer',
    value: 'staff engineer',
  },
  {
    id: 65,
    label: 'principal software engineer',
    value: 'principal software engineer',
  },
  {
    id: 66,
    label: 'assurance associate',
    value: 'assurance associate',
  },
  {
    id: 67,
    label: 'customer service executive',
    value: 'customer service executive',
  },
  {
    id: 68,
    label: 'data science lead',
    value: 'data science lead',
  },
  {
    id: 69,
    label: 'account manager',
    value: 'account manager',
  },
  {
    id: 70,
    label: 'project engineer',
    value: 'project engineer',
  },
  {
    id: 71,
    label: 'quality engineer',
    value: 'quality engineer',
  },
  {
    id: 72,
    label: 'design engineer',
    value: 'design engineer',
  },
  {
    id: 73,
    label: 'senior product manager',
    value: 'senior product manager',
  },
  {
    id: 74,
    label: 'senior software developer',
    value: 'senior software developer',
  },
  {
    id: 75,
    label: 'technical leader',
    value: 'technical leader',
  },
  {
    id: 76,
    label: 'principal consultant',
    value: 'principal consultant',
  },
  {
    id: 77,
    label: 'account executive',
    value: 'account executive',
  },
  {
    id: 78,
    label: 'development engineer',
    value: 'development engineer',
  },
  {
    id: 79,
    label: 'financial analyst',
    value: 'financial analyst',
  },
  {
    id: 80,
    label: 'business development manager',
    value: 'business development manager',
  },
  {
    id: 81,
    label: 'operations analyst',
    value: 'operations analyst',
  },
  {
    id: 82,
    label: 'security engineer',
    value: 'security engineer',
  },
  {
    id: 83,
    label: 'application lead',
    value: 'application lead',
  },
  {
    id: 84,
    label: 'network engineer',
    value: 'network engineer',
  },
  {
    id: 85,
    label: 'qa engineer',
    value: 'qa engineer',
  },
  {
    id: 86,
    label: 'key account manager',
    value: 'key account manager',
  },
  {
    id: 87,
    label: 'project consultant',
    value: 'project consultant',
  },
  {
    id: 88,
    label: 'application engineer',
    value: 'application engineer',
  },
  {
    id: 89,
    label: 'product owner',
    value: 'product owner',
  },
  {
    id: 90,
    label: 'territory sales manager',
    value: 'territory sales manager',
  },
  {
    id: 91,
    label: 'program manager',
    value: 'program manager',
  },
  {
    id: 92,
    label: 'senior devops engineer',
    value: 'senior devops engineer',
  },
  {
    id: 93,
    label: 'store manager',
    value: 'store manager',
  },
  {
    id: 94,
    label: 'systems engineer',
    value: 'systems engineer',
  },
  {
    id: 95,
    label: 'branch relationship manager',
    value: 'branch relationship manager',
  },
  {
    id: 96,
    label: 'technical architect',
    value: 'technical architect',
  },
  {
    id: 97,
    label: 'senior data scientist',
    value: 'senior data scientist',
  },
  {
    id: 98,
    label: 'service officer',
    value: 'service officer',
  },
  {
    id: 99,
    label: 'area manager',
    value: 'area manager',
  },
  {
    id: 100,
    label: 'machine learning engineer',
    value: 'machine learning engineer',
  },
];

