import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../hooks/firebase/firebaseConfig'; 

export interface Subscription {
  id?: string;
  name: string;
  price: number;
  duration: 'monthly' | 'six-month' | 'yearly';
  ideal: string;
  storage?: string;
  features: string[];
  mostPopular?: boolean;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION_NAME = 'subscriptions';


export const addSubscription = async (subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docData = {
      ...subscriptionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
    
    return {
      success: true,
      message: 'Subscription plan created successfully',
      id: docRef.id
    };
  } catch (error: any) {
    console.error('Error adding subscription:', error);
    return {
      success: false,
      message: error.message || 'Failed to create subscription plan'
    };
  }
};


export const getSubscriptions = async (activeOnly: boolean = false): Promise<Subscription[]> => {
  try {
    let q;
    
    if (activeOnly) {
      q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const subscriptions: Subscription[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      subscriptions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Subscription);
    });

    return subscriptions;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw new Error('Failed to fetch subscriptions');
  }
};


/**
 * Get a single subscription by ID
 */
export const getSubscriptionById = async (id: string): Promise<Subscription | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Subscription;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw new Error('Failed to fetch subscription');
  }
};

/**
 * Update an existing subscription
 */
export const updateSubscription = async (
  id: string, 
  subscriptionData: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>
) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    
    const updateData = {
      ...subscriptionData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(docRef, updateData);
    
    return {
      success: true,
      message: 'Subscription plan updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return {
      success: false,
      message: error.message || 'Failed to update subscription plan'
    };
  }
};


export const deleteSubscription = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    
    return {
      success: true,
      message: 'Subscription plan deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting subscription:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete subscription plan'
    };
  }
};


export const toggleSubscriptionStatus = async (id: string, isActive: boolean) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    
    await updateDoc(docRef, {
      isActive,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: `Subscription plan ${isActive ? 'activated' : 'deactivated'} successfully`
    };
  } catch (error: any) {
    console.error('Error toggling subscription status:', error);
    return {
      success: false,
      message: error.message || 'Failed to update subscription status'
    };
  }
};


export const getSubscriptionsByDuration = async (duration: 'monthly' | 'six-month' | 'yearly'): Promise<Subscription[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('duration', '==', duration),
      where('isActive', '==', true),
      orderBy('price', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const subscriptions: Subscription[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      subscriptions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Subscription);
    });

    return subscriptions;
  } catch (error) {
    console.error('Error fetching subscriptions by duration:', error);
    throw new Error('Failed to fetch subscriptions');
  }
};


export const getMostPopularSubscription = async (): Promise<Subscription | null> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('mostPopular', '==', true),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Subscription;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching most popular subscription:', error);
    throw new Error('Failed to fetch most popular subscription');
  }
};


