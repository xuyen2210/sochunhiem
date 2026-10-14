export type UserRole = 'admin' | 'parent' | 'student';

export interface ClassInfo {
  id: string;
  classname: string; // Tên lớp (e.g. "12A1")
  name?: string; // alias
  schoolYear: string; // Năm học (e.g. "2026 - 2027")
  homeroomTeacher: string; // Giáo viên chủ nhiệm
  homeroomTeacherName?: string; // alias
  note?: string; // Ghi chú lớp
  grade?: string;
  room?: string;
  totalStudents?: number;
  teacherPhone?: string;
  teacherEmail?: string;
  teacherAvatar?: string;
  banner?: string;
}

export interface Student {
  id: string;
  classId: string;
  fullname: string; // Họ và tên
  fullName?: string; // alias
  name?: string; // alias
  dob: string; // Ngày sinh YYYY-MM-DD
  gender: 'male' | 'female';
  address: string;
  parentsId?: string; // ID phụ huynh
  parentId?: string; // alias
  status: 'active' | 'transferred' | 'deferred'; // Trạng thái học sinh: Đang học / Chuyển lớp / Nghỉ học
  studentCode?: string; // Mã học sinh
  avatar?: string;
  phone?: string;
  academicRank?: 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu';
  conduct?: 'Tốt' | 'Khá' | 'Trung bình' | 'Chưa đạt';
  notes?: string;
}

export interface Parent {
  id: string;
  fullname: string; // Họ tên phụ huynh
  fullName?: string; // alias
  phone: string;
  email?: string;
  relationship: string; // 'Bố' | 'Mẹ' | 'Người giám hộ'
  studentId: string;
  studentName?: string;
  job?: string;
  avatar?: string;
  fatherName?: string;
  motherName?: string;
}

export type ParentContact = Parent;

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
  id: string;
  classId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
  studentName?: string;
  updatedAt?: string;
}

export interface MarkAttendanceParams {
  classId: string;
  date: string;
  items: {
    studentId: string;
    studentName?: string;
    status: AttendanceStatus;
    note?: string;
  }[];
}

export interface AttendanceRange {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  month?: number; // 1 - 12
  year?: number;  // YYYY
  week?: number;  // 1 - 52
}

export type BehaviorType = 'PRAISE' | 'WARN' | 'praise' | 'warning' | 'violation';

export interface Behavior {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  type: BehaviorType; // PRAISE / WARN
  content: string; // Nội dung khen/nhắc
  points: number; // Điểm số (vd: +5, -2)
  classId?: string;
  studentName?: string;
  title?: string;
  description?: string;
  isSensitive?: boolean; // Cờ ẩn thông tin nhạy cảm trên App
  createdAt?: string;
}

export interface BehaviorStats {
  totalPraisePoints: number; // Tổng điểm khen
  warnCountWeek: number; // Số lần nhắc trong tuần
  warnCountMonth: number; // Số lần nhắc trong tháng
  totalPraises: number;
  totalWarnings: number;
}

// Tiêu chí thi đua (Emulation Criterion)
export interface EmulationCriterion {
  id: string;
  code: string; // VD: HT-01, KL-02, CC-01
  title: string; // Tên tiêu chí
  category: string; // Nhóm: Học tập & Chuyên môn, Kỷ luật & Tác phong, Chuyên cần & Nề nếp, Phong trào & Hoạt động, Đạo đức & Việc tốt
  type: 'PRAISE' | 'WARN'; // Cộng điểm (+) hoặc Trừ điểm (-)
  points: number; // Số điểm (dương cho PRAISE, âm cho WARN hoặc hiển thị tùy chọn)
  description?: string; // Hướng dẫn chi tiết
  isActive?: boolean;
}

