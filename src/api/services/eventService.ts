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
import { db } from '../../hooks/firebase/firebaseConfig';

export interface UploadedImage {
  gcs_blob_name: string;
  image_id: string;
  image_name: string;
  image_size: string;
  image_url: string;
}

export interface Event {
  id?: string;
  compress_rate: number;
  coverImage: string;
  createdAt?: any;
  date: string;
  description: string;
  eventName: string;
  eventType: string;
  isPublic: boolean;
  upload_timestamp?: any;
  uploaded_by: string;
  uploaded_images: UploadedImage[];
  userId: string;
}

const COLLECTION_NAME = 'events';

/**
 * Get all events from Firebase
 * @returns Promise<Event[]>
 */
export const getEvents = async (): Promise<Event[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const events: Event[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const event: Event = {
        id: doc.id,
        compress_rate: data.compress_rate || 0,
        coverImage: data.coverImage || '',
        createdAt: data.createdAt,
        date: data.date || '',
        description: data.description || '',
        eventName: data.eventName || '',
        eventType: data.eventType || '',
        isPublic: data.isPublic || false,
        upload_timestamp: data.upload_timestamp,
        uploaded_by: data.uploaded_by || '',
        uploaded_images: data.uploaded_images || [],
        userId: data.userId || ''
      };
      events.push(event);
    });

    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events from database');
  }
};

/**
 * Get events by userId
 * @param userId - The user ID to filter events
 * @returns Promise<Event[]>
 */
export const getEventsByUserId = async (userId: string): Promise<Event[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
      // Remove orderBy until index is created
      // orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const events: Event[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const event: Event = {
        id: doc.id,
        compress_rate: data.compress_rate || 0,
        coverImage: data.coverImage || '',
        createdAt: data.createdAt,
        date: data.date || '',
        description: data.description || '',
        eventName: data.eventName || '',
        eventType: data.eventType || '',
        isPublic: data.isPublic || false,
        upload_timestamp: data.upload_timestamp,
        uploaded_by: data.uploaded_by || '',
        uploaded_images: data.uploaded_images || [],
        userId: data.userId || ''
      };
      events.push(event);
    });

    // Sort manually on the client side
    events.sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA; // Descending order
    });

    return events;
  } catch (error) {
    console.error('Error fetching events by userId:', error);
    throw new Error('Failed to fetch events by userId from database');
  }
};

/**
 * Get a specific event by ID
 * @param eventId - The event document ID
 * @returns Promise<Event | null>
 */
export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, eventId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      compress_rate: data.compress_rate || 0,
      coverImage: data.coverImage || '',
      createdAt: data.createdAt,
      date: data.date || '',
      description: data.description || '',
      eventName: data.eventName || '',
      eventType: data.eventType || '',
      isPublic: data.isPublic || false,
      upload_timestamp: data.upload_timestamp,
      uploaded_by: data.uploaded_by || '',
      uploaded_images: data.uploaded_images || [],
      userId: data.userId || ''
    };
  } catch (error) {
    console.error('Error fetching event:', error);
    throw new Error('Failed to fetch event from database');
  }
};

/**
 * Get events by event type
 * @param eventType - The event type to filter by
 * @returns Promise<Event[]>
 */
export const getEventsByType = async (eventType: string): Promise<Event[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('eventType', '==', eventType),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const events: Event[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const event: Event = {
        id: doc.id,
        compress_rate: data.compress_rate || 0,
        coverImage: data.coverImage || '',
        createdAt: data.createdAt,
        date: data.date || '',
        description: data.description || '',
        eventName: data.eventName || '',
        eventType: data.eventType || '',
        isPublic: data.isPublic || false,
        upload_timestamp: data.upload_timestamp,
        uploaded_by: data.uploaded_by || '',
        uploaded_images: data.uploaded_images || [],
        userId: data.userId || ''
      };
      events.push(event);
    });

    return events;
  } catch (error) {
    console.error('Error fetching events by type:', error);
    throw new Error('Failed to fetch events by type from database');
  }
};

/**
 * Get public events only
 * @returns Promise<Event[]>
 */
