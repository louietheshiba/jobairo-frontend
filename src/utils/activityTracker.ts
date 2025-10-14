interface JobActivity {
  jobId: string;
  action: 'view' | 'save' | 'hide' | 'search';
  timestamp: number;
  jobData?: {
    title?: string;
    location?: string;
    company?: string;
    category?: string;
    employmentType?: string;
    reason?: string; // For hide actions
    description?: string;
    salary_range?: string;
    experience_level?: string;
    required_skills?: string;
    benefits?: string;
    department?: string;
    remote_type?: string;
    application_url?: string;
    date_posted?: string;
    status?: string;
  };
}

interface UserActivityData {
  userId?: string;
  activities: JobActivity[];
  lastUpdated: number;
}

class ActivityTracker {
  private storageKey = 'jobAiro_user_activity';
  private maxActivities = 100; // Limit stored activities

  // Track a job action
  trackActivity(jobId: string, action: 'view' | 'save' | 'hide' | 'search', jobData?: any): void {
    try {
      const activityData = this.getActivityData();
      const activity: JobActivity = {
        jobId,
        action,
        timestamp: Date.now(),
        jobData: jobData ? {
          title: jobData.title,
          location: jobData.location,
          company: jobData.company?.name || jobData.company, // Handle both object and string formats
          category: jobData.category || jobData.job_category,
          employmentType: jobData.employment_type,
          description: jobData.description,
          salary_range: jobData.salary_range,
          experience_level: jobData.experience_level,
          required_skills: jobData.required_skills,
          benefits: jobData.benefits,
          department: jobData.department,
          remote_type: jobData.remote_type,
          application_url: jobData.application_url,
          date_posted: jobData.date_posted,
          status: jobData.status
        } : undefined
      };

      // For hide actions, include reason if provided
      if (action === 'hide' && jobData?.reason) {
        activity.jobData = { ...activity.jobData, reason: jobData.reason };
      }

      // Remove duplicate actions for same job (keep most recent)
      activityData.activities = activityData.activities.filter(
        a => !(a.jobId === jobId && a.action === action)
      );

      // Add new activity
      activityData.activities.unshift(activity);

      // Limit the number of stored activities
      if (activityData.activities.length > this.maxActivities) {
        activityData.activities = activityData.activities.slice(0, this.maxActivities);
      }

      activityData.lastUpdated = Date.now();
      this.saveActivityData(activityData);

      console.log(`Tracked ${action} activity for job ${jobId}:`, activity.jobData);
    } catch (error) {
      console.warn('Failed to track activity:', error);
    }
  }

  // Get user's activity data
  getActivityData(): UserActivityData {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load activity data:', error);
    }

