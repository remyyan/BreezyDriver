import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { getRecentReviews } from './reviewService';

export interface AppStats {
  totalLocations: number;
  totalReviews: number;
  averageRating: number;
  recentSubmissions: number; // Last 7 days
}

export interface FeatureStats {
  [key: string]: number;
}

export interface UserContributionStats {
  spotsAdded: number;
  reviewsWritten: number;
  bookmarkedSpots: number;
}

export interface UserActivity {
  id: string;
  type: 'location_added' | 'review_written' | 'location_bookmarked';
  title: string;
  description: string;
  date: Date;
  locationId?: string;
  locationName?: string;
}

// Get overall app statistics
export const getAppStats = async (): Promise<AppStats> => {
  try {
    // Get total locations count
    const locationsQuery = query(
      collection(db, 'locations'),
      where('isApproved', '==', true)
    );
    const locationsSnapshot = await getCountFromServer(locationsQuery);
    const totalLocations = locationsSnapshot.data().count;

    // Get total reviews count
    const reviewsSnapshot = await getCountFromServer(collection(db, 'reviews'));
    const totalReviews = reviewsSnapshot.data().count;

    // Get recent submissions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentLocationsQuery = query(
      collection(db, 'locations'),
      where('isApproved', '==', true),
      where('submittedAt', '>=', sevenDaysAgo)
    );
    const recentLocationsSnapshot = await getDocs(recentLocationsQuery);
    const recentSubmissions = recentLocationsSnapshot.size;

    // Calculate average rating from all reviews
    let averageRating = 0;
    if (totalReviews > 0) {
      const reviewsQuery = query(collection(db, 'reviews'));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      let totalRating = 0;
      reviewsSnapshot.forEach(doc => {
        totalRating += doc.data().rating || 0;
      });
      
      averageRating = totalRating / totalReviews;
    }

    return {
      totalLocations,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      recentSubmissions
    };
  } catch (error) {
    console.error('Error fetching app stats:', error);
    return {
      totalLocations: 0,
      totalReviews: 0,
      averageRating: 0,
      recentSubmissions: 0
    };
  }
};

// Get statistics by feature type
export const getFeatureStats = async (): Promise<FeatureStats> => {
  try {
    const locationsQuery = query(
      collection(db, 'locations'),
      where('isApproved', '==', true)
    );
    const locationsSnapshot = await getDocs(locationsQuery);
    
    const featureStats: FeatureStats = {};
    
    locationsSnapshot.forEach(doc => {
      const data = doc.data();
      const features = data.features || [];
      
      features.forEach((feature: string) => {
        featureStats[feature] = (featureStats[feature] || 0) + 1;
      });
    });

    return featureStats;
  } catch (error) {
    console.error('Error fetching feature stats:', error);
    return {};
  }
};

// Get user contribution statistics
export const getUserContributionStats = async (userId: string): Promise<UserContributionStats> => {
  try {
    // Get spots added by user
    const userLocationsQuery = query(
      collection(db, 'locations'),
      where('submittedBy', '==', userId)
    );
    const userLocationsSnapshot = await getCountFromServer(userLocationsQuery);
    const spotsAdded = userLocationsSnapshot.data().count;

    // Get reviews written by user
    const userReviewsQuery = query(
      collection(db, 'reviews'),
      where('userId', '==', userId)
    );
    const userReviewsSnapshot = await getCountFromServer(userReviewsQuery);
    const reviewsWritten = userReviewsSnapshot.data().count;

    // Get bookmarked spots by user
    const userBookmarksQuery = query(
      collection(db, 'bookmarks'),
      where('userId', '==', userId)
    );
    const userBookmarksSnapshot = await getCountFromServer(userBookmarksQuery);
    const bookmarkedSpots = userBookmarksSnapshot.data().count;

    return {
      spotsAdded,
      reviewsWritten,
      bookmarkedSpots
    };
  } catch (error) {
    console.error('Error fetching user contribution stats:', error);
    return {
      spotsAdded: 0,
      reviewsWritten: 0,
      bookmarkedSpots: 0
    };
  }
};

