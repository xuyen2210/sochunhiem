import React, { useState } from 'react';
import {
  ListTodo,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  AlertTriangle,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  MessageSquare,
  Users,
  Phone,
  Check,
  X,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  Send,
} from 'lucide-react';
import { Task, TaskReply, Student, ParentContact, ClassInfo } from '../../core/types';

interface AdminTasksProps {
  tasks: Task[];
  taskReplies: TaskReply[];
  students?: Student[];
  parents?: ParentContact[];
  classes?: ClassInfo[];
  currentClassId?: string;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'repliesCount'>) => Promise<void>;
  onUpdateTask?: (id: string, patch: Partial<Task>) => Promise<void>;
  onDeleteTask?: (id: string) => Promise<void>;
}

export const AdminTasks: React.FC<AdminTasksProps> = ({
  tasks,
  taskReplies,
  students = [],
  parents = [],
  classes = [],
  currentClassId = 'cls-12a1',
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(currentClassId);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'requireReply' | 'optional' | 'overdue'>('all');
  const [activeReplyTab, setActiveReplyTab] = useState<'all' | 'replied' | 'unreplied'>('all');

  // Selected task
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // Create form state
  const [formClassId, setFormClassId] = useState(selectedClassId);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSubject, setFormSubject] = useState('Sinh hoạt lớp');
  const [formDueDate, setFormDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [formRequireReply, setFormRequireReply] = useState(true);
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Filter tasks by class and search
  const classTasks = tasks.filter((t) => !t.classId || t.classId === selectedClassId);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = classTasks.filter((t) => {
    if (searchTerm) {
      const match =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.subject && t.subject.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!match) return false;
    }
    if (filterType === 'requireReply') return t.requireReply === true;
    if (filterType === 'optional') return t.requireReply === false;
    if (filterType === 'overdue') return t.dueDate < todayStr;
    return true;
  });

  // Selected task object
  const activeTask =
    filteredTasks.find((t) => t.id === selectedTaskId) ||
    filteredTasks[0] ||
    classTasks[0] ||
    tasks[0] ||
    null;

  // Students of current class
  const classStudents = students.filter(
    (s) => !s.classId || s.classId === selectedClassId
  );

  // Current task replies
  const currentReplies = activeTask
    ? taskReplies.filter((r) => r.taskId === activeTask.id)
    : [];

  // Map students with their replies for the active task
  const studentRoster = classStudents.map((std) => {
    const reply = currentReplies.find((r) => r.studentId === std.id);
    const parent = parents.find((p) => p.studentId === std.id);
    return {
      student: std,
      parent,
      reply,
      hasReplied: !!reply,
    };
  });

  const repliedCount = studentRoster.filter((r) => r.hasReplied).length;
  const unrepliedCount = studentRoster.length - repliedCount;
  const replyPercentage =
    studentRoster.length > 0
      ? Math.round((repliedCount / studentRoster.length) * 100)
      : 0;

  // Filtered student roster based on tab
  const displayedRoster = studentRoster.filter((item) => {
    if (activeReplyTab === 'replied') return item.hasReplied;
    if (activeReplyTab === 'unreplied') return !item.hasReplied;
    return true;
  });

  const handleOpenCreateModal = () => {
    setFormClassId(selectedClassId);
    setFormTitle('');
    setFormDescription('');
    setFormSubject('Sinh hoạt lớp');
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setFormDueDate(d.toISOString().split('T')[0]);
    setFormRequireReply(true);
    setFormPriority('high');
    setIsCreateModalOpen(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddTask({
        classId: formClassId,
        title: formTitle.trim(),
        description: formDescription.trim(),
        dueDate: formDueDate,
        requireReply: formRequireReply,
        subject: formSubject,
        priority: formPriority,
      });

      setIsCreateModalOpen(false);
      showToast('Đã tạo nhiệm vụ mới thành công!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setFormClassId(task.classId);
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormSubject(task.subject || 'Sinh hoạt lớp');
    setFormDueDate(task.dueDate);
    setFormRequireReply(task.requireReply ?? true);
    setFormPriority(task.priority || 'medium');
  };

  const handleSaveEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !formTitle.trim()) return;

    setIsSubmitting(true);
    try {
      if (onUpdateTask) {
        await onUpdateTask(editingTask.id, {
          classId: formClassId,
          title: formTitle.trim(),
          description: formDescription.trim(),
          dueDate: formDueDate,
          requireReply: formRequireReply,
          subject: formSubject,
          priority: formPriority,
        });
        showToast('Cập nhật nhiệm vụ thành công!');
      }
      setEditingTask(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTaskId) return;
    setIsSubmitting(true);
    try {
      if (onDeleteTask) {
        await onDeleteTask(deletingTaskId);
        showToast('Đã xóa nhiệm vụ thành công!');
      }
      if (selectedTaskId === deletingTaskId) {
        setSelectedTaskId(null);
      }
      setDeletingTaskId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to parse attachments
  const parseAttachments = (attachmentsJson?: string, fileUrl?: string): string[] => {
    const links: string[] = [];
    if (attachmentsJson) {
      try {
        const parsed = JSON.parse(attachmentsJson);
        if (Array.isArray(parsed)) {
          links.push(...parsed.filter((item) => typeof item === 'string'));
        } else if (typeof parsed === 'string') {
          links.push(parsed);
        }
      } catch {
        if (attachmentsJson.startsWith('http')) {
          links.push(attachmentsJson);
        }
      }
    }
    if (fileUrl && !links.includes(fileUrl)) {
      links.push(fileUrl);
    }
    return links;
  };

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
                Nhắc Việc & Bài Tập (Tasks)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý nhiệm vụ, theo dõi tiến độ nộp bài và trạng thái phản hồi của từng học sinh
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Class Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Users className="h-4 w-4 text-slate-500" />
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedTaskId(null);
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.classname || cls.name}
                  </option>
                ))
              ) : (
                <option value="cls-12a1">Lớp 12A1</option>
              )}
            </select>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Giao Nhiệm Vụ Mới</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, môn học hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tất cả ({classTasks.length})
          </button>
          <button
            onClick={() => setFilterType('requireReply')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterType === 'requireReply'
                ? 'bg-purple-700 text-white'
                : 'bg-white border border-slate-200 text-purple-700 hover:bg-purple-50'
            }`}
          >
            Cần phản hồi ({classTasks.filter((t) => t.requireReply).length})
          </button>
          <button
            onClick={() => setFilterType('optional')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterType === 'optional'
                ? 'bg-slate-700 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Nhắc việc chung ({classTasks.filter((t) => !t.requireReply).length})
          </button>
          <button
            onClick={() => setFilterType('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterType === 'overdue'
                ? 'bg-rose-600 text-white'
                : 'bg-white border border-slate-200 text-rose-600 hover:bg-rose-50'
            }`}
          >
            Quá hạn ({classTasks.filter((t) => t.dueDate < todayStr).length})
          </button>
        </div>
      </div>

      {/* Main Grid: Left Tasks list, Right Submissions and Roster detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Task List (5 columns) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Danh Sách Nhiệm Vụ ({filteredTasks.length})
            </h3>
            <span className="text-[11px] text-slate-400">
              Nhấp để xem danh sách nộp bài
            </span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
              <ListTodo className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              Không tìm thấy nhiệm vụ nào phù hợp với bộ lọc.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isSelected = activeTask?.id === task.id;
              const replies = taskReplies.filter((r) => r.taskId === task.id);
              const isOverdue = task.dueDate < todayStr;
              const totalClassStd = classStudents.length || 1;
              const progressPct = Math.min(
                100,
                Math.round((replies.length / totalClassStd) * 100)
              );

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/40 shadow-xs ring-1 ring-purple-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                        {task.subject || 'Nhiệm vụ'}
                      </span>
                      {task.requireReply ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          Yêu cầu phản hồi
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Nhắc việc chung
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      {isOverdue && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Quá hạn</span>
                        </span>
                      )}
                      <button
                        title="Chỉnh sửa nhiệm vụ"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(task);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title="Xóa nhiệm vụ"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingTaskId(task.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {task.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {task.description}
                  </p>

                  {/* Progress & Due date */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`flex items-center font-medium ${
                        isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'
                      }`}>
                        <Clock className="h-3 w-3 mr-1" />
                        Hạn: {task.dueDate}
                      </span>
                      {task.requireReply ? (
                        <span className="font-bold text-blue-600">
                          {replies.length}/{classStudents.length} đã phản hồi ({progressPct}%)
                        </span>
                      ) : (
                        <span className="text-slate-400">Không bắt buộc nộp</span>
                      )}
                    </div>

                    {task.requireReply && (
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            progressPct >= 100
                              ? 'bg-emerald-500'
                              : progressPct > 50
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Task Details & Submissions Roster (7 columns) */}
        <div className="lg:col-span-7">
          {activeTask ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Task Header Information */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-100 text-purple-700">
                      {activeTask.subject || 'Chung'}
                    </span>
                    {activeTask.requireReply ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 flex items-center space-x-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Bắt buộc phản hồi</span>
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                        Nhắc việc theo dõi
                      </span>
                    )}
                    {activeTask.dueDate < todayStr && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 flex items-center space-x-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Đã quá hạn</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(activeTask)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => setDeletingTaskId(activeTask.id)}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg flex items-center space-x-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {activeTask.title}
                </h3>

                <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1.5">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Hạn chót: <strong className="text-slate-800">{activeTask.dueDate}</strong></span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Tạo ngày: {new Date(activeTask.createdAt).toLocaleDateString('vi-VN')}</span>
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                  {activeTask.description}
                </div>
              </div>

              {/* Progress & Stat Banner */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Sĩ số lớp</p>
                  <p className="text-base font-bold text-slate-800 mt-0.5">
                    {classStudents.length} <span className="text-[11px] font-normal text-slate-500">học sinh</span>
                  </p>
                </div>
                <div className="text-center border-x border-slate-200">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Đã phản hồi</p>
                  <p className="text-base font-bold text-emerald-700 mt-0.5">
                    {repliedCount} <span className="text-[11px] font-normal text-emerald-600">({replyPercentage}%)</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-rose-600 uppercase">Chưa phản hồi</p>
                  <p className="text-base font-bold text-rose-700 mt-0.5">
                    {unrepliedCount} <span className="text-[11px] font-normal text-rose-600">học sinh</span>
                  </p>
                </div>
              </div>

              {/* Roster & Submissions Section */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>Trạng thái nộp bài & phản hồi</span>
                  </h4>

                  {/* Filter Sub-Tabs */}
                  <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setActiveReplyTab('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        activeReplyTab === 'all'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tất cả ({classStudents.length})
                    </button>
                    <button
                      onClick={() => setActiveReplyTab('replied')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                        activeReplyTab === 'replied'
                          ? 'bg-white text-emerald-700 shadow-2xs'
                          : 'text-emerald-700 hover:text-emerald-900'
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Đã phản hồi ({repliedCount})</span>
                    </button>
                    <button
                      onClick={() => setActiveReplyTab('unreplied')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                        activeReplyTab === 'unreplied'
                          ? 'bg-white text-rose-700 shadow-2xs'
                          : 'text-rose-700 hover:text-rose-900'
                      }`}
                    >
                      <XCircle className="h-3 w-3" />
                      <span>Chưa phản hồi ({unrepliedCount})</span>
                    </button>
                  </div>
                </div>

                {displayedRoster.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    Không có học sinh nào trong danh sách lọc này.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {displayedRoster.map(({ student, parent, reply, hasReplied }) => {
                      const attachments = reply
                        ? parseAttachments(reply.attachmentsJson, reply.fileUrl)
                        : [];

                      return (
                        <div
                          key={student.id}
                          className={`p-4 rounded-xl border transition-all ${
                            hasReplied
                              ? 'bg-white border-slate-200 shadow-2xs'
                              : 'bg-rose-50/40 border-rose-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            {/* Student Basic Info */}
                            <div className="flex items-center space-x-3">
                              <img
                                src={
                                  student.avatar ||
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                                }
                                alt={student.fullname || student.fullName}
                                className="h-9 w-9 rounded-full object-cover border border-slate-200"
                              />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h5 className="text-xs font-bold text-slate-900">
                                    {student.fullname || student.fullName}
                                  </h5>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {student.studentCode || student.id}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  PH: {parent?.fatherName || parent?.motherName || 'Chưa cập nhật'} • SĐT: {parent?.phone || 'Chưa có'}
                                </p>
                              </div>
                            </div>

                            {/* Status Tag */}
                            <div>
                              {hasReplied ? (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>Đã phản hồi</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                                  <XCircle className="h-3.5 w-3.5 text-rose-600" />
                                  <span>Chưa phản hồi</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* If has replied: show reply details */}
                          {hasReplied && reply && (
                            <div className="mt-3 pl-12 space-y-2 border-t border-slate-100 pt-2.5">
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span className="text-slate-600 font-medium">Nội dung phản hồi:</span>
                                <span>
                                  Nộp lúc: {new Date(reply.createdAt || reply.submittedAt || '').toLocaleString('vi-VN')}
                                </span>
                              </div>

                              <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                {reply.replyText || reply.content || '(Không có văn bản)'}
                              </p>

                              {/* Attachments / Links */}
                              {attachments.length > 0 && (
                                <div className="space-y-1 pt-1">
                                  <p className="text-[11px] font-bold text-slate-600 flex items-center space-x-1">
                                    <LinkIcon className="h-3 w-3 text-blue-600" />
                                    <span>Tệp / Link đính kèm ({attachments.length}):</span>
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {attachments.map((link, idx) => (
                                      <a
                                        key={idx}
                                        href={link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold transition-colors"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        <span className="truncate max-w-xs">{link}</span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* If NOT replied: show reminder action */}
                          {!hasReplied && (
                            <div className="mt-3 pl-12 flex items-center justify-between border-t border-rose-100 pt-2 text-[11px]">
                              <span className="text-rose-600 font-medium">
                                Cần nộp trước {activeTask.dueDate}
                              </span>
                              {parent?.phone && (
                                <a
                                  href={`tel:${parent.phone}`}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-semibold transition-colors"
                                >
                                  <Phone className="h-3 w-3" />
                                  <span>Gọi PH: {parent.phone}</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              <ListTodo className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              Chọn một nhiệm vụ ở danh sách bên trái để xem tiến độ và phản hồi.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Giao Nhiệm Vụ Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <ListTodo className="h-5 w-5 text-purple-600" />
                <span>Giao Nhiệm Vụ Mới</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Lớp áp dụng
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.classname || cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Môn học / Lĩnh vực
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800"
                  >
                    <option value="Sinh hoạt lớp">Sinh hoạt lớp</option>
                    <option value="Hồ sơ tốt nghiệp">Hồ sơ tốt nghiệp & Ảnh thẻ</option>
                    <option value="Toán học">Toán học</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Tài chính - Hồ sơ">Tài chính - Hồ sơ</option>
                    <option value="Hướng nghiệp">Hướng nghiệp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tiêu đề nhiệm vụ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nộp ảnh thẻ 4x6 và số CCCD cho hồ sơ dự thi..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nội dung & Yêu cầu chi tiết
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả cụ thể yêu cầu bài tập, cách nộp, link tham khảo..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Hạn nộp (Due Date) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800"
                  >
                    <option value="high">Ưu tiên cao</option>
                    <option value="medium">Bình thường</option>
                    <option value="low">Thấp</option>
                  </select>
                </div>
              </div>

              {/* Require Reply Toggle */}
              <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formRequireReply}
                    onChange={(e) => setFormRequireReply(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded-sm border-purple-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-purple-900 block">
                      Yêu cầu học sinh / phụ huynh gửi phản hồi (requireReply = TRUE)
                    </span>
                    <span className="text-[11px] text-purple-700 block mt-0.5">
                      Khi bật tùy chọn này, học sinh trên App sẽ có biểu mẫu gửi nội dung phản hồi và đính kèm link bài làm/ảnh minh chứng.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Giao Nhiệm Vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Chỉnh Sửa Nhiệm Vụ */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Edit2 className="h-5 w-5 text-blue-600" />
                <span>Chỉnh Sửa Nhiệm Vụ</span>
              </h3>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Lớp áp dụng
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.classname || cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Môn học / Lĩnh vực
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800"
                  >
                    <option value="Sinh hoạt lớp">Sinh hoạt lớp</option>
                    <option value="Hồ sơ tốt nghiệp">Hồ sơ tốt nghiệp & Ảnh thẻ</option>
                    <option value="Toán học">Toán học</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Tài chính - Hồ sơ">Tài chính - Hồ sơ</option>
                    <option value="Hướng nghiệp">Hướng nghiệp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tiêu đề nhiệm vụ
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nội dung & Yêu cầu chi tiết
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Hạn nộp
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800"
                  >
                    <option value="high">Ưu tiên cao</option>
                    <option value="medium">Bình thường</option>
                    <option value="low">Thấp</option>
                  </select>
                </div>
              </div>

              {/* Require Reply Toggle */}
              <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formRequireReply}
                    onChange={(e) => setFormRequireReply(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded-sm border-purple-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-purple-900 block">
                      Yêu cầu phản hồi (requireReply = TRUE)
                    </span>
                    <span className="text-[11px] text-purple-700 block mt-0.5">
                      Cho phép học sinh nộp báo cáo và đính kèm đường link bài làm.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xác nhận Xóa */}
      {deletingTaskId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Xác nhận xóa nhiệm vụ?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Thao tác này sẽ xóa nhiệm vụ và toàn bộ thông tin theo dõi liên quan.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTaskId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                {isSubmitting ? 'Đang xóa...' : 'Đồng ý Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