// Mức xếp loại thi đua theo thanh điểm (Emulation Tier)
export interface EmulationTier {
  id: string;
  name: string; // Xuất sắc, Tốt, Khá, Trung bình, Cần rèn luyện
  minScore: number; // Ngưỡng điểm tối thiểu
  color: string; // Màu sắc (emerald, blue, amber, orange, rose)
  badgeClass: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

// Cấu hình thang điểm thi đua
export interface EmulationScaleConfig {
  baseScore: number; // Điểm khởi điểm (mặc định 100 điểm)
  tiers: {
    excellentMin: number; // Mặc định >= 100
    goodMin: number;      // Mặc định >= 85
    fairMin: number;      // Mặc định >= 70
    averageMin: number;   // Mặc định >= 50
  };
}

export interface Announcement {
  id: string;
  classId: string;
  title: string;
  content: string;
  target: 'parent' | 'student' | 'all';
  pinned: boolean; // TRUE / FALSE
  createdAt: string;
  // Optional / backwards compatibility fields
  isPinned?: boolean;
  category?: 'general' | 'urgent' | 'activity' | 'tuition';
  authorName?: string;
  authorRole?: string;
  viewCount?: number;
}

export interface Task {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: string;
  requireReply: boolean; // TRUE / FALSE
  createdAt: string;
  // Optional / backwards compatibility fields
  subject?: string; // Môn học (e.g. "Toán", "Văn", "Sinh hoạt lớp")
  priority?: 'low' | 'medium' | 'high';
  repliesCount?: number;
}

export interface TaskReply {
  id: string;
  taskId: string;
  studentId: string;
  parentId?: string;
  replyText: string;
  attachmentsJson?: string;
  createdAt: string;
  // Optional / backwards compatibility fields
  studentName?: string;
  content?: string; // alias of replyText
  fileUrl?: string;
  fileName?: string;
  submittedAt?: string; // alias of createdAt
  score?: number;
  teacherFeedback?: string;
}

export type MessageRole = 'TEACHER' | 'PARENT' | 'STUDENT' | 'teacher' | 'parent' | 'student';

export interface Thread {
  id: string;
  threadKey: string; // classId hoặc studentId
  participantsJson: string; // JSON string chứa danh sách người tham gia
  lastMessageAt: string;
  // Optional / backwards-compatibility fields
  classId?: string;
  parentId?: string;
  studentId?: string;
  participantName?: string;
  participantRole?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

// Alias for backwards compatibility
export type MessageThread = Thread;

export interface Message {
  id: string;
  threadId: string;
  fromRole: 'TEACHER' | 'PARENT' | 'STUDENT' | string;
  content: string;
  createdAt: string;
  // Optional / backwards compatibility fields
  senderId?: string;
  senderName?: string;
  senderRole?: 'teacher' | 'parent' | 'student' | string;
  attachments?: string[];
}

export interface Document {
  id: string;
  classId: string;
  title: string;
  url: string;
  category: 'rules' | 'plans' | 'forms' | 'curriculum' | 'schedule' | 'exam' | 'other' | string; // nội quy, kế hoạch, biểu mẫu...
  createdAt: string;
  // Backwards compatibility optional fields
  fileUrl?: string;
  fileSize?: string;
  uploadedBy?: string;
  uploadedAt?: string;
}

export interface ReportStudentStat {
  studentId: string;
  studentName: string;
  count: number;
  dates?: string[];
  notes?: string[];
  reasons?: string[];
  points?: number;
}

export interface ReportTaskStat {
  id: string;
  title: string;
  dueDate: string;
  requireReply: boolean;
  repliesCount: number;
  isOverdue: boolean;
}

export interface WeekComparisonItem {
  weekNumber: number;
  weekLabel: string;
  attendanceRate: number;
  absentCount: number;
  lateCount: number;
  praisesCount: number;
  violationsCount: number;
  repliesCount: number;
  taskCount?: number;
  trend?: 'up' | 'down' | 'equal';
}

export interface Report {
  id: string;
  classId: string;
  type: 'weekly' | 'monthly';
  periodLabel: string; // e.g. "Tuần 14 (Học kỳ 1)" or "Tháng 10/2026"
  periodNumber: number;
  year: number;
  totalStudents: number;
  attendanceRate: number; // Percentage
  lateCount: number;
  absentCount: number;
  praisesCount: number;
  violationsCount: number;
  summaryHighlights: string[];
  recommendations: string[];
  createdAt: string;
  // Detailed metrics for Weekly & Monthly reports
  absentStudents?: ReportStudentStat[];
  lateStudents?: ReportStudentStat[];
  topPraised?: ReportStudentStat[];
  topViolations?: ReportStudentStat[];
  overdueTasksCount?: number;
  overdueTasks?: ReportTaskStat[];
  repliedParentsCount?: number;
  totalRepliesCount?: number;
  totalTasksCount?: number;
  weekComparison?: WeekComparisonItem[];
}

// AI Headshot feature types
export type HeadshotStyleId = 
  | 'corporate-grey'
  | 'modern-tech'
  | 'outdoor-natural'
  | 'executive-navy'
  | 'academic-formal';

export interface HeadshotStyle {
  id: HeadshotStyleId;
  name: string;
  description: string;
  tag: string;
  bgColor: string;
  bgGradient: string;
  lightingPrompt: string;
  samplePreview: string;
}

export interface HeadshotJob {
  id: string;
  originalImage: string;
  styleId: HeadshotStyleId;
  attire: 'suit' | 'casual' | 'academic' | 'blazer';
  framing: '1:1' | '3:4' | '4:6';
  generatedImage: string;
  createdAt: string;
  status: 'idle' | 'generating' | 'completed' | 'failed';
}
