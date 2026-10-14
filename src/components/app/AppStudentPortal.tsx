import React, { useState } from 'react';
import {
  User,
  Users,
  CalendarCheck2,
  Award,
  ListTodo,
  Megaphone,
  MessageSquare,
  FileText,
  Send,
  Upload,
  CheckCircle2,
  Clock,
  ThumbsUp,
  Camera,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  Announcement,
  Attendance,
  Behavior,
  Document,
  Message,
  MessageThread,
  Parent,
  Student,
  Task,
  TaskReply,
} from '../../core/types';

interface AppStudentPortalProps {
  students: Student[];
  parents: Parent[];
  attendance: Attendance[];
  behaviors: Behavior[];
  announcements: Announcement[];
  tasks: Task[];
  taskReplies: TaskReply[];
  threads: MessageThread[];
  messages: Message[];
  documents: Document[];
  onReplyTask: (
    taskId: string,
    studentId: string,
    studentName: string,
    content: string,
    fileUrl?: string,
    fileName?: string
  ) => Promise<void>;
  onSendMessage: (
    threadId: string,
    senderId: string,
    senderName: string,
    role: 'teacher' | 'parent' | 'student',
    content: string
  ) => Promise<void>;
  onNavigate: (route: string) => void;
}

export const AppStudentPortal: React.FC<AppStudentPortalProps> = ({
  students,
  parents,
  attendance,
  behaviors,
  announcements,
  tasks,
  taskReplies,
  threads,
  messages,
  documents,
  onReplyTask,
  onSendMessage,
  onNavigate,
}) => {
  // Current logged in persona (Student or Parent)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'std-01');
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'messages' | 'announcements' | 'documents'>('overview');

  // Task submission form state
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [taskSuccessMsg, setTaskSuccessMsg] = useState<string | null>(null);

  // Message chat state
  const [chatInput, setChatInput] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const currentParent = parents.find((p) => p.studentId === currentStudent?.id);

  // Filter student-specific records
  const studentAttendance = attendance.filter((a) => a.studentId === currentStudent?.id);
  const studentBehaviors = behaviors.filter((b) => b.studentId === currentStudent?.id);
  const studentReplies = taskReplies.filter((r) => r.studentId === currentStudent?.id);

  // Find or determine thread for this parent/student with teacher
  const studentThread = threads.find(
    (t) => t.studentId === currentStudent?.id || t.parentId === currentParent?.id
  ) || threads[0];

  const threadMessages = studentThread
    ? messages.filter((m) => m.threadId === studentThread.id)
    : [];

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingTaskId || !submissionContent) return;

    setIsSubmittingTask(true);
    try {
      await onReplyTask(
        submittingTaskId,
        currentStudent.id,
        currentStudent.fullname || currentStudent.fullName || 'Học sinh',
        submissionContent,
        submissionFileName ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80' : undefined,
        submissionFileName || undefined
      );

      setTaskSuccessMsg('Nộp phản hồi bài tập thành công!');
      setTimeout(() => setTaskSuccessMsg(null), 3000);
      setSubmittingTaskId(null);
      setSubmissionContent('');
      setSubmissionFileName('');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !studentThread) return;

    setIsSendingMsg(true);
    try {
      await onSendMessage(
        studentThread.id,
        currentParent?.id || currentStudent.id,
        currentParent?.fullname || currentParent?.fullName || currentStudent.fullname || currentStudent.fullName || 'Phụ huynh',
        'parent',
        chatInput.trim()
      );
      setChatInput('');
    } finally {
      setIsSendingMsg(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Profile & Persona Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={currentStudent.avatar}
              alt={currentStudent.fullName}
              className="h-16 w-16 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
            />
            <button
              onClick={() => onNavigate('/headshot')}
              title="Chụp ảnh thẻ AI Headshot"
              className="absolute -bottom-1.5 -right-1.5 p-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-md"
            >
              <Camera className="h-3 w-3 text-amber-300" />
            </button>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                {currentStudent.studentCode}
              </span>
              <span className="text-xs text-slate-500">Lớp 12A1</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              {currentStudent.fullName}
            </h2>
            <p className="text-xs text-slate-500">
              Phụ huynh: <strong>{currentParent?.fullName || 'Chưa cập nhật'}</strong> ({currentParent?.phone || 'Chưa có SĐT'})
            </p>
          </div>
        </div>

        {/* Switch Persona */}
        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-600 shrink-0">
            Xem hồ sơ học sinh:
          </span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="text-xs font-bold rounded-lg border-slate-200 bg-white p-2 text-slate-800"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.fullName} ({st.studentCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Sổ Liên Lạc Con Em
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'tasks'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Nhiệm Vụ & Nộp Bài ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'messages'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Nhắn Tin Với GVCN
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'announcements'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Bảng Tin Lớp ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'documents'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Kho Tài Liệu ({documents.length})
        </button>
      </div>

      {taskSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">{taskSuccessMsg}</span>
        </div>
      )}

      {/* Tab: Overview (Sổ liên lạc) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Academic & Conduct summary (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <CalendarCheck2 className="h-4 w-4 text-emerald-600" />
                  <span>Nhật Ký Điểm Danh & Chuyên Cần</span>
                </h3>
                <button
                  onClick={() => onNavigate('/app/attendance')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                >
                  <span>Xem lịch sử tuần/tháng &rarr;</span>
                </button>
              </div>

              {studentAttendance.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Chưa có bản ghi điểm danh</p>
              ) : (
                <div className="space-y-2">
                  {studentAttendance.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">
                          Ngày {att.date}
                        </span>
                        {att.note && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Ghi chú: {att.note}
                          </p>
                        )}
                      </div>
                      <span
                        className={`font-bold px-2.5 py-1 rounded-lg text-[10px] ${
                          att.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : att.status === 'late'
                            ? 'bg-amber-100 text-amber-800'
                            : att.status === 'excused'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {att.status === 'present'
                          ? 'Có mặt đúng giờ'
                          : att.status === 'late'
                          ? 'Đi muộn'
                          : att.status === 'excused'
                          ? 'Nghỉ có phép'
                          : 'Vắng không phép'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Behaviors / Praises */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Award className="h-4 w-4 text-amber-500" />
                <span>Nhật Ký Khen Thưởng & Nhắc Nhở Nề Nếp</span>
              </h3>

              {studentBehaviors.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Học sinh duy trì nề nếp tốt, chưa có ghi nhận nhắc nhở.</p>
              ) : (
                <div className="space-y-2.5">
                  {studentBehaviors.map((beh) => (
                    <div
                      key={beh.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{beh.title}</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                            beh.type === 'praise'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {beh.points >= 0 ? `+${beh.points}` : beh.points} điểm
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {beh.description}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(beh.date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Photo Studio Banner & Homeroom Contact (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Student Photo Card */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 rounded-2xl p-6 text-white border border-indigo-800 shadow-md space-y-4">
              <div className="flex items-center space-x-2 text-indigo-300">
                <Camera className="h-4 w-4 text-amber-300" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Ảnh Thẻ Học Sinh & CCCD
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Nhà trường yêu cầu 01 ảnh chân dung chuẩn phông Corporate Grey hoặc Phông Xanh để làm hồ sơ thi và thẻ học sinh điện tử.
              </p>
              <button
                onClick={() => onNavigate('/headshot')}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-xs transition-all"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Tạo Ảnh Thẻ AI Ngay</span>
              </button>
            </div>

            {/* Homeroom Teacher Contact */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Giáo Viên Chủ Nhiệm
              </h4>
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Thầy Xuyên"
                  className="h-12 w-12 rounded-full object-cover border border-blue-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Thầy Nguyễn Văn Xuyên
                  </h4>
                  <p className="text-xs text-blue-600 font-medium">0918 345 678</p>
                  <p className="text-[11px] text-slate-500">
                    xuyennv.gdtxlongmy@haugiang.edu.vn
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('messages')}
                className="w-full mt-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Gửi tin nhắn trực tiếp cho Thầy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tasks & Submission (replyTask) */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-0.5">
                  Danh Sách Nhiệm Vụ Cần Hoàn Thành
                </h3>
                <p className="text-xs text-slate-500">
                  Học sinh gửi nội dung phản hồi và đính kèm file theo yêu cầu
                </p>
              </div>
              <button
                onClick={() => onNavigate('/app/tasks')}
                className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <span>Mở trang chuyên mục /app/tasks</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {tasks.map((task) => {
                const myReply = studentReplies.find((r) => r.taskId === task.id);
                const isSubmitting = submittingTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                        {task.subject}
                      </span>
                      <span className="text-xs text-amber-700 font-semibold flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        Hạn: {task.dueDate}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">
                      {task.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {task.description}
                    </p>

                    {/* Has Submitted reply? */}
                    {myReply ? (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                        <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Em đã nộp bài vào {new Date(myReply.submittedAt || myReply.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p className="text-slate-700">{myReply.content}</p>
                        {myReply.fileName && (
                          <p className="text-blue-700 font-medium">📎 {myReply.fileName}</p>
                        )}
                        {myReply.teacherFeedback && (
                          <p className="text-slate-600 italic pt-1">
                            Nhận xét của GVCN: &ldquo;{myReply.teacherFeedback}&rdquo; (Điểm: {myReply.score}/10)
                          </p>
                        )}
                      </div>
                    ) : isSubmitting ? (
                      /* Submission form */
                      <form onSubmit={handleTaskSubmit} className="pt-2 border-t border-slate-100 space-y-3">
                        <textarea
                          rows={3}
                          placeholder="Nhập nội dung bài làm hoặc báo cáo hoàn thành..."
                          value={submissionContent}
                          onChange={(e) => setSubmissionContent(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500"
                          required
                        />

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Tên tệp hoặc ảnh minh chứng (Ví dụ: anh_the_4x6.jpg, de_cuong_toan.pdf):
                          </label>
                          <input
                            type="text"
                            placeholder="anh_the_hoc_sinh.jpg"
                            value={submissionFileName}
                            onChange={(e) => setSubmissionFileName(e.target.value)}
                            className="w-full text-xs rounded-lg border border-slate-300 p-2"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setSubmittingTaskId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Đóng
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingTask}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                          >
                            {isSubmittingTask ? 'Đang gửi...' : 'Nộp Bài Ngay'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          setSubmittingTaskId(task.id);
                          setSubmissionContent('');
                          setSubmissionFileName('');
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Nộp Phản Hồi / Gửi Bài Làm</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Messages with GVCN */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="GVCN"
                className="h-10 w-10 rounded-full object-cover border border-blue-200"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Thầy Nguyễn Văn Xuyên (GVCN Lớp 12A1)
                </h4>
                <p className="text-[11px] text-slate-500">Kênh trao đổi học sinh - phụ huynh</p>
              </div>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('/app/messages')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl"
              >
                <span>Mở trang tin nhắn đầy đủ</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
            {threadMessages.map((msg) => {
              const isMe = msg.senderRole === 'parent' || msg.senderRole === 'student';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] text-slate-400 mb-1 px-1">
                    {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
            <input
              type="text"
              placeholder="Nhập nội dung nhắn gửi thầy chủ nhiệm..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 text-xs py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              disabled={isSendingMsg || !chatInput.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Tab: Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {[...announcements]
            .sort((a, b) => {
              const aPinned = !!(a.pinned ?? a.isPinned);
              const bPinned = !!(b.pinned ?? b.isPinned);
              if (aPinned !== bPinned) return aPinned ? -1 : 1;
              return (b.createdAt || '').localeCompare(a.createdAt || '');
            })
            .map((ann) => {
              const isPinned = !!(ann.pinned ?? ann.isPinned);
              return (
                <div
                  key={ann.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs space-y-2 ${
                    isPinned ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {isPinned && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                        ĐÃ GHIM
                      </span>
                    )}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {ann.target === 'parent' ? 'Phụ huynh' : ann.target === 'student' ? 'Học sinh' : 'Toàn thể lớp'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(ann.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>
                </div>
              );
            })}
        </div>
      )}

      {/* Tab: Documents */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {doc.category === 'rules' ? 'Nội quy' : doc.category === 'plans' ? 'Kế hoạch/TKB' : doc.category === 'forms' ? 'Biểu mẫu' : 'Đề cương & Tài liệu'}
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-2">{doc.title}</h4>
              </div>
              <a
                href={doc.url || doc.fileUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="self-end px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold"
              >
                Xem & Tải về
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
