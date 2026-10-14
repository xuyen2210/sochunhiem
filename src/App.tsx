import React, { useState, useEffect } from 'react';
import defaultProvider from './core/provider';
import {
  Announcement,
  Attendance,
  Behavior,
  ClassInfo,
  Document,
  Message,
  MessageThread,
  Parent,
  Report,
  Student,
  Task,
  TaskReply,
} from './core/types';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminClasses } from './components/admin/AdminClasses';
import { AdminStudents } from './components/admin/AdminStudents';
import { AdminParents } from './components/admin/AdminParents';
import { AdminAttendance } from './components/admin/AdminAttendance';
import { AdminBehaviors } from './components/admin/AdminBehaviors';
import { AdminTasks } from './components/admin/AdminTasks';
import { AdminAnnouncements } from './components/admin/AdminAnnouncements';
import { AdminMessages } from './components/admin/AdminMessages';
import { AdminDocuments } from './components/admin/AdminDocuments';
import { AdminReports } from './components/admin/AdminReports';
import { AdminGoogleWorkspace } from './components/admin/AdminGoogleWorkspace';
import { DataManagementModal } from './components/admin/DataManagementModal';
import { AppStudentPortal } from './components/app/AppStudentPortal';
import { AppAttendance } from './components/app/AppAttendance';
import { AppBehavior } from './components/app/AppBehavior';
import { AppAnnouncements } from './components/app/AppAnnouncements';
import { AppDocuments } from './components/app/AppDocuments';
import { AppTasks } from './components/app/AppTasks';
import { AppMessages } from './components/app/AppMessages';
import { HeadshotStudio } from './components/headshot/HeadshotStudio';

