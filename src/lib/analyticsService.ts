import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  increment, 
  getDoc, 
  setDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

// Analytics event types
export type AnalyticsEvent = 
  | 'location_added'
  | 'location_viewed'
  | 'location_searched'
  | 'location_rated'
  | 'location_visited'
  | 'app_opened'
  | 'page_viewed';

export interface AnalyticsData {
  event: AnalyticsEvent;
  userId?: string;
  locationId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface LocationStats {
  id: string;
  locationId: string;
  viewCount: number;
  visitCount: number;
  ratingSum: number;
  ratingCount: number;
  averageRating: number;
  lastViewed?: Date;
  lastVisited?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppStats {
  totalLocations: number;
  totalUsers: number;
  totalViews: number;
  totalVisits: number;
  averageRating: number;
  popularLocations: string[];
  recentActivity: AnalyticsData[];
}

/**
 * Track an analytics event
 */
export const trackEvent = async (eventData: Omit<AnalyticsData, 'timestamp'>): Promise<void> => {
  try {
    const analyticsData: AnalyticsData = {
      ...eventData,
      timestamp: new Date()
    };

    await addDoc(collection(db, 'analytics'), analyticsData);

    // Update location-specific stats if applicable
    if (eventData.locationId) {
      await updateLocationStats(eventData.locationId, eventData.event, eventData.metadata);
    }

    // Update app-level stats
    await updateAppStats(eventData.event);

  } catch (error) {
    console.error('Error tracking analytics event:', error);
    // Don't throw error to avoid breaking user experience
  }
};

/**
 * Update location-specific statistics
 */
export const updateLocationStats = async (
  locationId: string, 
  event: AnalyticsEvent, 
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    const statsRef = doc(db, 'locationStats', locationId);
    const now = new Date();

    const updates: Partial<LocationStats> = {
      updatedAt: now
    };

    switch (event) {
      case 'location_viewed':
        updates.viewCount = increment(1);
        updates.lastViewed = now;
        break;
      
      case 'location_visited':
        updates.visitCount = increment(1);
        updates.lastVisited = now;
        break;
      
      case 'location_rated':
        if (metadata?.rating) {
          updates.ratingSum = increment(metadata.rating);
          updates.ratingCount = increment(1);
        }
        break;
    }

    // Check if document exists
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      // Create new stats document
      const newStats: Omit<LocationStats, 'id'> = {
        locationId,
        viewCount: event === 'location_viewed' ? 1 : 0,
        visitCount: event === 'location_visited' ? 1 : 0,
        ratingSum: event === 'location_rated' && metadata?.rating ? metadata.rating : 0,
        ratingCount: event === 'location_rated' ? 1 : 0,
        averageRating: event === 'location_rated' && metadata?.rating ? metadata.rating : 0,
        lastViewed: event === 'location_viewed' ? now : undefined,
        lastVisited: event === 'location_visited' ? now : undefined,
        createdAt: now,
        updatedAt: now
      };
      
      await setDoc(statsRef, newStats);
    } else {
      // Update existing document
      await updateDoc(statsRef, updates);
      
      // Calculate new average rating if rating was updated
      if (event === 'location_rated') {
        const updatedDoc = await getDoc(statsRef);
        const data = updatedDoc.data() as LocationStats;
        const newAverage = data.ratingCount > 0 ? data.ratingSum / data.ratingCount : 0;
        
        await updateDoc(statsRef, {
          averageRating: newAverage
        });
      }
    }

  } catch (error) {
    console.error('Error updating location stats:', error);
  }
};

/**
 * Update app-level statistics
 */
export const updateAppStats = async (event: AnalyticsEvent): Promise<void> => {
  try {
    const statsRef = doc(db, 'appStats', 'global');
    
    const updates: Record<string, any> = {
      updatedAt: new Date()
    };

    switch (event) {
      case 'location_added':
        updates.totalLocations = increment(1);
        break;
      
      case 'location_viewed':
        updates.totalViews = increment(1);
        break;
      
      case 'location_visited':
        updates.totalVisits = increment(1);
        break;
    }

    await updateDoc(statsRef, updates);

  } catch (error) {
    console.error('Error updating app stats:', error);
  }
};

/**
 * Get location statistics
 */
export const getLocationStats = async (locationId: string): Promise<LocationStats | null> => {
  try {
    const statsRef = doc(db, 'locationStats', locationId);
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      return { id: statsDoc.id, ...statsDoc.data() } as LocationStats;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting location stats:', error);
    return null;
  }
};

/**
 * Get app-level statistics
 */
export const getAppStats = async (): Promise<AppStats | null> => {
  try {
    const statsRef = doc(db, 'appStats', 'global');
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      const data = statsDoc.data();
      
      // Get popular locations (top 5 by view count)
      const popularQuery = query(
        collection(db, 'locationStats'),
        orderBy('viewCount', 'desc'),
        limit(5)
      );
      const popularDocs = await getDocs(popularQuery);
      const popularLocations = popularDocs.docs.map(doc => doc.data().locationId);
      
      // Get recent activity (last 10 events)
      const activityQuery = query(
        collection(db, 'analytics'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const activityDocs = await getDocs(activityQuery);
      const recentActivity = activityDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AnalyticsData[];
      
      return {
        ...data,
        popularLocations,
        recentActivity
      } as AppStats;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting app stats:', error);
    return null;
  }
};

/**
 * Get popular locations based on view count
 */
export const getPopularLocations = async (limitCount: number = 10): Promise<LocationStats[]> => {
  try {
    const q = query(
      collection(db, 'locationStats'),
      orderBy('viewCount', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LocationStats[];
  } catch (error) {
    console.error('Error getting popular locations:', error);
    return [];
  }
};

/**
 * Initialize app stats document if it doesn't exist
 */
export const initializeAppStats = async (): Promise<void> => {
  try {
    const statsRef = doc(db, 'appStats', 'global');
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      const initialStats = {
        totalLocations: 0,
        totalUsers: 0,
        totalViews: 0,
        totalVisits: 0,
        averageRating: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(statsRef, initialStats);
    }
  } catch (error) {
    console.error('Error initializing app stats:', error);
  }
};
