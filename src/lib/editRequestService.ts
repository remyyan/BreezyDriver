import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export const listPendingEditRequests = async (): Promise<EditRequestDoc[]> => {
  try {
    // First try to get all documents to check if collection exists
    const collectionRef = collection(db, EDIT_REQUESTS_COLLECTION);
    const allSnapshot = await getDocs(collectionRef);

    if (allSnapshot.empty) {
      console.log('Edit requests collection is empty, returning empty array');
      return [];
    }

    // If collection exists, use the filtered query (without orderBy to avoid index requirement)
    const q = query(
      collectionRef,
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    // Sort in memory instead of in query
    const docs = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as EditRequestDoc[];
    return docs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error: any) {
    // If collection doesn't exist or index isn't ready, return empty array
    if (error.code === 'failed-precondition' || error.code === 'not-found') {
      console.log('Edit requests collection not ready yet, returning empty array');
      return [];
    }
    throw error;
  }
};

export const resolveEditRequest = async (requestId: string): Promise<void> => {
  const ref = doc(db, EDIT_REQUESTS_COLLECTION, requestId);
  await updateDoc(ref, { status: 'resolved', updatedAt: Timestamp.fromDate(new Date()) });
};

export const rejectEditRequest = async (requestId: string): Promise<void> => {
  const ref = doc(db, EDIT_REQUESTS_COLLECTION, requestId);
  await updateDoc(ref, { status: 'rejected', updatedAt: Timestamp.fromDate(new Date()) });
};


export type EditRequestStatus = 'pending' | 'resolved' | 'rejected';

export interface EditRequestPayload {
  proposedAddress?: string;
  proposedCoordinates?: { latitude: number; longitude: number };
  message: string;
}

export interface EditRequestDoc {
  id?: string;
  locationId: string;
  locationName?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  currentAddress?: string;
  proposedAddress?: string;
  proposedCoordinates?: { latitude: number; longitude: number };
  message: string;
  status: EditRequestStatus;
  createdAt: Date;
  updatedAt?: Date;
}

const EDIT_REQUESTS_COLLECTION = 'editRequests';

export const submitEditRequest = async (
  locationId: string,
  payload: EditRequestPayload,
  user: { id: string; name?: string; email?: string },
  context?: { locationName?: string; currentAddress?: string }
): Promise<string> => {
  const docToAdd = {
    locationId,
    locationName: context?.locationName,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    currentAddress: context?.currentAddress,
    proposedAddress: payload.proposedAddress?.trim() || undefined,
    proposedCoordinates: payload.proposedCoordinates || undefined,
    message: payload.message.trim(),
    status: 'pending' as EditRequestStatus,
    createdAt: new Date()
  };

  const docRef = await addDoc(collection(db, EDIT_REQUESTS_COLLECTION), {
    ...docToAdd,
    createdAt: Timestamp.fromDate(docToAdd.createdAt)
  });
  return docRef.id;
};

export const getPendingEditRequestsForLocation = async (locationId: string) => {
  const q = query(
    collection(db, EDIT_REQUESTS_COLLECTION),
    where('locationId', '==', locationId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as EditRequestDoc[];
};

