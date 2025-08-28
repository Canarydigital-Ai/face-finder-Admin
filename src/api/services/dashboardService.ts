
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../hooks/firebase/firebaseConfig';


export interface Event {
  id?: string;
  eventName: string;
  eventType: string;
  date: string;
  description: string;
  coverImage: string;
  isPublic: boolean;
  userId: string;
  uploaded_by: string;
  createdAt: Timestamp;
  upload_timestamp: Timestamp;
  uploaded_images: {
    gcs_blob_name: string;
    image_id: string;
    image_name: string;
    image_size: string;
    image_url: string;
  }[];
  compress_rate: number;
}

export interface GuestUser {
  id?: string;
  name: string;
  email: string;
  mobile: string;
  eventId: string;
  photoUploaded: boolean;
  createdAt: Timestamp;
  searchCompletedAt?: Timestamp;
  sessionId: string;
  searchResults: {
    faceDetectionStatus: boolean;
    facesDetected: number;
    galleryFacesSearched: number;
    thresholdUsed: number;
    totalMatches: number;
  };
}

export interface Payment {
  id?: string;
  amount: number;
  billing: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  payment_status: string;
  plan_name: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  user_id: string;
}

export interface UserDashboard {
  id?: string;
  userId: string;
  createdAt: string;
  lastUpdated: string;
  galleryVisits: number;
  totalSelfieUploads: number;
  totalMatchesFound: number;
  dailyGalleryVisits: { [date: string]: number };
  dailyMatches: { [date: string]: number };
  dailyUploads: { [date: string]: number };
  lastSearch: {
    eventId: string;
    faceDetectionStatus: boolean;
    facesDetected: number;
    galleryFacesSearched: number;
    matchesFound: number;
    thresholdUsed: number;
    timestamp: string;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalGuestUsers: number;
  totalPayments: number;
  totalRevenue: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  recentEvents: Event[];
  recentPayments: Payment[];
  monthlyRevenue: { [month: string]: number };
  eventTypeDistribution: { [type: string]: number };
  subscriptionDistribution: { [plan: string]: number };
  dailyStats: { [date: string]: { users: number; events: number; revenue: number } };
}

const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events', 
  GUEST_USERS: 'guestUsers',
  PAYMENTS: 'payments',
  SUBSCRIPTIONS: 'subscriptions',
  USER_DASHBOARD: 'userDashboard'
};

/**
 * Get total count from a collection
 */
const getCollectionCount = async (collectionName: string): Promise<number> => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.size;
  } catch (error) {
    console.error(`Error counting ${collectionName}:`, error);
    return 0;
  }
};

/**
 * Get recent events
 */
export const getRecentEvents = async (limitCount: number = 5): Promise<Event[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.EVENTS),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[];
  } catch (error) {
    console.error('Error fetching recent events:', error);
    return [];
  }
};

/**
 * Get recent payments
 */
export const getRecentPayments = async (limitCount: number = 5): Promise<Payment[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PAYMENTS),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    return [];
  }
};

/**
 * Get all payments for revenue calculation
 */
export const getAllPayments = async (): Promise<Payment[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.PAYMENTS));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];
  } catch (error) {
    console.error('Error fetching all payments:', error);
    return [];
  }
};

/**
 * Get all events for analysis
 */
export const getAllEvents = async (): Promise<Event[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.EVENTS));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Event[];
  } catch (error) {
    console.error('Error fetching all events:', error);
    return [];
  }
};

/**
 * Get subscription distribution
 */
export const getSubscriptionDistribution = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    const distribution: { [plan: string]: number } = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const planName = data.subscription?.planName || 'No Plan';
      distribution[planName] = (distribution[planName] || 0) + 1;
    });
    
    return distribution;
  } catch (error) {
    console.error('Error getting subscription distribution:', error);
    return {};
  }
};

