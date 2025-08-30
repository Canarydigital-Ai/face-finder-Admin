import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../hooks/firebase/firebaseConfig'; // Updated path to match your subscription service

export interface User {
  id?: string;
  uid: string;
  name: string;
  email: string;
  phoneNumber: string;
  photoURL: string;
  provider: string;
  city: string;
  state: string;
  country: string;
  companyName: string;
  industry: string;
  industryAreas: string[];
  createdAt?: any;
  updatedAt?: any;
 
  subscription: {
    planName: string;
    billing: string;
  activatedAt?: string | null;
    expires_at?: string | null;
   
  };
}

const COLLECTION_NAME = 'users';

/**
 * Get all users from Firebase
 * @param activeOnly - Whether to include only users with active subscriptions
 * @returns Promise<User[]>
 */
export const getUsers = async (activeOnly: boolean = false): Promise<User[]> => {
  try {
    let q;
    
    if (activeOnly) {
      // Filter users with non-expired subscriptions
      q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const users: User[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const user: User = {
        id: doc.id,
        uid: data.uid || '',
        name: data.name || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        photoURL: data.photoURL || '',
        provider: data.provider || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        companyName: data.companyName || '',
        industry: data.industry || '',
        industryAreas: data.industryAreas || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        subscription: {
          planName: data.subscription?.planName || '',
          billing: data.subscription?.billing || '',
          activatedAt: data.subscription?.activatedAt || '',
          expires_at: data.subscription?.expires_at || ''
        }
      };

      // If activeOnly is true, filter out expired subscriptions
      if (activeOnly && user.subscription.expires_at) {
        const expiryDate = new Date(user.subscription.expires_at);
        const now = new Date();
        if (expiryDate > now) {
          users.push(user);
        }
      } else if (!activeOnly) {
        users.push(user);
      }
    });

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users from database');
  }
};

/**
 * Get a specific user by ID
 * @param userId - The user document ID
 * @returns Promise<User | null>
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      uid: data.uid || '',
      name: data.name || '',
      email: data.email || '',
      phoneNumber: data.phoneNumber || '',
      photoURL: data.photoURL || '',
      provider: data.provider || '',
      city: data.city || '',
      state: data.state || '',
      country: data.country || '',
      companyName: data.companyName || '',
      industry: data.industry || '',
      industryAreas: data.industryAreas || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      subscription: {
        planName: data.subscription?.planName || '',
        billing: data.subscription?.billing || '',
        activatedAt: data.subscription?.activatedAt || '',
        expires_at: data.subscription?.expires_at || ''
      }
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user from database');
  }
};

/**
 * Get a user by UID (Firebase Auth UID)
 * @param uid - The Firebase Auth UID
 * @returns Promise<User | null>
 */
export const getUserByUID = async (uid: string): Promise<User | null> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('uid', '==', uid)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      uid: data.uid || '',
      name: data.name || '',
      email: data.email || '',
      phoneNumber: data.phoneNumber || '',
      photoURL: data.photoURL || '',
      provider: data.provider || '',
      city: data.city || '',
      state: data.state || '',
      country: data.country || '',
      companyName: data.companyName || '',
      industry: data.industry || '',
      industryAreas: data.industryAreas || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      subscription: {
        planName: data.subscription?.planName || '',
        billing: data.subscription?.billing || '',
        activatedAt: data.subscription?.activatedAt || '',
        expires_at: data.subscription?.expires_at || ''
      }
    };
  } catch (error) {
    console.error('Error fetching user by UID:', error);
    throw new Error('Failed to fetch user by UID from database');
  }
};

/**
 * Update user information
 * @param userId - The user document ID
 * @param updateData - Partial user data to update
 * @returns Promise<{ success: boolean; message?: string }>
 */
export const updateUser = async (
  userId: string, 
  updateData: Partial<Omit<User, 'id' | 'createdAt'>>
) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    
    const dataToUpdate = {
      ...updateData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, dataToUpdate);
    
    return {
      success: true,
      message: 'User updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to update user'
    };
  }
};

/**
 * Delete a user from Firebase
 * @param userId - The user document ID
 * @returns Promise<{ success: boolean; message?: string }>
 */
export const deleteUser = async (userId: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    await deleteDoc(docRef);
    
    return {
      success: true,
      message: 'User deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to delete user'
    };
  }
};

/**
 * Get users by subscription plan
 * @param planName - The subscription plan name
 * @returns Promise<User[]>
 */
export const getUsersBySubscriptionPlan = async (planName: string): Promise<User[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('subscription.planName', '==', planName),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        uid: data.uid || '',
        name: data.name || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        photoURL: data.photoURL || '',
        provider: data.provider || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        companyName: data.companyName || '',
        industry: data.industry || '',
        industryAreas: data.industryAreas || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        subscription: {
          planName: data.subscription?.planName || '',
          billing: data.subscription?.billing || '',
          activatedAt: data.subscription?.activatedAt || '',
          expires_at: data.subscription?.expires_at || ''
        }
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users by subscription plan:', error);
    throw new Error('Failed to fetch users by subscription plan');
  }
};

