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
          company: jobData.company,
          category: jobData.category || jobData.job_category,
          employmentType: jobData.employment_type
        } : undefined
      };

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
    if (activityData.activities.length === 0) {
      return [];
    }

    // Analyze user preferences
    const preferences = this.analyzePreferences(activityData.activities);

    // Score jobs based on preferences
    const scoredJobs = allJobs.map(job => ({
      ...job,
      recommendationScore: this.calculateRecommendationScore(job, preferences, activityData.activities)
    }));

    // Sort by recommendation score and return top recommendations
    return scoredJobs
      .filter(job => job.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 10); // Return top 10 recommendations
  }

  // Analyze user preferences from activities
  private analyzePreferences(activities: JobActivity[]) {
    const preferences = {
      locations: new Map<string, number>(),
      categories: new Map<string, number>(),
      companies: new Map<string, number>(),
      employmentTypes: new Map<string, number>(),
      viewedJobIds: new Set<string>(),
      savedJobIds: new Set<string>(),
      hiddenJobIds: new Set<string>()
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
          break;
      }
    });

    return preferences;
  }

  // Calculate recommendation score for a job
  private calculateRecommendationScore(job: any, preferences: any, _activities: JobActivity[]): number {
    let score = 0;

    // Don't recommend jobs the user has already hidden
    if (preferences.hiddenJobIds.has(job.id)) {
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
    if (job.company && preferences.companies.has(job.company)) {
      score += preferences.companies.get(job.company) * 2;
    }

    // Boost score for preferred employment types
    const jobEmploymentType = job.employment_type;
    if (jobEmploymentType && preferences.employmentTypes.has(jobEmploymentType)) {
      score += preferences.employmentTypes.get(jobEmploymentType) * 2;
    }

    // Boost score for jobs similar to saved jobs
    if (preferences.savedJobIds.has(job.id)) {
      score += 10; // High boost for saved jobs
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