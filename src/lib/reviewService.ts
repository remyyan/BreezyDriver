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
  QueryDocumentSnapshot,
  increment
} from 'firebase/firestore';
import { db, LocationReview, ReviewFormData, UserBookmark, UserStats } from './firebase';
import { trackEvent } from './analyticsService';

const REVIEWS_COLLECTION = 'reviews';
const BOOKMARKS_COLLECTION = 'bookmarks';
const USER_STATS_COLLECTION = 'userStats';

// Convert Firestore document to LocationReview
const convertDocToReview = (doc: QueryDocumentSnapshot<DocumentData>): LocationReview => {
  const data = doc.data();
  return {
    id: doc.id,
    locationId: data.locationId,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    rating: data.rating,
    comment: data.comment,
    helpful: data.helpful || 0,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate(),
    isVerified: data.isVerified || false
  };
};

// Add a new review
export const addReview = async (
  locationId: string,
  userId: string,
  userName: string,
  userEmail: string,
  reviewData: ReviewFormData
): Promise<string> => {
  try {
    // Check if user already reviewed this location
    const existingReviewQuery = query(
      collection(db, REVIEWS_COLLECTION),
      where('locationId', '==', locationId),
      where('userId', '==', userId)
    );
    const existingReviews = await getDocs(existingReviewQuery);
    
    if (!existingReviews.empty) {
      throw new Error('You have already reviewed this location');
    }

    const newReview: Omit<LocationReview, 'id'> = {
      locationId,
      userId,
      userName,
      userEmail,
      rating: reviewData.rating,
      comment: reviewData.comment.trim(),
      helpful: 0,
      createdAt: new Date(),
      isVerified: reviewData.isVerified || false
    };

    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
      ...newReview,
      createdAt: Timestamp.fromDate(newReview.createdAt)
    });

    // Update location's rating and review count
    await updateLocationRating(locationId);

    // Update user stats
    await updateUserStats(userId, 'review_added');

    // Track analytics event
    await trackEvent({
      event: 'location_rated',
      userId,
      locationId,
      metadata: {
        rating: reviewData.rating,
        hasComment: reviewData.comment.length > 0,
        isVerified: reviewData.isVerified
      }
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// Get reviews for a location
export const getLocationReviews = async (locationId: string): Promise<LocationReview[]> => {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('locationId', '==', locationId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToReview);
  } catch (error) {
    console.error('Error fetching location reviews:', error);
    throw error;
  }
};

// Get reviews by user
export const getUserReviews = async (userId: string): Promise<LocationReview[]> => {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToReview);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

// Update location's average rating and review count
const updateLocationRating = async (locationId: string): Promise<void> => {
  try {
    const reviews = await getLocationReviews(locationId);
    
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Update the location document
    const locationRef = doc(db, 'locations', locationId);
    await updateDoc(locationRef, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: reviews.length,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error updating location rating:', error);
  }
};

// Mark review as helpful
export const markReviewHelpful = async (reviewId: string, userId: string): Promise<void> => {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await updateDoc(reviewRef, {
      helpful: increment(1)
    });

    // Track analytics
    await trackEvent({
      event: 'location_viewed', // Using existing event type
      userId,
      metadata: {
        action: 'review_helpful',
        reviewId
      }
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    throw error;
  }
};

// Add bookmark
export const addBookmark = async (userId: string, locationId: string): Promise<string> => {
  try {
    // Check if already bookmarked
    const existingBookmarkQuery = query(
      collection(db, BOOKMARKS_COLLECTION),
      where('userId', '==', userId),
      where('locationId', '==', locationId)
    );
    const existingBookmarks = await getDocs(existingBookmarkQuery);
    
    if (!existingBookmarks.empty) {
      throw new Error('Location already bookmarked');
    }

    const newBookmark: Omit<UserBookmark, 'id'> = {
      userId,
      locationId,
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, BOOKMARKS_COLLECTION), {
      ...newBookmark,
      createdAt: Timestamp.fromDate(newBookmark.createdAt)
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    throw error;
  }
};

// Remove bookmark
export const removeBookmark = async (userId: string, locationId: string): Promise<void> => {
  try {
    const bookmarkQuery = query(
      collection(db, BOOKMARKS_COLLECTION),
      where('userId', '==', userId),
      where('locationId', '==', locationId)
    );
    const bookmarks = await getDocs(bookmarkQuery);
    
    if (!bookmarks.empty) {
      await deleteDoc(bookmarks.docs[0].ref);
    }
  } catch (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
};

// Get user bookmarks
export const getUserBookmarks = async (userId: string): Promise<string[]> => {
  try {
    const q = query(
      collection(db, BOOKMARKS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().locationId);
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    throw error;
  }
};

// Check if location is bookmarked by user
export const isLocationBookmarked = async (userId: string, locationId: string): Promise<boolean> => {
  try {
    const bookmarkQuery = query(
      collection(db, BOOKMARKS_COLLECTION),
      where('userId', '==', userId),
      where('locationId', '==', locationId)
    );
    const bookmarks = await getDocs(bookmarkQuery);
    return !bookmarks.empty;
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
};

// Update user statistics
export const updateUserStats = async (userId: string, action: 'review_added' | 'location_added'): Promise<void> => {
  try {
    const userStatsRef = doc(db, USER_STATS_COLLECTION, userId);
    const userStatsDoc = await getDoc(userStatsRef);
    
    const now = new Date();
    
    if (!userStatsDoc.exists()) {
      // Create new user stats
      const newStats: Omit<UserStats, 'userId'> = {
        spotsAdded: action === 'location_added' ? 1 : 0,
        reviewsWritten: action === 'review_added' ? 1 : 0,
        helpfulVotes: 0,
        joinedAt: now,
        lastActive: now
      };
      
      await updateDoc(userStatsRef, {
        userId,
        ...newStats,
        joinedAt: Timestamp.fromDate(newStats.joinedAt),
        lastActive: Timestamp.fromDate(newStats.lastActive)
      });
    } else {
      // Update existing stats
      const updates: any = {
        lastActive: Timestamp.fromDate(now)
      };
      
      if (action === 'location_added') {
        updates.spotsAdded = increment(1);
      } else if (action === 'review_added') {
        updates.reviewsWritten = increment(1);
      }
      
      await updateDoc(userStatsRef, updates);
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

// Get user statistics
export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  try {
    const userStatsRef = doc(db, USER_STATS_COLLECTION, userId);
    const userStatsDoc = await getDoc(userStatsRef);
    
    if (userStatsDoc.exists()) {
      const data = userStatsDoc.data();
      return {
        userId,
        spotsAdded: data.spotsAdded || 0,
        reviewsWritten: data.reviewsWritten || 0,
        helpfulVotes: data.helpfulVotes || 0,
        joinedAt: data.joinedAt?.toDate() || new Date(),
        lastActive: data.lastActive?.toDate() || new Date()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
};

// Get recent reviews across all locations
export const getRecentReviews = async (limitCount: number = 10): Promise<LocationReview[]> => {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToReview);
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    throw error;
  }
};
