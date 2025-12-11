import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    QueryDocumentSnapshot,
    serverTimestamp,
    startAfter,
    Timestamp,
    Unsubscribe,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from './config';

// Base database service class
export class DatabaseService {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Get collection reference
  getCollectionRef() {
    return collection(db, this.collectionName);
  }

  // Get document reference
  getDocRef(id: string) {
    return doc(db, this.collectionName, id);
  }

  // Create a new document
  async create(data: any): Promise<string> {
    try {
      const docRef = await addDoc(this.getCollectionRef(), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  // Get a single document by ID
  async getById(id: string): Promise<DocumentData | null> {
    try {
      const docSnap = await getDoc(this.getDocRef(id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  // Get all documents
  async getAll(): Promise<DocumentData[]> {
    try {
      const querySnapshot = await getDocs(this.getCollectionRef());
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  }

  // Update a document
  async update(id: string, data: any): Promise<void> {
    try {
      await updateDoc(this.getDocRef(id), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Delete a document
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(this.getDocRef(id));
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Query documents with conditions
  async queryDocuments(
    conditions: Array<{field: string, operator: any, value: any}> = [],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'desc',
    limitCount?: number
  ): Promise<DocumentData[]> {
    try {
      let q = query(this.getCollectionRef());

      // Add where conditions
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });

      // Add ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }

      // Add limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }

  // Listen to real-time updates
  onSnapshot(
    callback: (data: DocumentData[]) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    return onSnapshot(
      this.getCollectionRef(),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(data);
      },
      errorCallback
    );
  }

  // Listen to single document changes
  onDocumentSnapshot(
    id: string,
    callback: (data: DocumentData | null) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    return onSnapshot(
      this.getDocRef(id),
      (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() });
        } else {
          callback(null);
        }
      },
      errorCallback
    );
  }
}

// Utility functions for common operations
export const dbUtils = {
  // Convert Firestore timestamp to Date
  timestampToDate: (timestamp: Timestamp): Date => {
    return timestamp.toDate();
  },

  // Get server timestamp
  getServerTimestamp: () => serverTimestamp(),

  // Create a paginated query
  createPaginatedQuery: (
    collectionName: string,
    pageSize: number,
    lastDoc?: QueryDocumentSnapshot<DocumentData>,
    orderByField: string = 'createdAt',
    orderDirection: 'asc' | 'desc' = 'desc'
  ) => {
    let q = query(
      collection(db, collectionName),
      orderBy(orderByField, orderDirection),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    return q;
  }
};

export default DatabaseService;