    return {
      activities: [],
      lastUpdated: Date.now()
    };
  }

  // Save activity data to localStorage
  private saveActivityData(data: UserActivityData): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save activity data:', error);
    }
  }

  // Get recommended jobs based on user behavior
  getRecommendedJobs(allJobs: any[]): any[] {
    const activityData = this.getActivityData();
    console.log('Activity data:', activityData.activities.length, 'activities');

    if (activityData.activities.length === 0) {
      console.log('No activities found, returning empty recommendations');
      return [];
    }

    // Analyze user preferences
    const preferences = this.analyzePreferences(activityData.activities);
    console.log('User preferences:', {
      locations: Array.from(preferences.locations.keys()),
      categories: Array.from(preferences.categories.keys()),
      hiddenJobs: preferences.hiddenJobIds.size,
      savedJobs: preferences.savedJobIds.size
    });

    // Score jobs based on preferences
    const scoredJobs = allJobs.map(job => ({
      ...job,
      recommendationScore: this.calculateRecommendationScore(job, preferences)
    }));

    const filteredJobs = scoredJobs.filter(job => job.recommendationScore > 0);
    console.log('Jobs with score > 0:', filteredJobs.length, 'from', allJobs.length);

    // Sort by recommendation score and return top recommendations
    const recommendedJobs = filteredJobs
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 10); // Return top 10 recommendations

    console.log('Final recommendations:', recommendedJobs.map(j => ({ id: j.id, score: j.recommendationScore, title: j.title?.substring(0, 30) })));
    return recommendedJobs;
  }

  // Analyze user preferences from activities
  private analyzePreferences(activities: JobActivity[]) {
    const preferences = {
      locations: new Map<string, number>(),
      categories: new Map<string, number>(),
      companies: new Map<string, number>(),
      employmentTypes: new Map<string, number>(),
      departments: new Map<string, number>(),
      experienceLevels: new Map<string, number>(),
      remoteTypes: new Map<string, number>(),
      salaryRanges: new Map<string, number>(),
      viewedJobIds: new Set<string>(),
      savedJobIds: new Set<string>(),
      hiddenJobIds: new Set<string>(),
      notInterestedJobIds: new Set<string>()
    };

    activities.forEach(activity => {
      if (activity.jobData) {
        // Track locations
        if (activity.jobData.location) {
          preferences.locations.set(
            activity.jobData.location,
            (preferences.locations.get(activity.jobData.location) || 0) + 1
          );
        }

        // Track categories
        if (activity.jobData.category) {
          preferences.categories.set(
            activity.jobData.category,
            (preferences.categories.get(activity.jobData.category) || 0) + 1
          );
        }

        // Track companies
        if (activity.jobData.company) {
          preferences.companies.set(
            activity.jobData.company,
            (preferences.companies.get(activity.jobData.company) || 0) + 1
          );
        }

        // Track employment types
        if (activity.jobData.employmentType) {
          preferences.employmentTypes.set(
            activity.jobData.employmentType,
            (preferences.employmentTypes.get(activity.jobData.employmentType) || 0) + 1
          );
        }

        // Track departments
        if (activity.jobData.department) {
          preferences.departments.set(
            activity.jobData.department,
            (preferences.departments.get(activity.jobData.department) || 0) + 1
          );
        }

        // Track experience levels
        if (activity.jobData.experience_level) {
          preferences.experienceLevels.set(
            activity.jobData.experience_level,
            (preferences.experienceLevels.get(activity.jobData.experience_level) || 0) + 1
          );
        }

        // Track remote types
        if (activity.jobData.remote_type) {
          preferences.remoteTypes.set(
            activity.jobData.remote_type,
            (preferences.remoteTypes.get(activity.jobData.remote_type) || 0) + 1
          );
        }

        // Track salary ranges (simplified)
        if (activity.jobData.salary_range) {
          const salaryKey = activity.jobData.salary_range.split(' - ')[0] || activity.jobData.salary_range;
          preferences.salaryRanges.set(
            salaryKey,
            (preferences.salaryRanges.get(salaryKey) || 0) + 1
          );
        }
      }

      // Track job IDs by action type
      switch (activity.action) {
        case 'view':
          preferences.viewedJobIds.add(activity.jobId);
          break;
        case 'save':
          preferences.savedJobIds.add(activity.jobId);
          break;
        case 'hide':
          preferences.hiddenJobIds.add(activity.jobId);
          // Check if this is a "not interested" hide
          if (activity.jobData?.reason === 'not_interested') {
            preferences.notInterestedJobIds.add(activity.jobId);
          }
          break;
      }
    });

    console.log('Analyzed preferences:', {
      locations: Array.from(preferences.locations.keys()),
      categories: Array.from(preferences.categories.keys()),
      companies: Array.from(preferences.companies.keys()),
      employmentTypes: Array.from(preferences.employmentTypes.keys()),
      savedJobs: preferences.savedJobIds.size,
      hiddenJobs: preferences.hiddenJobIds.size,
      notInterestedJobs: preferences.notInterestedJobIds.size
    });

    return preferences;
  }

  // Calculate recommendation score for a job
  private calculateRecommendationScore(job: any, preferences: any): number {
    let score = 0;

    // Don't recommend jobs the user has already hidden
    if (preferences.hiddenJobIds.has(job.id)) {
      return 0;
    }

    // Don't recommend jobs marked as "not interested"
    if (preferences.notInterestedJobIds.has(job.id)) {
      return 0;
    }

    // Boost score for jobs from preferred locations
    if (job.location && preferences.locations.has(job.location)) {
      score += preferences.locations.get(job.location) * 3;
    }

    // Boost score for jobs in preferred categories
    const jobCategory = job.category || job.job_category;
    if (jobCategory && preferences.categories.has(jobCategory)) {
      score += preferences.categories.get(jobCategory) * 4;
    }

    // Boost score for jobs from preferred companies
    const jobCompany = typeof job.company === 'object' ? job.company?.name : job.company;
    if (jobCompany && preferences.companies.has(jobCompany)) {
      score += preferences.companies.get(jobCompany) * 2;
    }

    // Boost score for preferred employment types
    const jobEmploymentType = job.employment_type;
    if (jobEmploymentType && preferences.employmentTypes.has(jobEmploymentType)) {
      score += preferences.employmentTypes.get(jobEmploymentType) * 2;
    }

    // Don't recommend jobs that are already saved (they appear in saved jobs tab)
    if (preferences.savedJobIds.has(job.id)) {
      return 0; // Don't show saved jobs in recommendations
    }

    // Slightly boost score for jobs similar to viewed jobs
    if (preferences.viewedJobIds.has(job.id)) {
      score += 1;
    }

    // Recency boost - prefer recently active jobs
    const daysSincePosted = job.date_posted ?
      Math.floor((Date.now() - new Date(job.date_posted).getTime()) / (1000 * 60 * 60 * 24)) : 30;
    if (daysSincePosted <= 7) {
      score += 2; // Boost recent jobs
    }

    return score;
  }

  // Clear all activity data
  clearActivityData(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear activity data:', error);
    }
  }

  // Set user ID (when user logs in)
  setUserId(userId: string): void {
    const activityData = this.getActivityData();
    activityData.userId = userId;
    this.saveActivityData(activityData);
  }

  // Get activity statistics
  getActivityStats() {
    const activityData = this.getActivityData();
    const stats = {
      totalViews: 0,
      totalSaves: 0,
      totalHides: 0,
      totalSearches: 0,
      uniqueJobsViewed: new Set<string>(),
      uniqueJobsSaved: new Set<string>(),
      topLocations: [] as Array<{location: string, count: number}>,
      topCategories: [] as Array<{category: string, count: number}>
    };

    activityData.activities.forEach(activity => {
      switch (activity.action) {
        case 'view':
          stats.totalViews++;
          stats.uniqueJobsViewed.add(activity.jobId);
          break;
        case 'save':
          stats.totalSaves++;
          stats.uniqueJobsSaved.add(activity.jobId);
          break;
        case 'hide':
          stats.totalHides++;
          break;
        case 'search':
          stats.totalSearches++;
          break;
      }
    });

    // Calculate top locations and categories
    const locationMap = new Map<string, number>();
    const categoryMap = new Map<string, number>();

    activityData.activities.forEach(activity => {
      if (activity.jobData) {
        if (activity.jobData.location) {
          locationMap.set(activity.jobData.location, (locationMap.get(activity.jobData.location) || 0) + 1);
        }
        if (activity.jobData.category) {
          categoryMap.set(activity.jobData.category, (categoryMap.get(activity.jobData.category) || 0) + 1);
        }
      }
    });

    stats.topLocations = Array.from(locationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    stats.topCategories = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return stats;
  }
}

// Export singleton instance
export const activityTracker = new ActivityTracker();