/**
 * Get comprehensive dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get basic counts
    const [totalUsers, totalEvents, totalGuestUsers, totalPayments] = await Promise.all([
      getCollectionCount(COLLECTIONS.USERS),
      getCollectionCount(COLLECTIONS.EVENTS), 
      getCollectionCount(COLLECTIONS.GUEST_USERS),
      getCollectionCount(COLLECTIONS.PAYMENTS)
    ]);

    // Get detailed data
    const [recentEvents, recentPayments, allPayments, allEvents, subscriptionDistribution] = await Promise.all([
      getRecentEvents(),
      getRecentPayments(),
      getAllPayments(),
      getAllEvents(),
      getSubscriptionDistribution()
    ]);

    // Calculate revenue metrics
    const totalRevenue = allPayments.reduce((sum, payment) => 
      payment.payment_status === 'completed' ? sum + payment.amount : sum, 0
    );

    const activeSubscriptions = allPayments.filter(payment => payment.is_active).length;
    const expiredSubscriptions = allPayments.filter(payment => !payment.is_active).length;

    // Monthly revenue calculation - with proper date handling
    const monthlyRevenue: { [month: string]: number } = {};
    allPayments.forEach(payment => {
      if (payment.payment_status === 'completed' && payment.created_at) {
        try {
          // Handle different date formats
          let date: Date;
          if (typeof payment.created_at === 'string') {
            // Try parsing the string date
            date = new Date(payment.created_at);
          } else if (payment.created_at && typeof payment.created_at === 'object' && 'seconds' in payment.created_at) {
            // Handle Firebase Timestamp
            date = new Date((payment.created_at as any).seconds * 1000);
          } else {
            // Fallback to current date if parsing fails
            date = new Date();
          }
          
          // Validate the date
          if (!isNaN(date.getTime())) {
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + payment.amount;
          }
        } catch (error) {
          console.warn('Invalid date in payment:', payment.id, payment.created_at);
        }
      }
    });

    // Event type distribution
    const eventTypeDistribution: { [type: string]: number } = {};
    allEvents.forEach(event => {
      const type = event.eventType || 'Other';
      eventTypeDistribution[type] = (eventTypeDistribution[type] || 0) + 1;
    });

    // Daily stats for last 30 days - with safe date handling
    const dailyStats: { [date: string]: { users: number; events: number; revenue: number } } = {};
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    last30Days.forEach(date => {
      dailyStats[date] = { users: 0, events: 0, revenue: 0 };
    });

    // Populate daily stats with safe date parsing
    allPayments.forEach(payment => {
      if (payment.payment_status === 'completed' && payment.created_at) {
        try {
          let paymentDate: string;
          if (typeof payment.created_at === 'string') {
            const date = new Date(payment.created_at);
            if (!isNaN(date.getTime())) {
              paymentDate = date.toISOString().split('T')[0];
            } else {
              return; // Skip invalid dates
            }
          } else if (payment.created_at && typeof payment.created_at === 'object' && 'seconds' in payment.created_at) {
            const date = new Date((payment.created_at as any).seconds * 1000);
            paymentDate = date.toISOString().split('T')[0];
          } else {
            return; // Skip invalid dates
          }
          
          if (dailyStats[paymentDate]) {
            dailyStats[paymentDate].revenue += payment.amount;
          }
        } catch (error) {
          console.warn('Error processing payment date:', payment.id, error);
        }
      }
    });

    return {
      totalUsers,
      totalEvents,
      totalGuestUsers,
      totalPayments,
      totalRevenue,
      activeSubscriptions,
      expiredSubscriptions,
      recentEvents,
      recentPayments,
      monthlyRevenue,
      eventTypeDistribution,
      subscriptionDistribution,
      dailyStats
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw new Error('Failed to load dashboard statistics');
  }
};

/**
 * Get user activity data
 */
export const getUserActivity = async (userId: string): Promise<UserDashboard | null> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.USER_DASHBOARD),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as UserDashboard;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return null;
  }
};

