import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBL0NujG65BAV462Ut3OfdkvuhyVYsovBg",
  authDomain: "breezydrivr.firebaseapp.com",
  projectId: "breezydrivr",
  storageBucket: "breezydrivr.firebasestorage.app",
  messagingSenderId: "351751778424",
  appId: "1:351751778424:web:53fcb010a40feb3874bd8d",
  measurementId: "G-FF0NB3QPWT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// TypeScript interfaces for location data
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface PracticeLocation {
  id?: string; // Firestore document ID
  name: string;
  address: string;
  description?: string;
  coordinates?: LocationCoordinates;
  difficulty: DifficultyLevel;
  features: string[];
  rating?: number;
  reviewCount?: number;
  submittedBy?: string; // User ID who submitted the location
  submittedAt: Date;
  updatedAt?: Date;
  isApproved?: boolean; // For moderation
  images?: string[]; // URLs to uploaded images
  distance?: string; // Calculated distance from user (not stored in DB)
  lastReview?: string; // Calculated field (not stored in DB)
}

export interface LocationFormData {
  name: string;
  address: string;
  description: string;
  difficulty: DifficultyLevel | '';
  features: string[];
  coordinates?: LocationCoordinates;
}

export interface LocationStats {
  totalLocations: number;
  locationsByDifficulty: Record<DifficultyLevel, number>;
  recentSubmissions: number;
  averageRating: number;
}
