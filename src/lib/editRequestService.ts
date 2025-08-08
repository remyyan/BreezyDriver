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
  const q = query(
    collection(db, EDIT_REQUESTS_COLLECTION),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as EditRequestDoc[];
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