export default function App() {
  // Navigation Route state
  const [currentRoute, setCurrentRoute] = useState<string>('/admin/dashboard');

  // Core domain data states
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [currentClassId, setCurrentClassId] = useState<string>('cls-12a1');
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskReplies, setTaskReplies] = useState<TaskReply[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  // Load all data from defaultProvider (which points to mockProvider with localStorage)
  const loadData = async () => {
    try {
      const clsList = await defaultProvider.list<ClassInfo>('classes');
      setClasses(clsList);
      if (clsList.length > 0 && (!currentClassId || !clsList.some((c) => c.id === currentClassId))) {
        setCurrentClassId(clsList[0].id);
      }

      const [
        stdList,
        parList,
        attList,
        behList,
        annList,
        tskList,
        rplList,
        thrList,
        msgList,
        docList,
        repList,
      ] = await Promise.all([
        defaultProvider.list<Student>('students'),
        defaultProvider.list<Parent>('parents'),
        defaultProvider.list<Attendance>('attendance'),
        defaultProvider.list<Behavior>('behaviors'),
        defaultProvider.list<Announcement>('announcements'),
        defaultProvider.list<Task>('tasks'),
        defaultProvider.list<TaskReply>('taskReplies'),
        defaultProvider.list<MessageThread>('threads'),
        defaultProvider.list<Message>('messages'),
        defaultProvider.list<Document>('documents'),
        defaultProvider.list<Report>('reports'),
      ]);

      setStudents(stdList);
      setParents(parList);
      setAttendance(attList);
      setBehaviors(behList);
      setAnnouncements(annList);
      setTasks(tskList);
      setTaskReplies(rplList);
      setThreads(thrList);
      setMessages(msgList);
      setDocuments(docList);
      setReports(repList);
    } catch (err) {
      console.error('Failed to load data from provider', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);

  // Reset seedData action
  const handleResetSeed = () => {
    if (window.confirm('Khôi phục dữ liệu mẫu ban đầu của Hệ thống?')) {
      (defaultProvider as any).seedData(true);
      loadData();
    }
  };

  // Clear mock data handler (Xóa dữ liệu mẫu, thiết lập lớp thực tế)
  const handleClearMockData = async (customClass: Partial<ClassInfo>) => {
    if ((defaultProvider as any).clearMockData) {
      (defaultProvider as any).clearMockData(true, customClass);
    }
    await loadData();
    const updatedClasses = await defaultProvider.list<ClassInfo>('classes');
    if (updatedClasses.length > 0) {
      setCurrentClassId(updatedClasses[0].id);
    }
  };

  // Restore seedData action
  const handleRestoreMockData = async () => {
    (defaultProvider as any).seedData(true);
    await loadData();
    const updatedClasses = await defaultProvider.list<ClassInfo>('classes');
    if (updatedClasses.length > 0) {
      setCurrentClassId(updatedClasses[0].id);
    }
  };

  const activeClass = classes.find((c) => c.id === currentClassId) || classes[0] || {
    id: 'cls-12a1',
    classname: 'Lớp 12A1',
    name: 'Lớp 12A1',
    schoolYear: '2026 - 2027',
    homeroomTeacher: 'Thầy Nguyễn Văn Xuyên',
    homeroomTeacherName: 'Thầy Nguyễn Văn Xuyên',
    note: 'Lớp trọng điểm khối 12',
  };

  // --- 1. ClassInfo CRUD Handlers ---
  const handleCreateClass = async (data: Omit<ClassInfo, 'id'>) => {
    await defaultProvider.add<ClassInfo>('classes', data);
    const updated = await defaultProvider.list<ClassInfo>('classes');
    setClasses(updated);
  };

  const handleUpdateClass = async (id: string, data: Partial<ClassInfo>) => {
    await defaultProvider.update<ClassInfo>('classes', id, data);
    const updated = await defaultProvider.list<ClassInfo>('classes');
    setClasses(updated);
  };

  const handleDeleteClass = async (id: string) => {
    await defaultProvider.remove('classes', id);
    const updated = await defaultProvider.list<ClassInfo>('classes');
    setClasses(updated);
    if (currentClassId === id && updated.length > 0) {
      setCurrentClassId(updated[0].id);
    }
  };

  // --- 2. Students CRUD Handlers ---
  const handleCreateStudent = async (studentData: Omit<Student, 'id'>) => {
    await defaultProvider.add<Student>('students', studentData);
    const updated = await defaultProvider.list<Student>('students');
    setStudents(updated);
  };

  const handleImportStudents = async (
    newStudents: (Omit<Student, 'id'> & {
      parentName?: string;
      parentPhone?: string;
      parentRelationship?: string;
    })[]
  ) => {
    const studentItems: Omit<Student, 'id'>[] = [];
    for (const item of newStudents) {
      const { parentName, parentPhone, parentRelationship, ...studentData } = item as any;
      studentItems.push(studentData);
    }

    if (defaultProvider.bulkAdd) {
      const createdStudents = await defaultProvider.bulkAdd<Student>('students', studentItems);
      // Link parents if any
      for (let i = 0; i < newStudents.length; i++) {
        const item = newStudents[i];
        if (item.parentName && item.parentPhone) {
          const st = createdStudents[i];
          const newParent = await defaultProvider.add<Parent>('parents', {
            fullname: item.parentName,
            phone: item.parentPhone,
            relationship: item.parentRelationship || 'Bố',
            studentId: st.id,
            studentName: st.fullname || st.fullName,
          });
          await defaultProvider.update<Student>('students', st.id, {
            parentsId: newParent.id,
            parentId: newParent.id,
          });
        }
      }
    } else {
      for (let i = 0; i < newStudents.length; i++) {
        const item = newStudents[i];
        const created = await defaultProvider.add<Student>('students', studentItems[i]);
        if (item.parentName && item.parentPhone) {
          const newParent = await defaultProvider.add<Parent>('parents', {
            fullname: item.parentName,
            phone: item.parentPhone,
            relationship: item.parentRelationship || 'Bố',
            studentId: created.id,
            studentName: created.fullname || created.fullName,
          });
          await defaultProvider.update<Student>('students', created.id, {
            parentsId: newParent.id,
            parentId: newParent.id,
          });
        }
      }
    }

    const [updatedStudents, updatedParents] = await Promise.all([
      defaultProvider.list<Student>('students'),
      defaultProvider.list<Parent>('parents'),
    ]);
    setStudents(updatedStudents);
    setParents(updatedParents);
  };

  const handleUpdateStudent = async (id: string, data: Partial<Student>) => {
    await defaultProvider.update<Student>('students', id, data);
    const updated = await defaultProvider.list<Student>('students');
    setStudents(updated);
  };

  const handleDeleteStudent = async (id: string) => {
    await defaultProvider.remove('students', id);
    const updated = await defaultProvider.list<Student>('students');
    setStudents(updated);
  };

  // --- 3. Parents CRUD Handlers ---
  const handleCreateParent = async (parentData: Omit<Parent, 'id'>) => {
    await defaultProvider.add<Parent>('parents', parentData);
    const updated = await defaultProvider.list<Parent>('parents');
    setParents(updated);
  };

  const handleImportParents = async (newParents: Omit<Parent, 'id'>[]) => {
    let createdParents: Parent[] = [];
    if (defaultProvider.bulkAdd) {
      createdParents = await defaultProvider.bulkAdd<Parent>('parents', newParents);
    } else {
      for (const p of newParents) {
        const created = await defaultProvider.add<Parent>('parents', p);
        createdParents.push(created);
      }
    }

    // Bidirectional sync: update each student's parentsId and parentId
    for (const p of createdParents) {
      if (p.studentId) {
        await defaultProvider.update<Student>('students', p.studentId, {
          parentsId: p.id,
          parentId: p.id,
        });
      }
    }

    const [updatedParents, updatedStudents] = await Promise.all([
      defaultProvider.list<Parent>('parents'),
      defaultProvider.list<Student>('students'),
    ]);
    setParents(updatedParents);
    setStudents(updatedStudents);
  };

  const handleUpdateParent = async (id: string, data: Partial<Parent>) => {
    await defaultProvider.update<Parent>('parents', id, data);
    const updated = await defaultProvider.list<Parent>('parents');
    setParents(updated);
  };

  const handleDeleteParent = async (id: string) => {
    await defaultProvider.remove('parents', id);
    const updated = await defaultProvider.list<Parent>('parents');
    setParents(updated);
  };

  // --- Specialized Domain Actions ---
  const handleSaveAttendance = async (
    classId: string,
    date: string,
    records: {
      studentId: string;
      studentName?: string;
      status: any;
      note?: string;
    }[]
  ) => {
    await defaultProvider.markAttendance({ classId, date, items: records });
    const updated = await defaultProvider.list<Attendance>('attendance');
    setAttendance(updated);
  };

  const handleAddBehavior = async (data: Omit<Behavior, 'id' | 'createdAt'>) => {
    await defaultProvider.addBehavior(data);
    const updated = await defaultProvider.list<Behavior>('behaviors');
    setBehaviors(updated);
  };

  const handleUpdateBehavior = async (id: string, data: Partial<Behavior>) => {
    await defaultProvider.updateBehavior(id, data);
    const updated = await defaultProvider.list<Behavior>('behaviors');
    setBehaviors(updated);
  };

  const handleDeleteBehavior = async (id: string) => {
    await defaultProvider.removeBehavior(id);
    const updated = await defaultProvider.list<Behavior>('behaviors');
    setBehaviors(updated);
  };

  const handleSendMessage = async (
    threadId: string,
    messagePayload:
      | {
          fromRole: 'TEACHER' | 'PARENT' | 'STUDENT' | string;
          content: string;
          senderName?: string;
          senderId?: string;
        }
      | string,
    senderName?: string,
    role?: 'teacher' | 'parent' | 'student',
    content?: string
  ) => {
    await defaultProvider.sendMessage(threadId, messagePayload, senderName, role, content);
    const [updatedMsgs, updatedThrs] = await Promise.all([
      defaultProvider.list<Message>('messages'),
      defaultProvider.list<MessageThread>('threads'),
    ]);
    setMessages(updatedMsgs);
    setThreads(updatedThrs);
  };

  const handleReplyTask = async (
    taskId: string,
    studentId: string,
    studentName: string,
    content: string,
    fileUrl?: string,
    fileName?: string
  ) => {
    await defaultProvider.replyTask(taskId, studentId, studentName, content, fileUrl, fileName);
    const [updatedReplies, updatedTasks] = await Promise.all([
      defaultProvider.list<TaskReply>('taskReplies'),
      defaultProvider.list<Task>('tasks'),
    ]);
    setTaskReplies(updatedReplies);
    setTasks(updatedTasks);
  };

  const handleGenerateWeeklyReport = async (classId: string, week: number, year: number) => {
    const rep = await defaultProvider.reportsWeekly(classId || activeClass.id, week, year);
    const updated = await defaultProvider.list<Report>('reports');
    setReports(updated);
    return rep;
  };

  const handleGenerateMonthlyReport = async (classId: string, month: number, year: number) => {
    const rep = await defaultProvider.reportsMonthly(classId || activeClass.id, month, year);
    const updated = await defaultProvider.list<Report>('reports');
    setReports(updated);
    return rep;
  };

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'repliesCount'>) => {
    await defaultProvider.add<Task>('tasks', {
      ...taskData,
      createdAt: new Date().toISOString(),
      repliesCount: 0,
    });
    const updated = await defaultProvider.list<Task>('tasks');
    setTasks(updated);
  };

  const handleUpdateTask = async (id: string, patch: Partial<Task>) => {
    await defaultProvider.update<Task>('tasks', id, patch);
    const updated = await defaultProvider.list<Task>('tasks');
    setTasks(updated);
  };

  const handleDeleteTask = async (id: string) => {
    await defaultProvider.remove('tasks', id);
    const updated = await defaultProvider.list<Task>('tasks');
    setTasks(updated);
  };

  const handleAddAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'createdAt'>) => {
    await defaultProvider.add<Announcement>('announcements', {
      ...announcementData,
      createdAt: new Date().toISOString(),
    });
    const updated = await defaultProvider.list<Announcement>('announcements');
    setAnnouncements(updated);
  };

  const handleUpdateAnnouncement = async (id: string, patch: Partial<Announcement>) => {
    await defaultProvider.update<Announcement>('announcements', id, patch);
    const updated = await defaultProvider.list<Announcement>('announcements');
    setAnnouncements(updated);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    await defaultProvider.remove('announcements', id);
    const updated = await defaultProvider.list<Announcement>('announcements');
    setAnnouncements(updated);
  };

  const handleTogglePinAnnouncement = async (id: string) => {
    await defaultProvider.togglePinAnnouncement(id);
    const updated = await defaultProvider.list<Announcement>('announcements');
    setAnnouncements(updated);
  };

  const handleAddDocument = async (docData: Omit<Document, 'id' | 'createdAt'>) => {
    await defaultProvider.add<Document>('documents', {
      ...docData,
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
    });
    const updated = await defaultProvider.list<Document>('documents');
    setDocuments(updated);
  };

  const handleUpdateDocument = async (id: string, patch: Partial<Document>) => {
    await defaultProvider.update<Document>('documents', id, patch);
    const updated = await defaultProvider.list<Document>('documents');
    setDocuments(updated);
  };

  const handleDeleteDocument = async (id: string) => {
    await defaultProvider.remove('documents', id);
    const updated = await defaultProvider.list<Document>('documents');
    setDocuments(updated);
  };

  // Avatar updates from Headshot studio
  const handleUpdateStudentAvatar = async (studentId: string, avatarUrl: string) => {
    await defaultProvider.update<Student>('students', studentId, { avatar: avatarUrl });
    const updated = await defaultProvider.list<Student>('students');
    setStudents(updated);
  };

  const handleUpdateTeacherAvatar = async (avatarUrl: string) => {
    await defaultProvider.update<ClassInfo>('classes', activeClass.id, {
      teacherAvatar: avatarUrl,
    });
    const updated = await defaultProvider.list<ClassInfo>('classes');
    setClasses(updated);
  };

  const handleNavigateToHeadshotWithPhoto = (_photoUrl: string, _studentId: string) => {
    setCurrentRoute('/headshot');
  };

  const isAdmin = currentRoute.startsWith('/admin') || currentRoute === '/headshot';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
        onResetSeed={handleResetSeed}
        onOpenDataManagement={() => setIsDataManagementOpen(true)}
        classNameInfo={activeClass.classname || activeClass.name || 'Lớp 12A1'}
        teacherName={activeClass.homeroomTeacher || activeClass.homeroomTeacherName || 'Thầy Nguyễn Văn Xuyên'}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar (Desktop) */}
        <div className="hidden md:block">
          <Sidebar
            currentRoute={currentRoute}
            onNavigate={(route) => setCurrentRoute(route)}
            isAdmin={isAdmin}
            unreadMessagesCount={1}
            pendingTasksCount={tasks.length}
          />
        </div>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* 1. Dashboard: số HS, tỉ lệ chuyên cần tuần này, thông báo mới, việc cần xử lí */}
          {currentRoute === '/admin/dashboard' && (
            <AdminDashboard
              classInfo={activeClass}
              students={students}
              attendance={attendance}
              behaviors={behaviors}
              announcements={announcements}
              tasks={tasks}
              onNavigate={(route) => setCurrentRoute(route)}
              onOpenDataManagement={() => setIsDataManagementOpen(true)}
            />
          )}

          {/* 2. Lớp học (ClassInfo): CRUD {id, classname, schoolYear, homeroomTeacher, note} */}
          {currentRoute === '/admin/classes' && (
            <AdminClasses
              classes={classes}
              students={students}
              currentClassId={currentClassId}
              onSelectCurrentClass={(id) => setCurrentClassId(id)}
              onCreateClass={handleCreateClass}
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
            />
          )}

          {/* 3. Học sinh (Students): CRUD theo lớp {id, classId, fullname, dob, gender, address, parentsId, status} */}
          {currentRoute === '/admin/students' && (
            <AdminStudents
              students={students}
              classes={classes}
              parents={parents}
              currentClassId={currentClassId}
              onCreateStudent={handleCreateStudent}
              onImportStudents={handleImportStudents}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onNavigateToHeadshotWithPhoto={handleNavigateToHeadshotWithPhoto}
              onOpenDataManagement={() => setIsDataManagementOpen(true)}
            />
          )}

          {/* 4. Phụ huynh (Parents): CRUD {id, fullname, phone, email, relationship, studentId} */}
          {currentRoute === '/admin/parents' && (
            <AdminParents
              parents={parents}
              students={students}
              classes={classes}
              onCreateParent={handleCreateParent}
              onImportParents={handleImportParents}
              onUpdateParent={handleUpdateParent}
              onDeleteParent={handleDeleteParent}
            />
          )}

          {/* Sổ Điểm danh */}
          {currentRoute === '/admin/attendance' && (
            <AdminAttendance
              students={students}
              classes={classes}
              currentClassId={currentClassId}
              initialAttendance={attendance}
              onSaveAttendance={handleSaveAttendance}
            />
          )}

          {/* Thi đua (Nề nếp & Khen thưởng - Tiêu chí & Xếp loại) */}
          {(currentRoute === '/admin/behavior' || currentRoute === '/admin/behaviors' || currentRoute === '/admin/emulation') && (
            <AdminBehaviors
              behaviors={behaviors}
              students={students}
              classes={classes}
              currentClassId={currentClassId}
              onAddBehavior={handleAddBehavior}
              onUpdateBehavior={handleUpdateBehavior}
              onDeleteBehavior={handleDeleteBehavior}
            />
          )}

          {/* Bài tập & Nhắc việc - Admin /admin/tasks */}
          {currentRoute === '/admin/tasks' && (
            <AdminTasks
              tasks={tasks}
              taskReplies={taskReplies}
              students={students}
              parents={parents}
              classes={classes}
              currentClassId={currentClassId}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {/* Thông báo lớp - Admin /admin/announcements */}
          {currentRoute === '/admin/announcements' && (
            <AdminAnnouncements
              announcements={announcements}
              classes={classes}
              currentClassId={currentClassId}
              onAddAnnouncement={handleAddAnnouncement}
              onUpdateAnnouncement={handleUpdateAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
              onTogglePinAnnouncement={handleTogglePinAnnouncement}
            />
          )}

          {/* Tin nhắn Phụ huynh - Admin /admin/messages */}
          {currentRoute === '/admin/messages' && (
            <AdminMessages
              threads={threads}
              messages={messages}
              parents={parents}
              students={students}
              classes={classes}
              currentClassId={currentClassId}
              onSendMessage={handleSendMessage}
              onRefresh={loadData}
            />
          )}

          {/* Tài liệu & Biểu mẫu - Admin /admin/documents */}
          {currentRoute === '/admin/documents' && (
            <AdminDocuments
              documents={documents}
              classes={classes}
              currentClassId={currentClassId}
              onAddDocument={handleAddDocument}
              onUpdateDocument={handleUpdateDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {/* Báo cáo Tuần & Tháng - Admin /admin/reports */}
          {currentRoute === '/admin/reports' && (
            <AdminReports
              reports={reports}
              classes={classes}
              currentClassId={currentClassId}
              attendance={attendance}
              behaviors={behaviors}
              tasks={tasks}
              taskReplies={taskReplies}
              students={students}
              onGenerateWeeklyReport={handleGenerateWeeklyReport}
              onGenerateMonthlyReport={handleGenerateMonthlyReport}
            />
          )}

          {/* Google Drive & Sheets Hub - Admin /admin/workspace */}
          {currentRoute === '/admin/workspace' && (
            <AdminGoogleWorkspace
              classes={classes}
              currentClassId={currentClassId}
              students={students}
              parents={parents}
              attendance={attendance}
              behaviors={behaviors}
              onAddDocument={handleAddDocument}
              onImportStudents={handleImportStudents}
            />
          )}

          {/* App: Trang /app/attendance (Lịch sử chuyên cần theo tháng/tuần) */}
          {currentRoute === '/app/attendance' && (
            <AppAttendance
              students={students}
              currentStudentId={students[0]?.id}
            />
          )}

          {/* App: Trang /app/behavior (Lịch sử nề nếp khen/nhắc của HS) */}
          {currentRoute === '/app/behavior' && (
            <AppBehavior
              students={students}
              currentStudentId={students[0]?.id}
              onNavigate={(route) => setCurrentRoute(route)}
            />
          )}

          {/* App: Trang /app/announcements (Xem theo lớp, ưu tiên pinned lên đầu) */}
          {currentRoute === '/app/announcements' && (
            <AppAnnouncements
              classes={classes}
              currentClassId={currentClassId}
              onNavigate={(route) => setCurrentRoute(route)}
            />
          )}

          {/* App: Trang /app/documents (Xem và tải/xem link, UI rõ ràng) */}
          {currentRoute === '/app/documents' && (
            <AppDocuments
              classes={classes}
              currentClassId={currentClassId}
              onNavigate={(route) => setCurrentRoute(route)}
            />
          )}

          {/* App: Trang /app/tasks (Xem task, nếu requireReply thì cho gửi phản hồi + đính kèm link, cảnh báo quá hạn) */}
          {currentRoute === '/app/tasks' && (
            <AppTasks
              students={students}
              parents={parents}
              classes={classes}
              currentStudentId={students[0]?.id}
              onNavigate={(route) => setCurrentRoute(route)}
            />
          )}

          {/* App: Trang /app/messages (Phụ huynh/học sinh nhắn cho GVCN theo thread của con/lớp) */}
          {currentRoute === '/app/messages' && (
            <AppMessages
              students={students}
              parents={parents}
              classes={classes}
              currentStudentId={students[0]?.id}
              onNavigate={(route) => setCurrentRoute(route)}
              onRefresh={loadData}
            />
          )}

          {/* Student/Parent Portal Routes (Overview) */}
          {(currentRoute === '/app' || currentRoute === '/app/portal') && (
            <AppStudentPortal
              students={students}
              parents={parents}
              attendance={attendance}
              behaviors={behaviors}
              announcements={announcements}
              tasks={tasks}
              taskReplies={taskReplies}
              threads={threads}
              messages={messages}
              documents={documents}
              onReplyTask={handleReplyTask}
              onSendMessage={handleSendMessage}
              onNavigate={(route) => setCurrentRoute(route)}
            />
          )}

          {/* AI Headshot Photographer Studio */}
          {currentRoute === '/headshot' && (
            <HeadshotStudio
              students={students}
              onUpdateStudentAvatar={handleUpdateStudentAvatar}
              onUpdateTeacherAvatar={handleUpdateTeacherAvatar}
            />
          )}
        </main>
      </div>

      {/* Data Management Modal: Xóa dữ liệu mẫu & Nhập dữ liệu thực */}
      <DataManagementModal
        isOpen={isDataManagementOpen}
        onClose={() => setIsDataManagementOpen(false)}
        classes={classes}
        students={students}
        currentClassId={currentClassId}
        onClearMockData={handleClearMockData}
        onRestoreMockData={handleRestoreMockData}
        onImportStudents={handleImportStudents}
        onCreateStudent={handleCreateStudent}
        onRefreshData={loadData}
      />
    </div>
  );
}