// Get user's recent activity
export const getUserRecentActivity = async (userId: string, limitCount: number = 5): Promise<UserActivity[]> => {
  try {
    const activities: UserActivity[] = [];

    // Get user's recent locations
    const userLocationsQuery = query(
      collection(db, 'locations'),
      where('submittedBy', '==', userId),
      orderBy('submittedAt', 'desc'),
      limit(limitCount)
    );
    const userLocationsSnapshot = await getDocs(userLocationsQuery);

    userLocationsSnapshot.forEach(doc => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        type: 'location_added',
        title: 'Added a practice spot',
        description: data.name,
        date: data.submittedAt?.toDate() || new Date(),
        locationId: doc.id,
        locationName: data.name
      });
    });

    // Get user's recent reviews
    const userReviewsQuery = query(
      collection(db, 'reviews'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const userReviewsSnapshot = await getDocs(userReviewsQuery);

    for (const reviewDoc of userReviewsSnapshot.docs) {
      const reviewData = reviewDoc.data();

      // Get location name for the review
      try {
        const locationDocRef = doc(db, 'locations', reviewData.locationId);
        const locationDoc = await getDoc(locationDocRef);

        const locationName = locationDoc.exists() ? locationDoc.data()?.name || 'Unknown Location' : 'Unknown Location';

        activities.push({
          id: reviewDoc.id,
          type: 'review_written',
          title: 'Wrote a review',
          description: locationName,
          date: reviewData.createdAt?.toDate() || new Date(),
          locationId: reviewData.locationId,
          locationName
        });
      } catch (error) {
        console.error('Error fetching location for review:', error);
        activities.push({
          id: reviewDoc.id,
          type: 'review_written',
          title: 'Wrote a review',
          description: 'Practice Location',
          date: reviewData.createdAt?.toDate() || new Date(),
          locationId: reviewData.locationId
        });
      }
    }

    // Get user's recent bookmarks
    const userBookmarksQuery = query(
      collection(db, 'bookmarks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const userBookmarksSnapshot = await getDocs(userBookmarksQuery);

    for (const bookmarkDoc of userBookmarksSnapshot.docs) {
      const bookmarkData = bookmarkDoc.data();

      // Get location name for the bookmark
      try {
        const locationDocRef = doc(db, 'locations', bookmarkData.locationId);
        const locationDoc = await getDoc(locationDocRef);

        const locationName = locationDoc.exists() ? locationDoc.data()?.name || 'Unknown Location' : 'Unknown Location';

        activities.push({
          id: bookmarkDoc.id,
          type: 'location_bookmarked',
          title: 'Bookmarked a spot',
          description: locationName,
          date: bookmarkData.createdAt?.toDate() || new Date(),
          locationId: bookmarkData.locationId,
          locationName
        });
      } catch (error) {
        console.error('Error fetching location for bookmark:', error);
        activities.push({
          id: bookmarkDoc.id,
          type: 'location_bookmarked',
          title: 'Bookmarked a spot',
          description: 'Practice Location',
          date: bookmarkData.createdAt?.toDate() || new Date(),
          locationId: bookmarkData.locationId
        });
      }
    }

    // Sort all activities by date (most recent first) and limit
    return activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limitCount);

  } catch (error) {
    console.error('Error fetching user recent activity:', error);
    return [];
  }
};

// Get locations by difficulty level
export const getDifficultyStats = async (): Promise<Record<string, number>> => {
  try {
    const locationsQuery = query(
      collection(db, 'locations'),
      where('isApproved', '==', true)
    );
    const locationsSnapshot = await getDocs(locationsQuery);
    
    const difficultyStats: Record<string, number> = {
      'Beginner': 0,
      'Intermediate': 0,
      'Advanced': 0
    };
    
    locationsSnapshot.forEach(doc => {
      const data = doc.data();
      const difficulty = data.difficulty || 'Beginner';
      difficultyStats[difficulty] = (difficultyStats[difficulty] || 0) + 1;
    });

    return difficultyStats;
  } catch (error) {
    console.error('Error fetching difficulty stats:', error);
    return {
      'Beginner': 0,
      'Intermediate': 0,
      'Advanced': 0
    };
  }
};

// Get last review date for locations
export const getLastReviewDate = async (locationId?: string): Promise<string> => {
  try {
    let reviewsQuery;
    
    if (locationId) {
      // Get last review for specific location
      reviewsQuery = query(
        collection(db, 'reviews'),
        where('locationId', '==', locationId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
    } else {
      // Get last review across all locations
      reviewsQuery = query(
        collection(db, 'reviews'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
    }
    
    const reviewsSnapshot = await getDocs(reviewsQuery);
    
    if (reviewsSnapshot.empty) {
      return 'never';
    }
    
    const lastReview = reviewsSnapshot.docs[0].data();
    const reviewDate = lastReview.createdAt?.toDate() || new Date();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return years === 1 ? '1 year ago' : `${years} years ago`;
    }
  } catch (error) {
    console.error('Error fetching last review date:', error);
    return 'unknown';
  }
};

// Get top rated locations
export const getTopRatedLocations = async (limitCount: number = 5) => {
  try {
    const locationsQuery = query(
      collection(db, 'locations'),
      where('isApproved', '==', true),
      where('rating', '>', 0),
      orderBy('rating', 'desc'),
      orderBy('reviewCount', 'desc'),
      limit(limitCount)
    );
    
    const locationsSnapshot = await getDocs(locationsQuery);
    return locationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching top rated locations:', error);
    return [];
  }
};

// Get recently reviewed locations
export const getRecentlyReviewedLocations = async (limitCount: number = 5) => {
  try {
    const recentReviews = await getRecentReviews(limitCount);
    const locationIds = [...new Set(recentReviews.map(review => review.locationId))];
    
    const locations = [];
    for (const locationId of locationIds) {
      const locationQuery = query(
        collection(db, 'locations'),
        where('__name__', '==', locationId),
        where('isApproved', '==', true)
      );
      const locationSnapshot = await getDocs(locationQuery);
      
      if (!locationSnapshot.empty) {
        const locationData = locationSnapshot.docs[0].data();
        locations.push({
          id: locationSnapshot.docs[0].id,
          ...locationData
        });
      }
    }
    
    return locations;
  } catch (error) {
    console.error('Error fetching recently reviewed locations:', error);
    return [];
  }
};

// Cache for stats to avoid frequent Firebase calls
let statsCache: {
  appStats?: { data: AppStats; timestamp: number };
  featureStats?: { data: FeatureStats; timestamp: number };
} = {};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedAppStats = async (): Promise<AppStats> => {
  const now = Date.now();
  
  if (statsCache.appStats && (now - statsCache.appStats.timestamp) < CACHE_DURATION) {
    return statsCache.appStats.data;
  }
  
  const stats = await getAppStats();
  statsCache.appStats = { data: stats, timestamp: now };
  return stats;
};

export const getCachedFeatureStats = async (): Promise<FeatureStats> => {
  const now = Date.now();
  
  if (statsCache.featureStats && (now - statsCache.featureStats.timestamp) < CACHE_DURATION) {
    return statsCache.featureStats.data;
  }
  
  const stats = await getFeatureStats();
  statsCache.featureStats = { data: stats, timestamp: now };
  return stats;
};
