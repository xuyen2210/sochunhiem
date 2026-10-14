import {
  Announcement,
  Attendance,
  Behavior,
  Document as AppDocument,
  Message,
  Report,
  Task,
  TaskReply,
  Thread,
} from './types';

export interface DataProvider {
  // Generic CRUD
  list<T = any>(resource: string, filter?: Record<string, any>): Promise<T[]>;
  get<T = any>(resource: string, id: string): Promise<T | null>;
  add<T = any>(resource: string, item: Omit<T, 'id'> & { id?: string }): Promise<T>;
  bulkAdd?<T = any>(resource: string, items: (Omit<T, 'id'> & { id?: string })[]): Promise<T[]>;
  update<T = any>(resource: string, id: string, item: Partial<T>): Promise<T>;
  remove(resource: string, id: string): Promise<boolean>;

  // Specialized Attendance methods according to Prompt 1.1 & Prompt 1.3
  markAttendance(
    params: {
      classId: string;
      date: string;
      items: {
        studentId: string;
        studentName?: string;
        status: any;
        note?: string;
      }[];
    } | string,
    date?: string,
    records?: {
      studentId: string;
      studentName?: string;
      status: any;
      note?: string;
    }[]
  ): Promise<Attendance[]>;

  listAttendanceByStudent(
    studentId: string,
    range?: {
      from?: string;
      to?: string;
      month?: number;
      year?: number;
      week?: number;
    } | string
  ): Promise<Attendance[]>;

  addBehavior(
    data: Omit<Behavior, 'id' | 'createdAt'>
  ): Promise<Behavior>;

  updateBehavior(
    id: string,
    data: Partial<Behavior>
  ): Promise<Behavior>;

  removeBehavior(
    id: string
  ): Promise<boolean>;

  getBehaviorStats(
    classId?: string
  ): Promise<import('./types').BehaviorStats>;

  listBehaviorsByStudent(
    studentId: string
  ): Promise<Behavior[]>;

  sendMessage(
    threadId: string,
    message:
      | {
          fromRole?: 'TEACHER' | 'PARENT' | 'STUDENT' | string;
          content: string;
          senderId?: string;
          senderName?: string;
          role?: 'teacher' | 'parent' | 'student';
          attachments?: string[];
        }
      | string,
    senderName?: string,
    role?: 'teacher' | 'parent' | 'student',
    content?: string,
    attachments?: string[]
  ): Promise<Message>;

  listMessages(threadId: string): Promise<Message[]>;
  listThreads(filter?: { classId?: string; threadKey?: string }): Promise<Thread[]>;
  getOrCreateThread(threadKey: string, payload?: Partial<Thread>): Promise<Thread>;

  replyTask(
    taskId: string,
    payload:
      | {
          studentId: string;
          parentId?: string;
          replyText: string;
          attachmentsJson?: string;
          studentName?: string;
          content?: string;
          fileUrl?: string;
          fileName?: string;
        }
      | string,
    studentName?: string,
    content?: string,
    fileUrl?: string,
    fileName?: string
  ): Promise<TaskReply>;

  listTasksByClass(classId: string): Promise<Task[]>;
  getTaskReplies(taskId: string): Promise<TaskReply[]>;

  reportsWeekly(
    classId: string,
    weekRange?: number | string | { from?: string; to?: string; week?: number },
    year?: number
  ): Promise<Report>;

  reportsMonthly(
    classId: string,
    month?: number | string,
    year?: number
  ): Promise<Report>;

  // Specialized Announcements methods
  listAnnouncementsByClass(classId: string): Promise<Announcement[]>;
  togglePinAnnouncement(id: string): Promise<Announcement>;

  // Specialized Documents methods
  listDocumentsByClass(classId: string, category?: string): Promise<AppDocument[]>;
}
