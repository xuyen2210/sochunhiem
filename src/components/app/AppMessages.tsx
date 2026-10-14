import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Users,
  Phone,
  Mail,
  Clock,
  Sparkles,
  School,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
} from 'lucide-react';
import { Message, Thread, Student, Parent, ClassInfo } from '../../core/types';
import { defaultProvider } from '../../providers/mockProvider';

interface AppMessagesProps {
  students?: Student[];
  parents?: Parent[];
  classes?: ClassInfo[];
  currentStudentId?: string;
  onNavigate?: (route: string) => void;
  onRefresh?: () => Promise<void>;
}

export const AppMessages: React.FC<AppMessagesProps> = ({
  students = [],
  parents = [],
  classes = [],
  currentStudentId,
  onNavigate,
  onRefresh,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentStudentId || students[0]?.id || 'std-01'
  );
  const [userRole, setUserRole] = useState<'PARENT' | 'STUDENT'>('PARENT');
  const [channelType, setChannelType] = useState<'private' | 'class'>('private');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || students[0],
    [students, selectedStudentId]
  );

  const activeParent = useMemo(
    () => parents.find((p) => p.studentId === activeStudent?.id) || parents[0],
    [parents, activeStudent]
  );

  const activeClass = useMemo(
    () => classes.find((c) => c.id === activeStudent?.classId) || classes[0],
    [classes, activeStudent]
  );

  // Compute desired threadKey: either studentId (private) or classId (class channel)
  const targetThreadKey = channelType === 'private' ? activeStudent?.id : activeStudent?.classId;

  // Load threads and messages from mockProvider
  const loadData = async () => {
    setIsLoading(true);
    try {
      const allThreads = await defaultProvider.list<Thread>('threads');
      setThreads(allThreads);

      if (targetThreadKey) {
        // Find or create thread for this targetThreadKey
        let currentThread = allThreads.find(
          (t: Thread) => t.threadKey === targetThreadKey || (channelType === 'private' && t.studentId === targetThreadKey)
        );

        if (!currentThread) {
          const participantList = channelType === 'private'
            ? [
                { role: 'TEACHER', name: activeClass?.homeroomTeacher || 'Thầy Nguyễn Văn Xuyên' },
                { role: 'PARENT', name: activeParent?.fullname || 'Phụ huynh' },
                { role: 'STUDENT', name: activeStudent?.fullname || 'Học sinh' },
              ]
            : [
                { role: 'TEACHER', name: activeClass?.homeroomTeacher || 'Thầy Nguyễn Văn Xuyên' },
                { role: 'ALL', name: `Tập thể ${activeClass?.classname || 'Lớp'}` },
              ];

          currentThread = await defaultProvider.getOrCreateThread(targetThreadKey, {
            classId: activeStudent?.classId,
            studentId: channelType === 'private' ? activeStudent?.id : undefined,
            parentId: channelType === 'private' ? activeParent?.id : undefined,
            participantName: channelType === 'private'
              ? `${activeParent?.fullname || 'Phụ huynh'} (${activeStudent?.fullname})`
              : `Kênh Trao Đổi Chung - ${activeClass?.classname || 'Lớp'}`,
            participantRole: channelType === 'private' ? 'Phụ huynh & Học sinh' : 'Tập thể lớp',
            participantsJson: JSON.stringify(participantList),
          });
        }

        if (currentThread) {
          const msgs = await defaultProvider.listMessages(currentThread.id);
          setMessages(msgs);
        }
      }
    } catch (err) {
      console.error('Error loading messages in AppMessages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStudentId, channelType]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Current active thread
  const activeThread = useMemo(() => {
    return (
      threads.find(
        (t) => t.threadKey === targetThreadKey || (channelType === 'private' && t.studentId === targetThreadKey)
      ) || threads[0]
    );
  }, [threads, targetThreadKey, channelType]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeThread) return;

    setIsSending(true);
    const content = inputText.trim();
    setInputText('');

    const senderName =
      userRole === 'PARENT'
        ? (activeParent?.fullname || activeParent?.fullName || `Phụ huynh em ${activeStudent?.fullname}`)
        : (activeStudent?.fullname || activeStudent?.fullName || 'Học sinh');

    const senderId = userRole === 'PARENT' ? (activeParent?.id || 'par-me') : (activeStudent?.id || 'std-me');

    try {
      const newMsg = await defaultProvider.sendMessage(activeThread.id, {
        fromRole: userRole,
        content,
        senderName,
        senderId,
      });

      setMessages((prev) => [...prev, newMsg]);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickTemplate = (text: string) => {
    setInputText(text);
  };

  const formatMessageTime = (isoString?: string) => {
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            {onNavigate && (
              <button
                onClick={() => onNavigate('/app/portal')}
                className="hover:text-blue-600 flex items-center space-x-1"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Quay lại Cổng học sinh</span>
              </button>
            )}
            <span>•</span>
            <span className="text-slate-700 font-medium">Kênh Tin Nhắn GVCN</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <span>Nhắn Tin & Trao Đổi Với Giáo Viên Chủ Nhiệm</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kênh liên lạc chính thức, bảo mật và tức thì giữa gia đình và nhà trường
          </p>
        </div>

        {/* Student Selector */}
        {students.length > 1 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Học sinh:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-500/20"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullname || st.fullName} ({st.classId})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Teacher Profile / Contact Card */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center font-bold text-lg shrink-0">
            {activeClass?.homeroomTeacher ? activeClass.homeroomTeacher.charAt(activeClass.homeroomTeacher.length - 1) : 'X'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white">
                {activeClass?.homeroomTeacher || 'Thầy Nguyễn Văn Xuyên'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30">
                Đang trực tuyến
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Giáo viên chủ nhiệm {activeClass?.classname || 'Lớp 12A1'} • Bộ môn Toán
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-blue-100">
              <a href="tel:0912345678" className="flex items-center space-x-1 hover:text-white transition-colors">
                <Phone className="h-3 w-3" />
                <span>0912 345 678</span>
              </a>
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Khung giờ tiếp nhận: 07:30 - 18:00</span>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/15 text-xs text-blue-50 max-w-xs">
          <p className="text-[11px] leading-relaxed">
            Tin nhắn gửi đến thầy sẽ được thông báo ngay. Trong trường hợp khẩn cấp, phụ huynh vui lòng gọi điện thoại trực tiếp.
          </p>
        </div>
      </div>

      {/* Control Bar: Role Switcher & Channel Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Role toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-700">Tôi đang nhắn với vai trò:</span>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setUserRole('PARENT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                userRole === 'PARENT'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Phụ huynh ({activeParent?.relationship || 'Bố/Mẹ'})
            </button>
            <button
              onClick={() => setUserRole('STUDENT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                userRole === 'STUDENT'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Học sinh ({activeStudent?.fullname?.split(' ').pop() || 'Em'})
            </button>
          </div>
        </div>

        {/* Channel toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-700">Kênh hội thoại:</span>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setChannelType('private')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                channelType === 'private'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hội thoại riêng ({activeStudent?.fullname?.split(' ').pop()})
            </button>
            <button
              onClick={() => setChannelType('class')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                channelType === 'class'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kênh chung {activeClass?.classname || 'Lớp'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[500px]">
        {/* Chat Header info */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              {channelType === 'private' ? <User className="h-4 w-4" /> : <School className="h-4 w-4" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                {channelType === 'private'
                  ? `Cuộc trao đổi riêng: Thầy GVCN & Gia đình em ${activeStudent?.fullname}`
                  : `Kênh Trao Đổi Chung Lớp ${activeClass?.classname || '12A1'}`}
              </h4>
              <p className="text-[10px] text-slate-500 font-mono">
                Mã hội thoại (threadKey): {targetThreadKey}
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
            Tin nhắn được mã hóa nội bộ
          </span>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/30 max-h-[460px]">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Đang tải lịch sử trao đổi...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <MessageSquare className="h-8 w-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">Chưa có tin nhắn trong kênh này</p>
              <p className="text-[11px] text-slate-400">
                Hãy bắt đầu nhắn tin với Thầy GVCN để trao đổi về tình hình học tập hoặc xin phép nghỉ học.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const roleUpper = (msg.fromRole || (msg.senderRole ? msg.senderRole.toUpperCase() : '')).toUpperCase();
              const isTeacher = roleUpper === 'TEACHER';
              const isMe =
                (userRole === 'PARENT' && roleUpper === 'PARENT') ||
                (userRole === 'STUDENT' && roleUpper === 'STUDENT');

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender metadata */}
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mb-1 px-1">
                    <span
                      className={`font-semibold px-1.5 py-0.5 rounded text-[9px] ${
                        isTeacher
                          ? 'bg-blue-100 text-blue-700'
                          : roleUpper === 'PARENT'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isTeacher ? 'Thầy GVCN' : roleUpper === 'PARENT' ? 'Phụ huynh' : 'Học sinh'}
                    </span>
                    <span>{msg.senderName || (isTeacher ? 'Thầy Xuyên' : 'Tôi')}</span>
                    <span>•</span>
                    <span>{formatMessageTime(msg.createdAt)}</span>
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] md:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs whitespace-pre-line ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : isTeacher
                        ? 'bg-white text-slate-800 border border-blue-200 rounded-tl-none ring-1 ring-blue-100'
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

        {/* Quick Message Templates */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/70 flex items-center space-x-2 overflow-x-auto text-[11px]">
          <span className="text-slate-400 text-[10px] font-medium shrink-0 flex items-center space-x-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Mẫu soạn sẵn:</span>
          </span>

          {userRole === 'PARENT' ? (
            <>
              <button
                type="button"
                onClick={() => handleQuickTemplate(`Thưa thầy, gia đình xin phép cho cháu ${activeStudent?.fullname} nghỉ học ngày hôm nay do bị sốt nhẹ ạ. Cảm ơn thầy!`)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-600 shrink-0 transition-colors"
              >
                Xin phép nghỉ ốm
              </button>
              <button
                type="button"
                onClick={() => handleQuickTemplate(`Thưa thầy, nhờ thầy quan sát giúp tình hình học tập và nề nếp của cháu ${activeStudent?.fullname} tuần này với ạ.`)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-600 shrink-0 transition-colors"
              >
                Hỏi thăm học tập
              </button>
              <button
                type="button"
                onClick={() => handleQuickTemplate(`Dạ gia đình đã nhận được thông báo của nhà trường và sẽ phối hợp đôn đốc cháu thực hiện. Cảm ơn thầy!`)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-600 shrink-0 transition-colors"
              >
                Xác nhận thông báo
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleQuickTemplate(`Thưa thầy, em muốn hỏi thêm về nội dung ôn tập kiểm tra giữa kỳ sắp tới ạ.`)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-600 shrink-0 transition-colors"
              >
                Hỏi bài ôn tập
              </button>
              <button
                type="button"
                onClick={() => handleQuickTemplate(`Dạ em đã hoàn thành bài tập và nộp trên hệ thống rồi thầy nhé!`)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-600 shrink-0 transition-colors"
              >
                Báo đã nộp bài
              </button>
              <button
                type="button"
                onClick={() => handleQuickTemplate(`Thưa thầy, em xin phép đến lớp trễ 15 phút sáng mai vì xe của em có chút trục trặc ạ.`)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-600 shrink-0 transition-colors"
              >
                Báo xin phép trễ
              </button>
            </>
          )}
        </div>

        {/* Input composer */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder={
              userRole === 'PARENT'
                ? `Nhập tin nhắn phụ huynh gửi Thầy GVCN (${activeClass?.homeroomTeacher || 'Thầy Xuyên'})...`
                : `Em nhập câu hỏi hoặc tin nhắn gửi Thầy GVCN...`
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white"
          />
          <button
            type="submit"
            disabled={isSending || !inputText.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50 shrink-0 flex items-center space-x-1 px-4"
          >
            <Send className="h-4 w-4" />
            <span className="text-xs font-semibold hidden sm:inline">Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
};
