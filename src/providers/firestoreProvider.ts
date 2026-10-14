import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { DataProvider } from '../core/dataProvider';
import {
  Announcement,
  Attendance,
  Behavior,
  ClassInfo,
  Document as AppDocument,
  Message,
  Parent,
  Report,
  Student,
  Task,
  TaskReply,
  Thread,
} from '../core/types';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { mockProvider } from './mockProvider';

export class FirestoreDataProvider implements DataProvider {
  // Generic CRUD
  async list<T = any>(resource: string, filter?: Record<string, any>): Promise<T[]> {
    try {
      const colRef = collection(db, resource);
      let q = colRef;
      if (filter && Object.keys(filter).length > 0) {
        const constraints = Object.entries(filter).map(([k, v]) => where(k, '==', v));
        q = query(colRef, ...constraints) as any;
      }
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        // Fallback to local storage if Firestore has not been populated yet
        return mockProvider.list<T>(resource, filter);
      }
      const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as T[];
      return items;
    } catch (err) {
      console.warn(`Firestore list [${resource}] fallback to mock:`, err);
      return mockProvider.list<T>(resource, filter);
    }
  }

  async get<T = any>(resource: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, resource, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { ...snapshot.data(), id: snapshot.id } as T;
      }
      return mockProvider.get<T>(resource, id);
    } catch (err) {
      console.warn(`Firestore get [${resource}/${id}] fallback to mock:`, err);
      return mockProvider.get<T>(resource, id);
    }
  }

  async add<T = any>(resource: string, item: Omit<T, 'id'> & { id?: string }): Promise<T> {
    const newId =
      item.id || `${resource.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const fullItem = { ...item, id: newId } as T;
    try {
      const docRef = doc(db, resource, newId);
      await setDoc(docRef, fullItem as any);
      // Also sync to mockProvider for fast local cache
      await mockProvider.add(resource, fullItem as any);
      return fullItem;
    } catch (err) {
      console.warn(`Firestore add [${resource}] error, saving to local:`, err);
      return mockProvider.add(resource, item);
    }
  }

  async bulkAdd<T = any>(
    resource: string,
    items: (Omit<T, 'id'> & { id?: string })[]
  ): Promise<T[]> {
    const addedList: T[] = [];
    try {
      const batch = writeBatch(db);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const newId =
          item.id ||
          `${resource.slice(0, 3)}-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`;
        const fullItem = { ...item, id: newId } as T;
        const docRef = doc(db, resource, newId);
        batch.set(docRef, fullItem as any);
        addedList.push(fullItem);
      }
      await batch.commit();
      if (mockProvider.bulkAdd) {
        await mockProvider.bulkAdd(resource, items);
      }
      return addedList;
    } catch (err) {
      console.warn(`Firestore bulkAdd [${resource}] error, fallback to local:`, err);
      if (mockProvider.bulkAdd) {
        return mockProvider.bulkAdd(resource, items);
      }
      return [];
    }
  }

  async update<T = any>(resource: string, id: string, patch: Partial<T>): Promise<T> {
    try {
      const docRef = doc(db, resource, id);
      await setDoc(docRef, patch as any, { merge: true });
      return mockProvider.update<T>(resource, id, patch);
    } catch (err) {
      console.warn(`Firestore update [${resource}/${id}] fallback to local:`, err);
      return mockProvider.update<T>(resource, id, patch);
    }
  }

  async remove(resource: string, id: string): Promise<boolean> {
    try {
      const docRef = doc(db, resource, id);
      await deleteDoc(docRef);
      return mockProvider.remove(resource, id);
    } catch (err) {
      console.warn(`Firestore remove [${resource}/${id}] fallback to local:`, err);
      return mockProvider.remove(resource, id);
    }
  }

  // Specialized: markAttendance
  async markAttendance(
    params:
      | {
          classId: string;
          date: string;
          items: {
            studentId: string;
            studentName?: string;
            status: any;
            note?: string;
          }[];
        }
      | string,
    date?: string,
    records?: {
      studentId: string;
      studentName?: string;
      status: any;
      note?: string;
    }[]
  ): Promise<Attendance[]> {
    return mockProvider.markAttendance(params, date, records);
  }

  async listAttendanceByStudent(
    studentId: string,
    range?: any
  ): Promise<Attendance[]> {
    return mockProvider.listAttendanceByStudent(studentId, range);
  }

  async addBehavior(data: Omit<Behavior, 'id' | 'createdAt'>): Promise<Behavior> {
    const res = await mockProvider.addBehavior(data);
    try {
      await setDoc(doc(db, 'behaviors', res.id), res);
    } catch (err) {
      console.warn('Sync behavior to Firestore error:', err);
    }
    return res;
  }

  async updateBehavior(id: string, data: Partial<Behavior>): Promise<Behavior> {
    const res = await mockProvider.updateBehavior(id, data);
    try {
      await setDoc(doc(db, 'behaviors', id), data, { merge: true });
    } catch (err) {
      console.warn('Update behavior in Firestore error:', err);
    }
    return res;
  }

  async removeBehavior(id: string): Promise<boolean> {
    const res = await mockProvider.removeBehavior(id);
    try {
      await deleteDoc(doc(db, 'behaviors', id));
    } catch (err) {
      console.warn('Delete behavior in Firestore error:', err);
    }
    return res;
  }

  async getBehaviorStats(classId?: string) {
    return mockProvider.getBehaviorStats(classId);
  }

  async listBehaviorsByStudent(studentId: string): Promise<Behavior[]> {
    return mockProvider.listBehaviorsByStudent(studentId);
  }

  async sendMessage(
    threadId: string,
    message: any,
    senderName?: string,
    role?: any,
    content?: string,
    attachments?: string[]
  ): Promise<Message> {
    return mockProvider.sendMessage(threadId, message, senderName, role, content, attachments);
  }

  async listMessages(threadId: string): Promise<Message[]> {
    return mockProvider.listMessages(threadId);
  }

  async listThreads(filter?: { classId?: string; threadKey?: string }): Promise<Thread[]> {
    return mockProvider.listThreads(filter);
  }

  async getOrCreateThread(threadKey: string, payload?: Partial<Thread>): Promise<Thread> {
    return mockProvider.getOrCreateThread(threadKey, payload);
  }

  async replyTask(taskId: string, payload: any): Promise<TaskReply> {
    return mockProvider.replyTask(taskId, payload);
  }

  async listTasksByClass(classId: string): Promise<Task[]> {
    return mockProvider.listTasksByClass(classId);
  }

  async getTaskReplies(taskId: string): Promise<TaskReply[]> {
    return mockProvider.getTaskReplies(taskId);
  }

  async reportsWeekly(classId: string, weekRange?: any, year?: number): Promise<Report> {
    return mockProvider.reportsWeekly(classId, weekRange, year);
  }

  async reportsMonthly(classId: string, month?: any, year?: number): Promise<Report> {
    return mockProvider.reportsMonthly(classId, month, year);
  }

  async listAnnouncementsByClass(classId: string): Promise<Announcement[]> {
    return mockProvider.listAnnouncementsByClass(classId);
  }

  async togglePinAnnouncement(id: string): Promise<Announcement> {
    return mockProvider.togglePinAnnouncement(id);
  }

  async listDocumentsByClass(classId: string, category?: string): Promise<AppDocument[]> {
    return mockProvider.listDocumentsByClass(classId, category);
  }

  // Clear mock data forwarder
  clearMockData(keepRealClass = true, customClass?: Partial<ClassInfo>) {
    return mockProvider.clearMockData(keepRealClass, customClass);
  }

  seedData(force = false) {
    return mockProvider.seedData(force);
  }
}

export const firestoreProvider = new FirestoreDataProvider();
