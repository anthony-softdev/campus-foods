import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { MenuItem, OrderDetails, UserProfile } from './types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================
// DATABASE API HELPER SERVICES
// ============================================

// --- User Profile helpers ---
export async function getUserProfileFromDb(email: string): Promise<any | null> {
  const userKey = email.toLowerCase().trim();
  const path = `users/${userKey}`;
  try {
    const docRef = doc(db, 'users', userKey);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveUserProfileToDb(email: string, profile: any): Promise<void> {
  const userKey = email.toLowerCase().trim();
  const path = `users/${userKey}`;
  try {
    const docRef = doc(db, 'users', userKey);
    await setDoc(docRef, profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserRoleInDb(email: string, role: 'student' | 'admin'): Promise<void> {
  const userKey = email.toLowerCase().trim();
  const path = `users/${userKey}`;
  try {
    const docRef = doc(db, 'users', userKey);
    await updateDoc(docRef, { role });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateUserLastSeenInDb(email: string): Promise<void> {
  const userKey = email.toLowerCase().trim();
  const path = `users/${userKey}`;
  try {
    const docRef = doc(db, 'users', userKey);
    await updateDoc(docRef, { lastSeen: new Date().toISOString() });
  } catch (error) {
    // This is a non-critical update, so we'll just log the error
    // instead of throwing it and potentially breaking the login flow.
    console.error(`Failed to update lastSeen for ${path}:`, error);
  }
}

export async function deleteUserFromDb(email: string): Promise<void> {
  const userKey = email.toLowerCase().trim();
  const path = `users/${userKey}`;
  try {
    const docRef = doc(db, 'users', userKey);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function listenAllUsersFromDb(callback: (users: UserProfile[]) => void) {
  const path = 'users';
  const q = query(collection(db, 'users'));
  return onSnapshot(q, (snapshot) => {
    const users: UserProfile[] = [];
    snapshot.forEach((doc) => {
      // Ensure we have a valid UserProfile structure
      const data = doc.data();
      if (data.email && data.fullName) {
        users.push(data as UserProfile);
      }
    });
    callback(users);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

// --- Menu Items helpers ---
export function listenMenuItemsFromDb(callback: (items: MenuItem[]) => void) {
  const path = 'menuItems';
  const q = query(collection(db, 'menuItems'));
  return onSnapshot(q, (snapshot) => {
    const items: MenuItem[] = [];
    snapshot.forEach((doc) => {
      items.push(doc.data() as MenuItem);
    });
    callback(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function seedMenuItemsIfEmpty(defaultItems: MenuItem[]): Promise<void> {
  const path = 'menuItems';
  try {
    const q = query(collection(db, 'menuItems'));
    const snap = await getDocs(q);
    if (snap.empty) {
      console.log('Seeding menuItems to Firestore...');
      const batch = writeBatch(db);
      defaultItems.forEach((item) => {
        const itemRef = doc(db, 'menuItems', item.id);
        batch.set(itemRef, item);
      });
      await batch.commit();
      console.log('Successfully seeded menuItems!');
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function addMenuItemToDb(item: MenuItem): Promise<void> {
  const path = `menuItems/${item.id}`;
  try {
    console.log('addMenuItemToDb: writing to', path, 'item:', item.id);
    await setDoc(doc(db, 'menuItems', item.id), item);
    console.log('addMenuItemToDb: write complete for', item.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMenuItemFromDb(id: string): Promise<void> {
  const path = `menuItems/${id}`;
  try {
    console.log('deleteMenuItemFromDb: deleting', path);
    await deleteDoc(doc(db, 'menuItems', id));
    console.log('deleteMenuItemFromDb: deleted', id);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function listenAppConfigFromDb(callback: (config: { deliveryFee: number }) => void) {
  const path = 'config/main';
  const docRef = doc(db, 'config', 'main');
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as { deliveryFee: number });
    } else {
      // If it doesn't exist, create it with a default and the listener will pick it up.
      console.log("No config found, creating with default delivery fee 300");
      setDoc(docRef, { deliveryFee: 300 }).catch(e => handleFirestoreError(e, OperationType.WRITE, path));
      callback({ deliveryFee: 300 }); // also callback immediately with default
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function updateDeliveryFeeInDb(newFee: number): Promise<void> {
  const path = 'config/main';
  try {
    const docRef = doc(db, 'config', 'main');
    await updateDoc(docRef, { deliveryFee: newFee });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// --- Orders helpers ---
export function listenAllOrdersFromDb(callback: (orders: OrderDetails[]) => void) {
  const path = 'orders';
  const q = query(collection(db, 'orders'));
  return onSnapshot(q, (snapshot) => {
    const orders: OrderDetails[] = [];
    snapshot.forEach((doc) => {
      orders.push(doc.data() as OrderDetails);
    });
    callback(orders);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export function listenUserOrdersFromDb(email: string, callback: (orders: OrderDetails[]) => void) {
  const path = 'orders';
  const q = query(collection(db, 'orders'), where('userEmail', '==', email.toLowerCase().trim()));
  return onSnapshot(q, (snapshot) => {
    const orders: OrderDetails[] = [];
    snapshot.forEach((doc) => {
      orders.push(doc.data() as OrderDetails);
    });
    // Sort descending by date locally
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(orders);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function createOrderInDb(order: OrderDetails): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateOrderStatusInDb(orderId: string, status: OrderDetails['status']): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteOrderFromDb(orderId: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearAllOrdersFromDb(): Promise<void> {
  const path = 'orders';
  try {
    const ordersCollection = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersCollection);
    const batch = writeBatch(db);
    ordersSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveContactMessageToDb(message: {
  name: string;
  email: string;
  message: string;
  createdAt: string;
}): Promise<void> {
  const path = 'contactMessages';
  try {
    const ref = doc(collection(db, 'contactMessages'));
    await setDoc(ref, message);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
