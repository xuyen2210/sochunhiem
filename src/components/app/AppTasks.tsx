import React, { useState, useEffect } from 'react';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Calendar,
  Search,
  Filter,
  Send,
  Link as LinkIcon,
  Sparkles,
  BookOpen,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  FileText,
  User,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { defaultProvider } from '../../core/provider';
import { Task, TaskReply, Student, ParentContact, ClassInfo } from '../../core/types';

interface AppTasksProps {
  students?: Student[];
  parents?: ParentContact[];
  classes?: ClassInfo[];
  currentStudentId?: string;
  onNavigate?: (route: string) => void;
}

export const AppTasks: React.FC<AppTasksProps> = ({
  students = [],
  parents = [],
  classes = [],
  currentStudentId,
  onNavigate,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentStudentId || students[0]?.id || 'std-01'
  );

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskReplies, setTaskReplies] = useState<TaskReply[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');

  // Submission Form State (mapped by taskId)
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [linksList, setLinksList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const currentStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];
  const currentParent = parents.find((p) => p.studentId === currentStudent?.id);
  const studentClass = classes.find((c) => c.id === currentStudent?.classId) || classes[0];

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTasks, fetchedReplies] = await Promise.all([
        defaultProvider.list<Task>('tasks'),
        defaultProvider.list<TaskReply>('taskReplies'),
      ]);
      setTasks(fetchedTasks);
      setTaskReplies(fetchedReplies);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStudentId]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to parse attachments
  const parseAttachments = (attachmentsJson?: string, fileUrl?: string): string[] => {
    const list: string[] = [];
    if (attachmentsJson) {
      try {
        const parsed = JSON.parse(attachmentsJson);
        if (Array.isArray(parsed)) {
          list.push(...parsed.filter((item) => typeof item === 'string'));
        } else if (typeof parsed === 'string') {
          list.push(parsed);
        }
      } catch {
        if (attachmentsJson.startsWith('http')) {
          list.push(attachmentsJson);
        }
      }
    }
    if (fileUrl && !list.includes(fileUrl)) {
      list.push(fileUrl);
    }
    return list;
  };

  // Find replies for current student
  const getStudentReply = (taskId: string) => {
    return taskReplies.find(
      (r) => r.taskId === taskId && r.studentId === currentStudent?.id
    );
  };

  // Open submission form
  const handleOpenSubmit = (task: Task) => {
    const existing = getStudentReply(task.id);
    setSubmittingTaskId(task.id);
    if (existing) {
      setReplyText(existing.replyText || existing.content || '');
      setLinksList(parseAttachments(existing.attachmentsJson, existing.fileUrl));
    } else {
      setReplyText('');
      setLinksList([]);
    }
    setLinkInput('');
  };

  const handleAddLink = () => {
    const trimmed = linkInput.trim();
    if (!trimmed) return;
    if (!linksList.includes(trimmed)) {
      setLinksList([...linksList, trimmed]);
    }
    setLinkInput('');
  };

  const handleRemoveLink = (index: number) => {
    setLinksList(linksList.filter((_, idx) => idx !== index));
  };

  const handleSubmitReply = async (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    if (!replyText.trim() && linksList.length === 0) return;

    setIsSubmitting(true);
    try {
      const attachments = [...linksList];
      if (linkInput.trim() && !attachments.includes(linkInput.trim())) {
        attachments.push(linkInput.trim());
      }

      await defaultProvider.replyTask(taskId, {
        studentId: currentStudent.id,
        parentId: currentParent?.id,
        replyText: replyText.trim(),
        attachmentsJson: JSON.stringify(attachments),
        studentName: currentStudent.fullname || currentStudent.fullName,
      });

      await loadData();
      setSubmittingTaskId(null);
      setReplyText('');
      setLinksList([]);
      setLinkInput('');
      showToast('Đã gửi phản hồi bài tập thành công!');
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter tasks for current student's class
  const studentTasks = tasks.filter(
    (t) => !t.classId || !currentStudent?.classId || t.classId === currentStudent.classId
  );

  // Categorize tasks
  const overdueTasks = studentTasks.filter((t) => {
    const reply = getStudentReply(t.id);
    return t.dueDate < todayStr && t.requireReply && !reply;
  });

  const pendingTasks = studentTasks.filter((t) => {
    const reply = getStudentReply(t.id);
    return t.requireReply && !reply;
  });

  const completedTasks = studentTasks.filter((t) => {
    const reply = getStudentReply(t.id);
    return !t.requireReply || !!reply;
  });

  // Filtered list based on active tab and search
  const filteredTasks = studentTasks.filter((t) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.subject && t.subject.toLowerCase().includes(q));
      if (!match) return false;
    }

    const reply = getStudentReply(t.id);
    const isOverdue = t.dueDate < todayStr && t.requireReply && !reply;

    if (activeTab === 'pending') {
      return t.requireReply && !reply;
    }
    if (activeTab === 'completed') {
      return !t.requireReply || !!reply;
    }
    if (activeTab === 'overdue') {
      return isOverdue;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-4 w-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <ListTodo className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Bài Tập & Nhắc Việc
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem yêu cầu từ GVCN, nộp bài làm và đính kèm link minh chứng trực tuyến
              </p>
            </div>
          </div>
        </div>

        {/* Student Selector */}
        {students.length > 1 && (
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <User className="h-4 w-4 text-slate-500" />
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {students.map((std) => (
                <option key={std.id} value={std.id}>
                  {std.fullname || std.fullName} - {std.classId === 'cls-12a1' ? 'Lớp 12A1' : std.classId}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* OVERDUE ALERT BANNER (CRITICAL REQUIREMENT) */}
      {overdueTasks.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4.5 shadow-xs flex items-start space-x-3 text-rose-900 animate-pulse">
          <div className="p-2 rounded-xl bg-rose-200 text-rose-700 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center space-x-1.5">
              <span>Cảnh Báo Quá Hạn Nộp Bài ({overdueTasks.length} nhiệm vụ)</span>
            </h4>
            <p className="text-xs text-rose-700 mt-1">
              Học sinh có {overdueTasks.length} bài tập đã vượt quá hạn nộp quy định. Vui lòng khẩn trương hoàn thành và gửi phản hồi để GVCN chấm điểm đối soát!
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {overdueTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTab('overdue');
                    handleOpenSubmit(t);
                  }}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg shadow-2xs flex items-center space-x-1"
                >
                  <span>{t.title} (Hạn: {t.dueDate})</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Tổng nhiệm vụ</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{studentTasks.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <p className="text-[11px] font-semibold text-amber-700">Cần phản hồi / Chưa nộp</p>
          <p className="text-xl font-bold text-amber-700 mt-1">{pendingTasks.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <p className="text-[11px] font-semibold text-emerald-700">Đã hoàn thành</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{completedTasks.length}</p>
        </div>
        <div className={`bg-white p-4 rounded-xl border shadow-2xs ${
          overdueTasks.length > 0 ? 'border-rose-300 bg-rose-50/40 text-rose-700' : 'border-slate-200 text-slate-700'
        }`}>
          <p className="text-[11px] font-semibold">Đã quá hạn</p>
          <p className="text-xl font-bold mt-1">{overdueTasks.length}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Tab Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tất cả ({studentTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
            }`}
          >
            Chưa nộp ({pendingTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              activeTab === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Đã nộp ({completedTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              activeTab === 'overdue'
                ? 'bg-rose-600 text-white'
                : 'bg-white border border-slate-200 text-rose-600 hover:bg-rose-50'
            }`}
          >
            Quá hạn ({overdueTasks.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên bài tập, môn học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
          Đang tải danh sách bài tập...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-dashed border-slate-200">
          <ListTodo className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          Không có nhiệm vụ nào trong mục này.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const studentReply = getStudentReply(task.id);
            const isOverdue = task.dueDate < todayStr && task.requireReply && !studentReply;
            const isDueToday = task.dueDate === todayStr && task.requireReply && !studentReply;
            const isFormOpen = submittingTaskId === task.id;
            const attachments = studentReply
              ? parseAttachments(studentReply.attachmentsJson, studentReply.fileUrl)
              : [];

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-4 ${
                  isOverdue
                    ? 'border-rose-300 ring-1 ring-rose-300'
                    : studentReply
                    ? 'border-emerald-200 bg-white'
                    : 'border-slate-200'
                }`}
              >
                {/* Top Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700">
                      {task.subject || 'Sinh hoạt'}
                    </span>

                    {task.requireReply ? (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center space-x-1">
                        <Send className="h-3 w-3" />
                        <span>Bắt buộc phản hồi</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        Nhắc việc theo dõi
                      </span>
                    )}

                    {task.priority === 'high' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Ưu tiên cao
                      </span>
                    )}
                  </div>

                  {/* Due Date & Warning Tags */}
                  <div className="flex items-center space-x-2">
                    {isOverdue ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold shadow-xs">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>ĐÃ QUÁ HẠN: {task.dueDate}</span>
                      </span>
                    ) : isDueToday ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-xs">
                        <Clock className="h-3.5 w-3.5" />
                        <span>HẾT HẠN HÔM NAY: {task.dueDate}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-xs text-slate-500 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Hạn nộp: <strong>{task.dueDate}</strong></span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                    {task.description}
                  </p>
                </div>

                {/* Submission State or Form */}
                {task.requireReply && (
                  <div className="pt-2 border-t border-slate-100">
                    {studentReply && !isFormOpen ? (
                      /* Submitted state */
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-xs">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>
                              Em đã nộp phản hồi vào lúc{' '}
                              {new Date(
                                studentReply.createdAt || studentReply.submittedAt || ''
                              ).toLocaleString('vi-VN')}
                            </span>
                          </div>

                          <button
                            onClick={() => handleOpenSubmit(task)}
                            className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold rounded-lg transition-colors flex items-center space-x-1"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>Chỉnh sửa / Nộp lại</span>
                          </button>
                        </div>

                        {/* Content */}
                        <div className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-emerald-100 whitespace-pre-line">
                          {studentReply.replyText || studentReply.content || '(Không có nội dung văn bản)'}
                        </div>

                        {/* Attached Links */}
                        {attachments.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[11px] font-bold text-slate-600 flex items-center space-x-1">
                              <LinkIcon className="h-3 w-3 text-blue-600" />
                              <span>Tệp & Link đính kèm ({attachments.length}):</span>
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {attachments.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  <span className="truncate max-w-xs">{link}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Teacher grading if available */}
                        {studentReply.score !== undefined && (
                          <div className="pt-2 border-t border-emerald-200 flex items-center space-x-3 text-xs">
                            <span className="font-bold text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded-md">
                              Điểm số: {studentReply.score}/10
                            </span>
                            {studentReply.teacherFeedback && (
                              <span className="text-slate-600 italic">
                                Nhận xét của Thầy: &ldquo;{studentReply.teacherFeedback}&rdquo;
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : isFormOpen ? (
                      /* Active Submission Form */
                      <form
                        onSubmit={(e) => handleSubmitReply(e, task.id)}
                        className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-purple-900 flex items-center space-x-1.5">
                            <Send className="h-3.5 w-3.5 text-purple-600" />
                            <span>
                              {studentReply ? 'Cập Nhật Phản Hồi Bài Tập' : 'Gửi Phản Hồi & Nộp Bài'}
                            </span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setSubmittingTaskId(null)}
                            className="text-xs text-slate-500 hover:text-slate-700"
                          >
                            Đóng biểu mẫu
                          </button>
                        </div>

                        {/* Reply Textarea */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Nội dung bài làm / Báo cáo kết quả <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Nhập nội dung bài giải, câu trả lời hoặc báo cáo tiến độ..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                            required={linksList.length === 0}
                          />
                        </div>

                        {/* Link Attachment Input (attachmentsJson) */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-700 block">
                            Đính kèm đường link bài làm (attachmentsJson)
                          </label>
                          <p className="text-[11px] text-slate-500">
                            Dán link Google Drive, OneDrive, link ảnh chân dung hoặc link tài liệu bài giải của em:
                          </p>

                          <div className="flex items-center space-x-2">
                            <input
                              type="url"
                              placeholder="https://drive.google.com/file/... hoặc https://..."
                              value={linkInput}
                              onChange={(e) => setLinkInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddLink();
                                }
                              }}
                              className="flex-1 text-xs rounded-xl border border-slate-300 p-2 bg-white text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={handleAddLink}
                              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center space-x-1"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Thêm link</span>
                            </button>
                          </div>

                          {/* List of attached links */}
                          {linksList.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              {linksList.map((link, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs text-blue-700 font-medium"
                                >
                                  <span className="truncate max-w-sm flex items-center space-x-1.5">
                                    <LinkIcon className="h-3 w-3 text-slate-400 shrink-0" />
                                    <span>{link}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLink(idx)}
                                    className="text-slate-400 hover:text-rose-600 p-1"
                                    title="Xóa link"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Submit Action Buttons */}
                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-purple-100">
                          <button
                            type="button"
                            onClick={() => setSubmittingTaskId(null)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>{isSubmitting ? 'Đang gửi...' : 'Nộp Phản Hồi Ngay'}</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Not submitted button */
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-slate-500 flex items-center space-x-1.5">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                          <span>Chưa nộp bài làm hoặc báo cáo hoàn thành.</span>
                        </div>

                        <button
                          onClick={() => handleOpenSubmit(task)}
                          className={`px-4 py-2 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-colors ${
                            isOverdue
                              ? 'bg-rose-600 hover:bg-rose-700 animate-pulse'
                              : 'bg-purple-600 hover:bg-purple-700'
                          }`}
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>{isOverdue ? 'Khẩn Trương Nộp Bài' : 'Gửi Phản Hồi / Nộp Bài'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