export const getPublicEvents = async (): Promise<Event[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const events: Event[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const event: Event = {
        id: doc.id,
        compress_rate: data.compress_rate || 0,
        coverImage: data.coverImage || '',
        createdAt: data.createdAt,
        date: data.date || '',
        description: data.description || '',
        eventName: data.eventName || '',
        eventType: data.eventType || '',
        isPublic: data.isPublic || false,
        upload_timestamp: data.upload_timestamp,
        uploaded_by: data.uploaded_by || '',
        uploaded_images: data.uploaded_images || [],
        userId: data.userId || ''
      };
      events.push(event);
    });

    return events;
  } catch (error) {
    console.error('Error fetching public events:', error);
    throw new Error('Failed to fetch public events from database');
  }
};

/**
 * Delete an event from Firebase
 * @param eventId - The event document ID
 * @returns Promise<{ success: boolean; message?: string }>
 */
export const deleteEvent = async (eventId: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, eventId);
    await deleteDoc(docRef);
    
    return {
      success: true,
      message: 'Event deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to delete event'
    };
  }
};

/**
 * Update event information
 * @param eventId - The event document ID
 * @param updateData - Partial event data to update
 * @returns Promise<{ success: boolean; message?: string }>
 */
export const updateEvent = async (
  eventId: string, 
  updateData: Partial<Omit<Event, 'id' | 'createdAt'>>
) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, eventId);
    
    const dataToUpdate = {
      ...updateData,
      upload_timestamp: serverTimestamp()
    };
    
    await updateDoc(docRef, dataToUpdate);
    
    return {
      success: true,
      message: 'Event updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating event:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to update event'
    };
  }
};

/**
 * Get event statistics
 * @returns Promise<{ totalEvents: number; publicEvents: number; privateEvents: number; eventsByType: { [key: string]: number }; eventsByUser: { [key: string]: number } }>
 */
export const getEventStatistics = async () => {
  try {
    const events = await getEvents();
    
    let publicEvents = 0;
    let privateEvents = 0;
    const eventsByType: { [key: string]: number } = {};
    const eventsByUser: { [key: string]: number } = {};
    
    events.forEach(event => {
      // Count public vs private
      if (event.isPublic) {
        publicEvents++;
      } else {
        privateEvents++;
      }
      
      // Count by event type
      const eventType = event.eventType || 'Unknown';
      eventsByType[eventType] = (eventsByType[eventType] || 0) + 1;
      
      // Count by user
      const userId = event.userId || 'Unknown';
      eventsByUser[userId] = (eventsByUser[userId] || 0) + 1;
    });
    
    return {
      totalEvents: events.length,
      publicEvents,
      privateEvents,
      eventsByType,
      eventsByUser
    };
  } catch (error) {
    console.error('Error getting event statistics:', error);
    throw new Error('Failed to get event statistics');
  }
};

/**
 * Get events by uploaded_by field
 * @param uploadedBy - The user ID who uploaded the event
 * @returns Promise<Event[]>
 */
export const getEventsByUploadedBy = async (uploadedBy: string): Promise<Event[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('uploaded_by', '==', uploadedBy),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const events: Event[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const event: Event = {
        id: doc.id,
        compress_rate: data.compress_rate || 0,
        coverImage: data.coverImage || '',
        createdAt: data.createdAt,
        date: data.date || '',
        description: data.description || '',
        eventName: data.eventName || '',
        eventType: data.eventType || '',
        isPublic: data.isPublic || false,
        upload_timestamp: data.upload_timestamp,
        uploaded_by: data.uploaded_by || '',
        uploaded_images: data.uploaded_images || [],
        userId: data.userId || ''
      };
      events.push(event);
    });

    return events;
  } catch (error) {
    console.error('Error fetching events by uploaded_by:', error);
    throw new Error('Failed to fetch events by uploaded_by from database');
  }
};

/**
 * Get recent events (last 30 days)
 * @returns Promise<Event[]>
 */
export const getRecentEvents = async (): Promise<Event[]> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('createdAt', '>=', thirtyDaysAgo),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const events: Event[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const event: Event = {
        id: doc.id,
        compress_rate: data.compress_rate || 0,
        coverImage: data.coverImage || '',
        createdAt: data.createdAt,
        date: data.date || '',
        description: data.description || '',
        eventName: data.eventName || '',
        eventType: data.eventType || '',
        isPublic: data.isPublic || false,
        upload_timestamp: data.upload_timestamp,
        uploaded_by: data.uploaded_by || '',
        uploaded_images: data.uploaded_images || [],
        userId: data.userId || ''
      };
      events.push(event);
    });

    return events;
  } catch (error) {
    console.error('Error fetching recent events:', error);
    throw new Error('Failed to fetch recent events from database');
  }
};