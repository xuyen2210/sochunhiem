import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Users,
  Phone,
  Search,
  Filter,
  Plus,
  CheckCheck,
  Clock,
  Sparkles,
  School,
  X,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Message, Thread, Parent, Student, ClassInfo } from '../../core/types';
import { defaultProvider } from '../../providers/mockProvider';

interface AdminMessagesProps {
  threads: Thread[];
  messages: Message[];
  parents?: Parent[];
  students?: Student[];
  classes?: ClassInfo[];
  currentClassId?: string;
  onSendMessage?: (
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
  ) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

export const AdminMessages: React.FC<AdminMessagesProps> = ({
  threads = [],
  messages = [],
  parents = [],
  students = [],
  classes = [],
  currentClassId = 'cls-12a1',
  onSendMessage,
  onRefresh,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(currentClassId);
  const [selectedThreadId, setSelectedThreadId] = useState<string>(threads[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'students' | 'class'>('all');
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedThreadId]);

  // If selectedThreadId is not in threads or empty, pick the first
  useEffect(() => {
    if ((!selectedThreadId || !threads.some((t) => t.id === selectedThreadId)) && threads.length > 0) {
      setSelectedThreadId(threads[0].id);
    }
  }, [threads, selectedThreadId]);

  // Format timestamp
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      }
      return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
    } catch {
      return isoString;
    }
  };

  // Helper to parse participantsJson
  const parseParticipants = (participantsJson?: string) => {
    if (!participantsJson) return [];
    try {
      return JSON.parse(participantsJson);
    } catch {
      return [];
    }
  };

  // Filter threads based on class, search query, and filter type
  const filteredThreads = useMemo(() => {
    return threads.filter((thr) => {
      // Class filter: check if thr matches selectedClassId (either classId or threadKey matches class)
      const matchesClass =
        !selectedClassId ||
        thr.classId === selectedClassId ||
        thr.threadKey === selectedClassId ||
        students.some((s) => s.id === thr.threadKey && s.classId === selectedClassId);

      if (!matchesClass) return false;

      // Filter type
      const isClassChannel = thr.threadKey?.startsWith('cls-') || thr.id?.includes('cls');
      if (filterType === 'students' && isClassChannel) return false;
      if (filterType === 'class' && !isClassChannel) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const student = students.find((s) => s.id === thr.threadKey || s.id === thr.studentId);
        const parent = parents.find((p) => p.studentId === thr.threadKey || p.id === thr.parentId);
        const nameMatches =
          (thr.participantName || '').toLowerCase().includes(q) ||
          (student?.fullname || student?.fullName || '').toLowerCase().includes(q) ||
          (parent?.fullname || parent?.fullName || '').toLowerCase().includes(q) ||
          (thr.threadKey || '').toLowerCase().includes(q) ||
          (thr.lastMessage || '').toLowerCase().includes(q);
        if (!nameMatches) return false;
      }

      return true;
    });
  }, [threads, selectedClassId, filterType, searchQuery, students, parents]);

  const activeThread = threads.find((t) => t.id === selectedThreadId) || filteredThreads[0];
  const activeMessages = useMemo(() => {
    if (!activeThread) return [];
    return messages
      .filter((m) => m.threadId === activeThread.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, activeThread]);

  // Associated student and parent for activeThread
  const activeStudent = useMemo(() => {
    if (!activeThread) return undefined;
    return students.find((s) => s.id === activeThread.threadKey || s.id === activeThread.studentId);
  }, [students, activeThread]);

  const activeParent = useMemo(() => {
    if (!activeThread) return undefined;
    return parents.find(
      (p) =>
        p.id === activeThread.parentId ||
        (activeStudent && p.studentId === activeStudent.id) ||
        p.studentId === activeThread.threadKey
    );
  }, [parents, activeThread, activeStudent]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeThread) return;

    setIsSending(true);
    const content = inputText.trim();
    setInputText('');

    try {
      if (onSendMessage) {
        await onSendMessage(activeThread.id, {
          fromRole: 'TEACHER',
          content,
          senderName: 'Thầy Nguyễn Văn Xuyên (GVCN)',
          senderId: 'teacher-xuyen',
        });
      } else {
        await defaultProvider.sendMessage(activeThread.id, {
          fromRole: 'TEACHER',
          content,
          senderName: 'Thầy Nguyễn Văn Xuyên (GVCN)',
          senderId: 'teacher-xuyen',
        });
        if (onRefresh) await onRefresh();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setInputText(text);
  };

  const handleCreateNewThreadForStudent = async (student: Student) => {
    const parent = parents.find((p) => p.studentId === student.id);
    const participants = [
      { role: 'TEACHER', name: 'Thầy Nguyễn Văn Xuyên' },
      { role: 'PARENT', name: parent ? (parent.fullname || parent.fullName) : `Phụ huynh em ${student.fullname || student.fullName}` },
      { role: 'STUDENT', name: student.fullname || student.fullName },
    ];

    const threadKey = student.id;
    const existing = threads.find((t) => t.threadKey === threadKey);

    if (existing) {
      setSelectedThreadId(existing.id);
      setIsNewChatModalOpen(false);
      return;
    }

    try {
      const newThr = await defaultProvider.getOrCreateThread(threadKey, {
        classId: student.classId,
        studentId: student.id,
        parentId: parent?.id,
        participantName: `${parent ? (parent.fullname || parent.fullName) : 'Phụ huynh'} (${student.fullname || student.fullName})`,
        participantRole: 'Phụ huynh & Học sinh',
        participantsJson: JSON.stringify(participants),
      });

      if (onRefresh) await onRefresh();
      setSelectedThreadId(newThr.id);
      setIsNewChatModalOpen(false);
    } catch (err) {
      console.error('Error creating thread:', err);
    }
  };

  const handleCreateNewThreadForClass = async () => {
    const threadKey = selectedClassId;
    const currentCls = classes.find((c) => c.id === selectedClassId);
    const clsName = currentCls?.classname || currentCls?.name || 'Lớp 12A1';

    const participants = [
      { role: 'TEACHER', name: 'Thầy Nguyễn Văn Xuyên' },
      { role: 'ALL', name: `Tập thể ${clsName}` },
    ];

    try {
      const newThr = await defaultProvider.getOrCreateThread(threadKey, {
        classId: selectedClassId,
        participantName: `Kênh Trao Đổi Chung - ${clsName}`,
        participantRole: 'Tập thể lớp',
        participantsJson: JSON.stringify(participants),
      });

      if (onRefresh) await onRefresh();
      setSelectedThreadId(newThr.id);
      setIsNewChatModalOpen(false);
    } catch (err) {
      console.error('Error creating class thread:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <span>Hộp Thư Trao Đổi GVCN (Messages & Inbox)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kênh liên lạc trực tiếp theo lớp hoặc từng học sinh & phụ huynh
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Class Selector */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.classname || cls.name} ({cls.grade || 'Khối 12'})
              </option>
            ))}
          </select>

          {/* New Message Button */}
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Bắt đầu cuộc trò chuyện</span>
          </button>
        </div>
      </div>

      {/* Main Inbox Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Column: Thread List (4 or 5 cols) */}
        <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/60">
          {/* Search & Filter Header */}
          <div className="p-3.5 border-b border-slate-200 space-y-2.5 bg-white">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm phụ huynh, học sinh hoặc mã..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center space-x-1 text-[11px]">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tất cả ({threads.length})
              </button>
              <button
                onClick={() => setFilterType('students')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterType === 'students'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Học sinh
              </button>
              <button
                onClick={() => setFilterType('class')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterType === 'class'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Kênh lớp
              </button>
            </div>
          </div>

          {/* Threads List Scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <MessageSquare className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p>Không tìm thấy cuộc trò chuyện nào phù hợp</p>
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="mt-3 text-blue-600 font-semibold hover:underline inline-flex items-center space-x-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Bắt đầu cuộc trò chuyện mới</span>
                </button>
              </div>
            ) : (
              filteredThreads.map((thr) => {
                const isSelected = thr.id === (activeThread?.id || selectedThreadId);
                const isClass = thr.threadKey?.startsWith('cls-') || thr.id?.includes('cls');
                const lastTime = formatTime(thr.lastMessageAt || thr.lastMessageTime);
                const participants = parseParticipants(thr.participantsJson);

                return (
                  <div
                    key={thr.id}
                    onClick={() => setSelectedThreadId(thr.id)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-blue-50/90 border-l-4 border-blue-600 shadow-2xs'
                        : 'hover:bg-slate-100/70 bg-white'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                        isClass
                          ? 'bg-indigo-600 text-white'
                          : isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isClass ? (
                        <School className="h-5 w-5" />
                      ) : (
                        (thr.participantName || 'PH').charAt(0)
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {thr.participantName || (isClass ? 'Kênh chung Lớp' : 'Hội thoại phụ huynh')}
                        </h4>
                        {lastTime && (
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {lastTime}
                          </span>
                        )}
                      </div>

                      {/* Thread key badge */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          {thr.threadKey}
                        </span>
                        {participants.length > 0 && (
                          <span className="text-[10px] text-slate-400">
                            • {participants.length} thành viên
                          </span>
                        )}
                      </div>

                      {/* Snippet */}
                      <p className="text-[11px] text-slate-500 truncate mt-1">
                        {thr.lastMessage || 'Chưa có tin nhắn...'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white h-full">
          {activeThread ? (
            <>
              {/* Conversation Top Header */}
              <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
                    {activeThread.threadKey?.startsWith('cls-') ? (
                      <School className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {activeThread.participantName || 'Cuộc trao đổi'}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200">
                        threadKey: {activeThread.threadKey}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      {activeStudent && (
                        <span>Học sinh: <strong className="text-slate-700">{activeStudent.fullname || activeStudent.fullName}</strong></span>
                      )}
                      {activeParent?.phone && (
                        <a
                          href={`tel:${activeParent.phone}`}
                          className="text-blue-600 hover:underline flex items-center space-x-1"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{activeParent.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Trực tuyến</span>
                  </span>
                </div>
              </div>

              {/* Message Bubbles History */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/40 max-h-[500px]">
                {activeMessages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    <MessageSquare className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p>Chưa có tin nhắn nào trong hội thoại này.</p>
                    <p className="text-[11px] mt-1 text-slate-500">
                      Hãy gửi lời chào hoặc trao đổi cùng gia đình học sinh.
                    </p>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const roleUpper = (msg.fromRole || (msg.senderRole ? msg.senderRole.toUpperCase() : 'TEACHER')).toUpperCase();
                    const isTeacher = roleUpper === 'TEACHER';
                    const isParent = roleUpper === 'PARENT';
                    const isStudent = roleUpper === 'STUDENT';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isTeacher ? 'items-end' : 'items-start'}`}
                      >
                        {/* Sender info line */}
                        <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mb-1 px-1">
                          <span
                            className={`font-semibold px-1.5 py-0.5 rounded text-[9px] ${
                              isTeacher
                                ? 'bg-blue-100 text-blue-700'
                                : isParent
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {isTeacher ? 'GVCN' : isParent ? 'Phụ huynh' : 'Học sinh'}
                          </span>
                          <span>{msg.senderName || (isTeacher ? 'Thầy Xuyên' : 'Người gửi')}</span>
                          <span>•</span>
                          <span>{formatTime(msg.createdAt)}</span>
                        </div>

                        {/* Bubble */}
                        <div
                          className={`max-w-[80%] md:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs whitespace-pre-line ${
                            isTeacher
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : isParent
                              ? 'bg-emerald-50 text-slate-800 border border-emerald-200 rounded-tl-none'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Pills */}
              <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/70 flex items-center space-x-2 overflow-x-auto text-[11px]">
                <span className="text-slate-400 text-[10px] font-medium shrink-0 flex items-center space-x-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>Gợi ý:</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickReply('Dạ em đã nhận được thông tin từ gia đình và sẽ lưu ý ạ.')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-600 shrink-0 transition-colors"
                >
                  Đã nhận thông tin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickReply('Thầy đã kiểm tra và ghi nhận. Gia đình hoàn toàn yên tâm nhé!')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-600 shrink-0 transition-colors"
                >
                  Gia đình yên tâm
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickReply('Cảm ơn phụ huynh đã kịp thời thông tin cho thầy và nhà trường.')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-600 shrink-0 transition-colors"
                >
                  Cảm ơn phụ huynh
                </button>
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2"
              >
                <input
                  type="text"
                  placeholder="Nhập nội dung trao đổi cùng phụ huynh/học sinh..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400 text-xs">
              <MessageSquare className="h-10 w-10 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">Chọn cuộc trò chuyện bên trái</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Hoặc nhấn nút "Bắt đầu cuộc trò chuyện" để mở liên lạc với học sinh/phụ huynh mới.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Start New Chat */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Bắt Đầu Cuộc Trò Chuyện Mới
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Chọn học sinh hoặc mở kênh chung của lớp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Class wide option */}
            <div
              onClick={handleCreateNewThreadForClass}
              className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl cursor-pointer hover:bg-blue-100/70 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <School className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-950">
                    Kênh Trao Đổi Chung Cả Lớp ({selectedClassId})
                  </h4>
                  <p className="text-[10px] text-blue-700">
                    Gửi thông điệp đến toàn thể phụ huynh & học sinh của lớp
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-blue-600" />
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 mb-2">
                Hoặc Chọn Học Sinh Trong Lớp ({students.filter((s) => s.classId === selectedClassId).length} HS):
              </h4>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {students
                  .filter((s) => !selectedClassId || s.classId === selectedClassId)
                  .map((student) => {
                    const parent = parents.find((p) => p.studentId === student.id);

                    return (
                      <div
                        key={student.id}
                        onClick={() => handleCreateNewThreadForStudent(student)}
                        className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                            {(student.fullname || student.fullName || 'H').charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {student.fullname || student.fullName}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Mã HS: {student.id} • PH: {parent ? (parent.fullname || parent.fullName) : 'Chưa có thông tin'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