/**
 * Get users with expiring subscriptions
 * @param daysThreshold - Number of days to check for expiring subscriptions (default: 7)
 * @returns Promise<User[]>
 */
export const getUsersWithExpiringSubscriptions = async (daysThreshold: number = 7): Promise<User[]> => {
  try {
    const users = await getUsers();
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() + daysThreshold);
    
    return users.filter(user => {
      if (!user.subscription.expires_at) return false;
      
      const expiryDate = new Date(user.subscription.expires_at);
      return expiryDate >= now && expiryDate <= thresholdDate;
    });
  } catch (error) {
    console.error('Error fetching users with expiring subscriptions:', error);
    throw new Error('Failed to fetch users with expiring subscriptions');
  }
};

/**
 * Get users by provider (google.com, email, etc.)
 * @param provider - The authentication provider
 * @returns Promise<User[]>
 */
export const getUsersByProvider = async (provider: string): Promise<User[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('provider', '==', provider),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        uid: data.uid || '',
        name: data.name || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        photoURL: data.photoURL || '',
        provider: data.provider || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        companyName: data.companyName || '',
        industry: data.industry || '',
        industryAreas: data.industryAreas || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        subscription: {
          planName: data.subscription?.planName || '',
          billing: data.subscription?.billing || '',
          activatedAt: data.subscription?.activatedAt || '',
          expires_at: data.subscription?.expires_at || ''
        }
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users by provider:', error);
    throw new Error('Failed to fetch users by provider');
  }
};

/**
 * Get users by country
 * @param country - The country code (e.g., 'IN', 'US')
 * @returns Promise<User[]>
 */
export const getUsersByCountry = async (country: string): Promise<User[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('country', '==', country),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        uid: data.uid || '',
        name: data.name || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        photoURL: data.photoURL || '',
        provider: data.provider || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        companyName: data.companyName || '',
        industry: data.industry || '',
        industryAreas: data.industryAreas || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        subscription: {
          planName: data.subscription?.planName || '',
          billing: data.subscription?.billing || '',
          activatedAt: data.subscription?.activatedAt || '',
          expires_at: data.subscription?.expires_at || ''
        }
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users by country:', error);
    throw new Error('Failed to fetch users by country');
  }
};

/**
 * Get user statistics
 * @returns Promise<{ totalUsers: number; activeSubscriptions: number; expiredSubscriptions: number; usersByPlan: { [key: string]: number }; usersByCountry: { [key: string]: number }; usersByProvider: { [key: string]: number } }>
 */
export const getUserStatistics = async () => {
  try {
    const users = await getUsers();
    const now = new Date();
    
    let activeSubscriptions = 0;
    let expiredSubscriptions = 0;
    const usersByPlan: { [key: string]: number } = {};
    const usersByCountry: { [key: string]: number } = {};
    const usersByProvider: { [key: string]: number } = {};
    
    users.forEach(user => {
      // Count by plan
      const planName = user.subscription.planName || 'No Plan';
      usersByPlan[planName] = (usersByPlan[planName] || 0) + 1;
      
      // Count by country
      const country = user.country || 'Unknown';
      usersByCountry[country] = (usersByCountry[country] || 0) + 1;
      
      // Count by provider
      const provider = user.provider || 'Unknown';
      usersByProvider[provider] = (usersByProvider[provider] || 0) + 1;
      
      // Count active vs expired subscriptions
      if (user.subscription.expires_at) {
        const expiryDate = new Date(user.subscription.expires_at);
        if (expiryDate > now) {
          activeSubscriptions++;
        } else {
          expiredSubscriptions++;
        }
      } else {
        expiredSubscriptions++;
      }
    });
    
    return {
      totalUsers: users.length,
      activeSubscriptions,
      expiredSubscriptions,
      usersByPlan,
      usersByCountry,
      usersByProvider
    };
  } catch (error) {
    console.error('Error getting user statistics:', error);
    throw new Error('Failed to get user statistics');
  }
};

/**
 * Update user subscription
 * @param userId - The user document ID
 * @param subscriptionData - New subscription data
 * @returns Promise<{ success: boolean; message?: string }>
 */
export const updateUserSubscription = async (
  userId: string,
  subscriptionData: {
    planName: string;
    billing: string;
    activatedAt: string;
    expires_at: string;
  }
) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    
    await updateDoc(docRef, {
      subscription: subscriptionData,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'User subscription updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating user subscription:', error);
    return {
      success: false,
      message: error.message || 'Failed to update user subscription'
    };
  }
};

