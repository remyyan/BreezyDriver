import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db, PracticeLocation, LocationFormData, LocationStats, DifficultyLevel } from './firebase';
import { trackEvent } from './analyticsService';
import { updateUserStats } from './reviewService';

const LOCATIONS_COLLECTION = 'locations';

// Convert Firestore document to PracticeLocation
const convertDocToLocation = (doc: QueryDocumentSnapshot<DocumentData>): PracticeLocation => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    address: data.address,
    description: data.description,
    coordinates: data.coordinates,
    difficulty: data.difficulty,
    features: data.features || [],
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    submittedBy: data.submittedBy,
    submittedAt: data.submittedAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate(),
    isApproved: data.isApproved || false,
    images: data.images || []
  };
};

// Add a new practice location
export const addLocation = async (
  locationData: LocationFormData, 
  userId?: string
): Promise<string> => {
  try {
    if (!locationData.name.trim()) {
      throw new Error('Location name is required');
    }
    if (!locationData.address.trim()) {
      throw new Error('Address is required');
    }
    if (!locationData.difficulty) {
      throw new Error('Difficulty level is required');
    }

    const newLocation: Omit<PracticeLocation, 'id'> = {
      name: locationData.name.trim(),
      address: locationData.address.trim(),
      description: locationData.description?.trim() || '',
      coordinates: locationData.coordinates,
      difficulty: locationData.difficulty,
      features: locationData.features,
      rating: 0,
      reviewCount: 0,
      submittedBy: userId,
      submittedAt: new Date(),
      isApproved: false, // Requires moderation
      images: []
    };

    const docRef = await addDoc(collection(db, LOCATIONS_COLLECTION), {
      ...newLocation,
      submittedAt: Timestamp.fromDate(newLocation.submittedAt)
    });

    // Update user stats
    if (userId) {
      await updateUserStats(userId, 'location_added');
    }

    // Track analytics event
    await trackEvent({
      event: 'location_added',
      userId,
      locationId: docRef.id,
      metadata: {
        difficulty: locationData.difficulty,
        features: locationData.features,
        hasCoordinates: !!locationData.coordinates
      }
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding location:', error);
    throw error;
  }
};

// Get all approved locations
export const getLocations = async (): Promise<PracticeLocation[]> => {
  try {
    const q = query(
      collection(db, LOCATIONS_COLLECTION),
      where('isApproved', '==', true),
      orderBy('submittedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToLocation);
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

// Get a specific location by ID
export const getLocationById = async (locationId: string): Promise<PracticeLocation | null> => {
  try {
    const locationRef = doc(db, LOCATIONS_COLLECTION, locationId);
    const locationSnap = await getDoc(locationRef);

    if (locationSnap.exists()) {
      return convertDocToLocation(locationSnap);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching location by ID:', error);
    throw error;
  }
};

// Get locations by difficulty
export const getLocationsByDifficulty = async (difficulty: DifficultyLevel): Promise<PracticeLocation[]> => {
  try {
    const q = query(
      collection(db, LOCATIONS_COLLECTION),
      where('isApproved', '==', true),
      where('difficulty', '==', difficulty),
      orderBy('rating', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToLocation);
  } catch (error) {
    console.error('Error fetching locations by difficulty:', error);
    throw error;
  }
};

// Get recent locations (for showcase)
export const getRecentLocations = async (limitCount: number = 6): Promise<PracticeLocation[]> => {
  try {
    const q = query(
      collection(db, LOCATIONS_COLLECTION),
      where('isApproved', '==', true),
      orderBy('submittedAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToLocation);
  } catch (error) {
    console.error('Error fetching recent locations:', error);
    throw error;
  }
};

// Get locations by user (for profile/management)
export const getUserLocations = async (userId: string): Promise<PracticeLocation[]> => {
  try {
    const q = query(
      collection(db, LOCATIONS_COLLECTION),
      where('submittedBy', '==', userId),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToLocation);
  } catch (error) {
    console.error('Error fetching user locations:', error);
    throw error;
  }
};

// Update location (for moderation or user edits)
export const updateLocation = async (
  locationId: string, 
  updates: Partial<PracticeLocation>
): Promise<void> => {
  try {
    const locationRef = doc(db, LOCATIONS_COLLECTION, locationId);
    const updateData: any = { ...updates };
    
    if (updates.updatedAt) {
      updateData.updatedAt = Timestamp.fromDate(updates.updatedAt);
    } else {
      updateData.updatedAt = Timestamp.fromDate(new Date());
    }

    await updateDoc(locationRef, updateData);
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
};

// Delete location
export const deleteLocation = async (locationId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, LOCATIONS_COLLECTION, locationId));
  } catch (error) {
    console.error('Error deleting location:', error);
    throw error;
  }
};

// Get location statistics
export const getLocationStats = async (): Promise<LocationStats> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, LOCATIONS_COLLECTION), where('isApproved', '==', true))
    );
    
    const locations = querySnapshot.docs.map(convertDocToLocation);
    
    const stats: LocationStats = {
      totalLocations: locations.length,
      locationsByDifficulty: {
        'Beginner': 0,
        'Intermediate': 0,
        'Advanced': 0
      },
      recentSubmissions: 0,
      averageRating: 0
    };

    let totalRating = 0;
    let ratedLocations = 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    locations.forEach(location => {
      // Count by difficulty
      stats.locationsByDifficulty[location.difficulty]++;
      
      // Calculate average rating
      if (location.rating && location.rating > 0) {
        totalRating += location.rating;
        ratedLocations++;
      }
      
      // Count recent submissions
      if (location.submittedAt > oneWeekAgo) {
        stats.recentSubmissions++;
      }
    });

    stats.averageRating = ratedLocations > 0 ? totalRating / ratedLocations : 0;

    return stats;
  } catch (error) {
    console.error('Error fetching location stats:', error);
    throw error;
  }
};

// Search locations by name or address
export const searchLocations = async (searchTerm: string): Promise<PracticeLocation[]> => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation that fetches all locations and filters client-side
    // For production, consider using Algolia or similar service for better search
    const locations = await getLocations();
    
    const searchLower = searchTerm.toLowerCase();
    return locations.filter(location => 
      location.name.toLowerCase().includes(searchLower) ||
      location.address.toLowerCase().includes(searchLower) ||
      location.description?.toLowerCase().includes(searchLower) ||
      location.features.some(feature => feature.toLowerCase().includes(searchLower))
    );
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

// Track when a location is viewed
export const trackLocationView = async (locationId: string, userId?: string): Promise<void> => {
  try {
    await trackEvent({
      event: 'location_viewed',
      userId,
      locationId,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error tracking location view:', error);
    // Don't throw error to avoid breaking user experience
  }
};

// Track when a location is visited (user indicates they went there)
export const trackLocationVisit = async (locationId: string, userId?: string): Promise<void> => {
  try {
    await trackEvent({
      event: 'location_visited',
      userId,
      locationId,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error tracking location visit:', error);
  }
};

// Track when a location is rated
export const trackLocationRating = async (
  locationId: string,
  rating: number,
  userId?: string
): Promise<void> => {
  try {
    await trackEvent({
      event: 'location_rated',
      userId,
      locationId,
      metadata: {
        rating,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error tracking location rating:', error);
  }
};

// Admin functions for moderation
export const getPendingLocations = async (): Promise<PracticeLocation[]> => {
  try {
    const q = query(
      collection(db, LOCATIONS_COLLECTION),
      where('isApproved', '==', false),
      orderBy('submittedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToLocation);
  } catch (error) {
    console.error('Error fetching pending locations:', error);
    throw error;
  }
};

export const approveLocation = async (locationId: string, adminUserId?: string): Promise<void> => {
  try {
    const locationRef = doc(db, LOCATIONS_COLLECTION, locationId);
    await updateDoc(locationRef, {
      isApproved: true,
      approvedAt: Timestamp.now(),
      approvedBy: adminUserId,
      updatedAt: Timestamp.now()
    });

    // Track analytics event
    await trackEvent({
      event: 'location_approved' as any,
      userId: adminUserId,
      locationId,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error approving location:', error);
    throw error;
  }
};

export const rejectLocation = async (
  locationId: string,
  reason: string,
  adminUserId?: string
): Promise<void> => {
  try {
    const locationRef = doc(db, LOCATIONS_COLLECTION, locationId);
    await updateDoc(locationRef, {
      isApproved: false,
      rejectedAt: Timestamp.now(),
      rejectedBy: adminUserId,
      rejectionReason: reason,
      updatedAt: Timestamp.now()
    });

    // Track analytics event
    await trackEvent({
      event: 'location_rejected' as any,
      userId: adminUserId,
      locationId,
      metadata: {
        reason,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error rejecting location:', error);
    throw error;
  }
};

// Get all approved locations for admin management
export const getAllApprovedLocations = async (limitCount: number = 100): Promise<PracticeLocation[]> => {
  try {
    const q = query(
      collection(db, LOCATIONS_COLLECTION),
      where('isApproved', '==', true),
      orderBy('submittedAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToLocation);
  } catch (error) {
    console.error('Error fetching all approved locations:', error);
    throw error;
  }
};
